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
import { SocketClientService } from 'src/app/services/websocket-services/general/socket-client-manager.service';
import { environment } from 'src/environments/environment';

@Injectable({
    providedIn: 'root',
})
export class AuthService {
    private readonly baseUrl = `${environment.serverUrl}/users`;
    private userBS: BehaviorSubject<User | null> = new BehaviorSubject<User | null>(null);
    private googleProvider = new GoogleAuthProvider();
    private loadingTokenBS = new BehaviorSubject<boolean>(true);
    private tokenBS: BehaviorSubject<string | null> = new BehaviorSubject<string | null>(null);
    private isAuthenticating = false;
    // eslint-disable-next-line @typescript-eslint/member-ordering
    user$ = this.userBS.asObservable();
    // eslint-disable-next-line @typescript-eslint/member-ordering
    loadingToken$ = this.loadingTokenBS.asObservable();
    // eslint-disable-next-line @typescript-eslint/member-ordering
    token$ = this.tokenBS.asObservable();

    constructor(
        private auth: Auth,
        private http: HttpClient,
        private injector: Injector,
        private router: Router,
        private firestore: Firestore,
        private socketService: SocketClientService,
    ) {
        this.monitorTokenChanges();
    }

    // Necessary to remove circular dependency
    getSocketService() {
        return this.socketService;
    }

    signUp(username: string, email: string, password: string): Observable<User> {
        this.isAuthenticating = true;
        return this.createUser(email, password).pipe(
            switchMap((userCredential) => this.updateUserProfile(userCredential.user, { displayName: username }).pipe(map(() => userCredential))),
            switchMap((userCredential) =>
                this.handleAuthAndFetchUser(userCredential, `${this.baseUrl}/create-user`, 'POST').pipe(
                    finalize(() => (this.isAuthenticating = false)),
                ),
            ),
            handleErrorsGlobally(this.injector),
        );
    }

    login(identifier: string, password: string): Observable<User> {
        this.isAuthenticating = true;
        return this.getEmailFromIdentifier(identifier).pipe(
            switchMap((email) =>
                this.signInUser(email, password).pipe(
                    switchMap((userCredential) =>
                        this.isUserOnline(userCredential.user.uid).pipe(
                            switchMap((isOnline) => {
                                if (isOnline) {
                                    return from(this.auth.signOut()).pipe(
                                        switchMap(() => throwError(() => new Error("L'utilisateur est déjà connecté sur un autre appareil. "))),
                                    );
                                }
                                return this.handleAuthAndFetchUser(userCredential, `${this.baseUrl}/profile`);
                            }),
                        ),
                    ),
                ),
            ),
            finalize(() => (this.isAuthenticating = false)),
            handleErrorsGlobally(this.injector),
        );
    }

    signWithGoogle(): Observable<User> {
        this.isAuthenticating = true;
        return this.signInWithGoogleSDK().pipe(
            switchMap((userCredential) =>
                this.isUserOnline(userCredential.user.uid).pipe(
                    switchMap((isOnline) => {
                        if (isOnline) {
                            return from(this.auth.signOut()).pipe(
                                switchMap(() => throwError(() => new Error("L'utilisateur est déjà connecté sur un autre appareil. "))),
                            );
                        }
                        return this.updateUserProfile(userCredential.user, {
                            displayName: userCredential.user.displayName,
                        }).pipe(switchMap(() => this.handleAuthAndFetchUser(userCredential, `${this.baseUrl}/signin-google`, 'POST')));
                    }),
                ),
            ),
            finalize(() => (this.isAuthenticating = false)),
            handleErrorsGlobally(this.injector),
        );
    }

    logout(): void {
        const currentUser = this.auth.currentUser;
        if (currentUser) {
            const userDocRef = doc(this.firestore, `users/${currentUser.uid}`);
            this.tokenBS.next(null);
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
        return !!this.userBS.value;
    }

    setUser(user: User): void {
        this.userBS.next(user);
    }

    async getToken(): Promise<string> {
        const currentUser = this.auth.currentUser;
        if (!currentUser) {
            throw new Error('User not authenticated.');
        }

        try {
            return await currentUser.getIdToken();
        } catch (error) {
            throw new Error('Failed to retrieve authentication token.');
        }
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
                const options = { headers: { Authorization: `Bearer ${idToken}` } };
                // this.socketService.connect(idToken);
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
            if (this.isAuthenticating) {
                return;
            }
            if (firebaseUser) {
                try {
                    const idToken = await firebaseUser.getIdToken();
                    if (!idToken) throw new Error('Votre session a expiré. Veuillez vous reconnecter.');
                    this.tokenBS.next(idToken);
                    this.socketService.disconnect();
                    this.socketService.connect(idToken);
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
                    this.tokenBS.next(null);
                    this.socketService.disconnect();
                    this.logout();
                }
            } else {
                this.userBS.next(null);
                this.loadingTokenBS.next(false);
                this.tokenBS.next(null);
                this.socketService.disconnect();
                this.router.navigate(['/login']);
            }
        });
    }

    private signOutAndClearSession(): void {
        this.tokenBS.next(null);
        this.socketService.disconnect();
        from(this.auth.signOut())
            .pipe(
                handleErrorsGlobally(this.injector),
                finalize(() => this.clearSession()),
            )
            .subscribe();
    }

    private clearSession(): void {
        this.tokenBS.next(null);
        this.router.navigate(['/login']);
    }

    private isUserOnline(uid: string | null): Observable<boolean> {
        if (!uid) {
            return of(false);
        }

        const usersCollection = collection(this.firestore, 'users');
        const uidQuery = query(usersCollection, where('uid', '==', uid));

        return from(getDocs(uidQuery)).pipe(
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

    private getEmailFromIdentifier(identifier: string): Observable<string> {
        if (identifier.includes('@')) {
            return new Observable((observer) => {
                observer.next(identifier);
                observer.complete();
            });
        }

        return this.http
            .get<{ email: string }>(`${this.baseUrl}/get-email`, {
                params: { username: identifier },
            })
            .pipe(map((response) => response.email));
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
