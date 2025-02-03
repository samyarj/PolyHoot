/* eslint-disable @typescript-eslint/naming-convention */
import { HttpClient } from '@angular/common/http';
import { Injectable, Injector } from '@angular/core';
import {
    Auth,
    createUserWithEmailAndPassword,
    GoogleAuthProvider,
    signInWithEmailAndPassword,
    signInWithPopup,
    updateProfile,
    UserCredential,
} from '@angular/fire/auth';
import { Firestore } from '@angular/fire/firestore';
import { Router } from '@angular/router';
import { User } from '@app/interfaces/user';
import { handleErrorsGlobally } from '@app/utils/rxjs-operators';
import { collection, doc, getDocs, query, updateDoc, where } from '@firebase/firestore';
import { User as FirebaseUser, onIdTokenChanged, sendPasswordResetEmail } from 'firebase/auth';
import { BehaviorSubject, catchError, finalize, from, map, Observable, of, switchMap, throwError } from 'rxjs';
import { environment } from 'src/environments/environment';

@Injectable({
    providedIn: 'root',
})
export class AuthService {
    private readonly baseUrl = `${environment.serverUrl}/users`;
    private userBS: BehaviorSubject<User | null> = new BehaviorSubject<User | null>(null);
    private googleProvider = new GoogleAuthProvider();
    private loadingTokenBS = new BehaviorSubject<boolean>(true);
    user$ = this.userBS.asObservable();
    loadingToken$ = this.loadingTokenBS.asObservable();

    constructor(
        private auth: Auth,
        private http: HttpClient,
        private injector: Injector,
        private router: Router,
        private firestore: Firestore,
    ) {
        this.monitorTokenChanges();
    }

    signUp(username: string, email: string, password: string): Observable<User> {
        return this.createUser(email, password).pipe(
            switchMap((userCredential) =>
                this.updateUserProfile(userCredential.user, {
                    displayName: username,
                }).pipe(map(() => userCredential)),
            ),
            switchMap((userCredential) => this.handleAuthAndFetchUser(userCredential, `${this.baseUrl}/create-user`, 'POST')),
            handleErrorsGlobally(this.injector),
        );
    }

    login(email: string, password: string): Observable<User> {
        return this.isUserOnline(email).pipe(
            switchMap((isOnline) => {
                if (isOnline) {
                    throw new Error('User is already logged in on another device.');
                }
                return this.signInUser(email, password);
            }),
            switchMap((userCredential) => this.handleAuthAndFetchUser(userCredential, `${this.baseUrl}/profile`)),
            catchError((error) => {
                console.error('Error in login function:', error);
                return throwError(() => error); // Pass errors up the chain
            }),
            handleErrorsGlobally(this.injector),
        );
    }

    signWithGoogle(): Observable<User> {
        return this.signInWithGoogleSDK().pipe(
            switchMap((userCredential) =>
                // Check if the user is online
                this.isUserOnline(userCredential.user.email).pipe(
                    switchMap((isOnline) => {
                        if (isOnline) throw new Error('User is already logged in on another device.');

                        // Update user profile
                        return this.updateUserProfile(userCredential.user, {
                            displayName: userCredential.user.displayName,
                        }).pipe(
                            // Fetch or create user from backend
                            switchMap(() => this.handleAuthAndFetchUser(userCredential, `${this.baseUrl}/signin-google`, 'POST')),
                        );
                    }),
                ),
            ),
            handleErrorsGlobally(this.injector),
        );
    }

    logout(): void {
        const currentUser = this.auth.currentUser;
        console.log('logout called');
        if (currentUser) {
            const userDocRef = doc(this.firestore, `users/${currentUser.uid}`);

            from(updateDoc(userDocRef, { isOnline: false }))
                .pipe(
                    handleErrorsGlobally(this.injector),
                    finalize(() => this.signOutAndClearSession()),
                )
                .subscribe();
        } else {
            this.signOutAndClearSession();
        }
    }

    isAuthenticated(): boolean {
        // return !!localStorage.getItem('token');
        return !!this.userBS.value;
    }

    setUser(user: User): void {
        this.userBS.next(user);
    }

    checkingUsername(username: string): Observable<boolean> {
        return this.http
            .get<{ usernameExists: boolean }>(`${this.baseUrl}/check-username`, {
                params: { username },
            })
            .pipe(map((response) => response.usernameExists));
    }

    checkingEmail(email: string): Observable<{ emailExists: boolean; provider: string }> {
        return this.http.get<{ emailExists: boolean; provider: string }>(`${this.baseUrl}/check-email`, {
            params: { email },
        });
    }

    forgotPassword(email: string): Observable<void> {
        this.auth.languageCode = 'fr';
        return from(sendPasswordResetEmail(this.auth, email)).pipe(handleErrorsGlobally(this.injector));
    }

    getUser(): User | null {
        return this.userBS.value;
    }

    private handleAuthAndFetchUser(userCredential: UserCredential, endpoint: string, method: 'GET' | 'POST' = 'GET'): Observable<User> {
        return from(userCredential.user.getIdToken()).pipe(
            switchMap((idToken) => {
                // localStorage.setItem('token', idToken);
                const options = { headers: { Authorization: `Bearer ${idToken}` } };

                switch (method) {
                    case 'GET':
                        return this.http.get<User>(endpoint, options);
                    case 'POST':
                        return this.http.post<User>(endpoint, {}, options);
                    default:
                        throw new Error(`Unsupported HTTP method: ${method}`);
                }
            }),
        );
    }

    private monitorTokenChanges(): void {
        this.loadingTokenBS.next(true);

        onIdTokenChanged(this.auth, async (firebaseUser) => {
            if (firebaseUser) {
                try {
                    const idToken = await firebaseUser.getIdToken();
                    if (!idToken) throw new Error('Invalid token');

                    this.http
                        .get<User>(`${this.baseUrl}/profile`, {
                            headers: { Authorization: `Bearer ${idToken}` },
                        })
                        .pipe(finalize(() => this.loadingTokenBS.next(false)))
                        .subscribe({
                            next: (user) => this.userBS.next(user),
                            error: () => this.logout(),
                        });
                } catch {
                    this.loadingTokenBS.next(false);
                    this.logout();
                }
            } else {
                this.userBS.next(null);
                this.loadingTokenBS.next(false);
            }
        });
    }

    private signOutAndClearSession(): void {
        from(this.auth.signOut())
            .pipe(
                handleErrorsGlobally(this.injector),
                finalize(() => this.clearSession()),
            )
            .subscribe();
    }

    private clearSession(): void {
        // localStorage.removeItem('token');
        this.userBS.next(null);
        this.router.navigate(['/login']);
    }

    private isUserOnline(email: string | null): Observable<boolean> {
        if (!email) {
            return of(false);
        }

        const usersCollection = collection(this.firestore, 'users');
        const emailQuery = query(usersCollection, where('email', '==', email));

        return from(getDocs(emailQuery)).pipe(
            map((querySnapshot) => {
                if (querySnapshot.empty) {
                    return false;
                }

                const userDoc = querySnapshot.docs[0];
                return userDoc.data()?.isOnline === true;
            }),
            catchError(() => of(false)),
        );
    }

    private signInWithGoogleSDK(): Observable<UserCredential> {
        return from(signInWithPopup(this.auth, this.googleProvider));
    }

    private createUser(email: string, password: string): Observable<UserCredential> {
        return from(createUserWithEmailAndPassword(this.auth, email, password));
    }

    private signInUser(email: string, password: string): Observable<UserCredential> {
        return from(signInWithEmailAndPassword(this.auth, email, password));
    }

    private updateUserProfile(user: FirebaseUser, profileData: Partial<Pick<FirebaseUser, 'displayName' | 'photoURL'>>): Observable<void> {
        return from(updateProfile(user, profileData));
    }
}
