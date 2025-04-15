/* eslint-disable @typescript-eslint/no-magic-numbers */
/* eslint-disable max-lines */
import { SocketClientService } from './../websocket-services/general/socket-client-manager.service';
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
import { doc, Firestore, updateDoc } from '@angular/fire/firestore';
import { FormGroup } from '@angular/forms';
import { Router } from '@angular/router';
import { ConnectEvents } from '@app/constants/enum-class';
import { User } from '@app/interfaces/user';
import { EnvironmentService } from '@app/services/environment/environment.service';
import { ReportService } from '@app/services/report-service';
import { handleErrorsGlobally } from '@app/utils/rxjs-operators';
import { collection, getDocs, onSnapshot, query, runTransaction, where } from '@firebase/firestore';
import { User as FirebaseUser, getAuth, onIdTokenChanged, sendPasswordResetEmail } from 'firebase/auth';
import { BehaviorSubject, catchError, finalize, from, map, Observable, of, switchMap, tap, throwError } from 'rxjs';
import { environment } from 'src/environments/environment';
// eslint-disable-next-line no-restricted-imports

@Injectable({
    providedIn: 'root',
})
export class AuthService {
    private readonly baseUrl = `${environment.serverUrl}/users`;
    private userBS: BehaviorSubject<User | null> = new BehaviorSubject<User | null>(null);
    private googleProvider = new GoogleAuthProvider();
    private loadingTokenBS = new BehaviorSubject<boolean>(false);
    private tokenBS: BehaviorSubject<string | null> = new BehaviorSubject<string | null>(null);
    private isAuthenticating = false;
    private isSigningUp = false;
    private isPostSignupSetup = false;
    private clientIsIdentified = false;
    private userSnapshotUnsubscribe: (() => void) | null = null;
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
        private socketClientService: SocketClientService,
        private reportService: ReportService,
        private environmentService: EnvironmentService, // @Inject(WINDOW) private window: Window,
    ) {
        this.user$.subscribe({
            next: (user: User | null) => {
                if (user && user.nbReport !== undefined) {
                    if (user.nbReport >= 2) {
                        this.reportService.behaviourWarning();
                    }
                    this.reportService.getReportState(user.uid).subscribe({
                        next: (value: { message: string; isBanned: boolean }) => {
                            if (value.isBanned) {
                                this.enforceBan(value.message);
                            }
                        },
                    });
                }
            },
        });
        this.reportService.subscribeToToken(this.token$);
        this.monitorTokenChanges();
    }

    // Necessary to remove circular dependency
    getSocketService() {
        return this.socketClientService;
    }
    // Necessary to remove circular dependency
    getReportService() {
        return this.reportService;
    }
    signUp(username: string, email: string, password: string, avatarURL: string): Observable<User> {
        this.isSigningUp = true;
        return this.createUser(email, password).pipe(
            switchMap((userCredential) =>
                this.updateUserProfile(userCredential.user, { displayName: username, photoURL: avatarURL }).pipe(map(() => userCredential)),
            ),
            switchMap((userCredential) =>
                this.handleAuthAndFetchUser(userCredential, `${this.baseUrl}/create-user`, 'POST', avatarURL).pipe(
                    tap((user) => {
                        // Store the user right away to prevent logout
                        this.userBS.next(user);
                    }),
                    finalize(() => {
                        this.isPostSignupSetup = true; // Set flag before changing isSigningUp
                        this.isSigningUp = false;
                        this.setupTokenListener(userCredential.user);
                    }),
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
                        this.isUserBanned(userCredential.user.uid).pipe(
                            switchMap(({ isBanned, message }) => {
                                if (isBanned) {
                                    return from(this.auth.signOut()).pipe(switchMap(() => throwError(() => new Error(message))));
                                } else {
                                    return this.isUserOnline(userCredential.user.uid).pipe(
                                        switchMap((isOnline) => {
                                            if (isOnline === true || isOnline === null) {
                                                return from(this.auth.signOut()).pipe(
                                                    switchMap(() =>
                                                        throwError(() => new Error("L'utilisateur est déjà connecté sur un autre appareil.")),
                                                    ),
                                                );
                                            }
                                            return this.handleAuthAndFetchUser(userCredential, `${this.baseUrl}/profile`);
                                        }),
                                    );
                                }
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
                        if (isOnline === true || isOnline === null) {
                            return from(this.auth.signOut()).pipe(
                                switchMap(() => throwError(() => new Error("L'utilisateur est déjà connecté sur un autre appareil."))),
                            );
                        }
                        return this.updateUserProfile(userCredential.user, {
                            displayName: userCredential.user.displayName,
                        }).pipe(
                            switchMap(() =>
                                this.isUserBanned(userCredential.user.uid).pipe(
                                    switchMap(({ isBanned, message }) => {
                                        if (isBanned) {
                                            return from(this.auth.signOut()).pipe(switchMap(() => throwError(() => new Error(message))));
                                        }
                                        return this.handleAuthAndFetchUser(userCredential, `${this.baseUrl}/signin-google`, 'POST');
                                    }),
                                ),
                            ),
                        );
                    }),
                ),
            ),
            finalize(() => (this.isAuthenticating = false)),
            handleErrorsGlobally(this.injector),
        );
    }

    logout(): void {
        const currentUser = this.auth.currentUser;
        if (this.userSnapshotUnsubscribe) {
            this.userSnapshotUnsubscribe();
            this.userSnapshotUnsubscribe = null;
        }
        if (currentUser) {
            const userDocRef = doc(this.firestore, `users/${currentUser.uid}`);
            console.log(`Setting isOnline to false for connected user at ${new Date()}`);
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

    checkingUsername(username: string): Observable<boolean> {
        return this.http
            .get<{ usernameExists: boolean }>(`${this.baseUrl}/check-username`, {
                params: { username },
            })
            .pipe(map((response) => response.usernameExists));
    }

    handleUsernameCheck(
        formGroup: FormGroup,
        currentUsername: string,
        setIsTyping: (value: boolean) => void,
        setIsChecking: (value: boolean) => void,
        setIsTaken: (value: boolean) => void,
    ): void {
        const username = formGroup.controls.username.value.toString().trim();
        formGroup.controls.username.setValue(username);
        setIsTyping(true);

        if (!username || username === currentUsername || formGroup.get('username')?.hasError('pattern')) {
            setIsTyping(false);
            return;
        }

        setIsTaken(false);
        setIsChecking(true);

        this.checkingUsername(username).subscribe({
            next: (isTaken) => {
                setIsChecking(false);
                setIsTyping(false);
                setIsTaken(isTaken);
            },
            error: () => {
                setIsChecking(false);
                setIsTyping(false);
            },
        });
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

    private setIsOnline(status: boolean, uid: string | null): void {
        if (!uid) return;

        const userDocRef = doc(this.firestore, `users/${uid}`);

        runTransaction(this.firestore, async (transaction) => {
            const userDoc = await transaction.get(userDocRef);
            if (!userDoc.exists()) {
                throw new Error('User document does not exist');
            }

            transaction.update(userDocRef, {
                isOnline: status,
            });
        }).catch((error) => {
            console.error('Transaction failed: ', error);
        });
    }

    private handleAuthAndFetchUser(
        userCredential: UserCredential,
        endpoint: string,
        method: 'GET' | 'POST' = 'GET',
        avatarURL?: string,
    ): Observable<User> {
        return from(userCredential.user.getIdToken()).pipe(
            switchMap((idToken) => {
                const options = { headers: { Authorization: `Bearer ${idToken}` } };
                this.tokenBS.next(idToken);
                this.socketClientService.disconnect();
                this.socketClientService.connect(idToken);
                switch (method) {
                    case 'GET':
                        return this.http.get<User>(endpoint, options);
                    case 'POST':
                        return this.http.post<User>(endpoint, { avatarURL }, options);
                    default:
                        throw new Error(`Unsupported HTTP method: ${method}`);
                }
            }),
            tap((user) => {
                if (user && user.uid) {
                    this.clientIsIdentified = true;
                    console.log('identifying through handleAuthAndFetchUser');
                    this.socketClientService.send(ConnectEvents.IdentifyClient, user.uid);
                }
            }),
        );
    }

    private monitorTokenChanges(): void {
        this.loadingTokenBS.next(true);

        onIdTokenChanged(this.auth, async (firebaseUser) => {
            if (this.isAuthenticating) {
                // return;
            }

            if (this.isSigningUp) {
                return;
            }

            if (this.userSnapshotUnsubscribe) {
                this.userSnapshotUnsubscribe();
                this.userSnapshotUnsubscribe = null;
            }

            if (firebaseUser) {
                try {
                    const idToken = await firebaseUser.getIdToken();
                    console.log(`Token emitted at: ${new Date()}`);
                    if (!idToken) throw new Error('Votre session a expiré. Veuillez vous reconnecter.');
                    this.tokenBS.next(idToken);
                    // this.socketClientService.disconnect(); <- causes errors in terms of socket handling backend, if token refreshes.
                    if (!this.isAuthenticating) {
                        console.log('connecting while not authenticating');
                        this.socketClientService.connect(idToken);
                    }

                    this.isUserOnline(firebaseUser.uid).subscribe((isOnline) => {
                        if (isOnline && !this.userBS.value && !this.isPostSignupSetup) {
                            this.loadingTokenBS.next(false);
                            this.signOutAndClearSession();
                            throw new Error("L'utilisateur est déjà connecté sur un autre appareil.");
                        }

                        if (this.isPostSignupSetup) {
                            this.isPostSignupSetup = false;
                        }

                        const userDocRef = doc(this.firestore, `users/${firebaseUser.uid}`);

                        if (!this.userBS.value) this.setIsOnline(true, firebaseUser.uid);

                        this.userSnapshotUnsubscribe = onSnapshot(
                            userDocRef,
                            (docSnapshot) => {
                                if (docSnapshot.exists()) {
                                    const userData = docSnapshot.data() as User;

                                    if (!this.clientIsIdentified && !(this.isAuthenticating || this.isSigningUp)) {
                                        this.clientIsIdentified = true;
                                        console.log(this.user$);
                                        console.log('identifying through monitorTokenChanges');
                                        this.socketClientService.send(ConnectEvents.IdentifyClient, firebaseUser.uid);
                                    }
                                    this.userBS.next(userData);
                                } else {
                                    this.userBS.next(null);
                                }
                                this.loadingTokenBS.next(false);
                            },
                            (error) => {
                                console.error('Error fetching user data:', error);
                                this.loadingTokenBS.next(false);
                            },
                        );
                    });
                } catch {
                    this.loadingTokenBS.next(false);
                    this.tokenBS.next(null);
                    this.userBS.next(null);
                    this.socketClientService.disconnect();
                    this.logout();
                }
            } else {
                this.userBS.next(null);
                this.tokenBS.next(null);
                this.socketClientService.disconnect();
                this.loadingTokenBS.next(false);
                this.router.navigate(['/login']);
            }
        });
    }

    private setupTokenListener(firebaseUser: FirebaseUser): void {
        if (!firebaseUser) return;

        // Cancel any existing listener
        if (this.userSnapshotUnsubscribe) {
            this.userSnapshotUnsubscribe();
            this.userSnapshotUnsubscribe = null;
        }

        try {
            const userDocRef = doc(this.firestore, `users/${firebaseUser.uid}`);

            this.userSnapshotUnsubscribe = onSnapshot(
                userDocRef,
                (docSnapshot) => {
                    if (docSnapshot.exists()) {
                        const userData = docSnapshot.data() as User;

                        if (!this.clientIsIdentified) {
                            this.clientIsIdentified = true;
                            console.log('identifying through setupTokenListener');
                            this.socketClientService.send(ConnectEvents.IdentifyClient, firebaseUser.uid);
                        }
                        this.userBS.next(userData);
                    } else {
                        this.userBS.next(null);
                    }
                    this.loadingTokenBS.next(false);
                },
                (error) => {
                    console.error('Error fetching user data:', error);
                    this.loadingTokenBS.next(false);
                },
            );
        } catch (error) {
            console.error('Error setting up token listener:', error);
            this.loadingTokenBS.next(false);
        }
    }

    private signOutAndClearSession(): void {
        this.tokenBS.next(null);
        this.socketClientService.disconnect();
        from(this.auth.signOut())
            .pipe(
                handleErrorsGlobally(this.injector),
                finalize(() => this.clearSession()),
            )
            .subscribe();
    }

    private clearSession(): void {
        this.tokenBS.next(null);
        this.reportService.resetParams();
        this.router.navigate(['/login']);
    }

    private isUserOnline(uid: string | null): Observable<boolean | null> {
        if (!uid) {
            return of(null);
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
            catchError(() => of(null)),
        );
    }

    private isUserBanned(uid: string | null): Observable<{ isBanned: boolean; message: string }> {
        if (!uid) {
            return of({ isBanned: false, message: '' });
        }

        return this.reportService.getReportState(uid).pipe(
            map((res) => ({ isBanned: res.isBanned, message: res.message })),
            catchError(() => of({ isBanned: false, message: '' })), // fallback if error
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
        // Configure provider with additional settings
        this.googleProvider = new GoogleAuthProvider();
        this.googleProvider.setCustomParameters({
            prompt: 'select_account',
        });

        // If we're in Electron, we need special handling
        if (this.environmentService.isElectron) {
            console.log('Running in Electron environment, using special auth flow');

            return new Observable<UserCredential>((observer) => {
                // Open the popup within Electron with proper parameters
                signInWithPopup(this.auth, this.googleProvider)
                    .then((result) => {
                        observer.next(result);
                        observer.complete();
                    })
                    .catch((error) => {
                        console.error('Google sign-in error:', error);

                        // Log specific error information
                        switch (error.code) {
                            case 'auth/unauthorized-domain': {
                                console.error('Unauthorized domain. Check Firebase Console settings.');

                                break;
                            }
                            case 'auth/popup-closed-by-user': {
                                console.error('Popup was closed by the user before completing the sign-in.');

                                break;
                            }
                            case 'auth/popup-blocked': {
                                console.error('Popup was blocked by the browser.');

                                break;
                            }
                            // No default
                        }

                        observer.error(error);
                    });
            });
        } else {
            // Standard web flow
            return from(signInWithPopup(this.auth, this.googleProvider));
        }
    }

    // Add this method to your service to help with Electron-specific issues
    private forceInitializeAuth(): void {
        // For Electron environments, we might need to force the auth system to initialize properly
        if (this.environmentService.isElectron) {
            const auth = getAuth();
            if (auth) {
                console.log('Force-initializing Firebase Auth for Electron environment');
                // Sometimes just accessing the auth object helps initialize it properly
                auth.useDeviceLanguage();
            }
        }
    }

    // Call this in ngOnInit or in your constructor after other initialization
    initializeAuth(): void {
        this.forceInitializeAuth();
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

    private enforceBan(message: string): void {
        this.reportService.banInfo(message);
        this.loadingTokenBS.next(false);
        this.tokenBS.next(null);
        this.userBS.next(null);
        this.socketClientService.disconnect();
        this.logout();
    }
}
