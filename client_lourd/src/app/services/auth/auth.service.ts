/* eslint-disable @typescript-eslint/naming-convention */
import { HttpClient } from "@angular/common/http";
import { Injectable, Injector } from "@angular/core";
import {
  Auth,
  createUserWithEmailAndPassword,
  GoogleAuthProvider,
  signInWithEmailAndPassword,
  signInWithPopup,
  updateProfile,
  UserCredential,
} from "@angular/fire/auth";
import { User } from "@app/interfaces/user";
import { handleErrorsGlobally } from "@app/utils/rxjs-operators";
import {
  User as FirebaseUser,
  onIdTokenChanged,
  sendPasswordResetEmail,
} from "firebase/auth";
import {
  BehaviorSubject,
  catchError,
  from,
  map,
  Observable,
  of,
  switchMap,
  tap,
  throwError,
} from "rxjs";
import { environment } from "src/environments/environment";

@Injectable({
  providedIn: "root",
})
export class AuthService {
  private readonly baseUrl = `${environment.serverUrl}/users`;
  private userBS: BehaviorSubject<User | null> =
    new BehaviorSubject<User | null>(null);
  private googleProvider = new GoogleAuthProvider();
  user$ = this.userBS.asObservable();

  constructor(
    private auth: Auth,
    private http: HttpClient,
    private injector: Injector
  ) {
    this.restoreSession();
  }

  signUp(username: string, email: string, password: string): Observable<User> {
    return this.createUser(email, password).pipe(
      switchMap((userCredential) =>
        this.updateUserProfile(userCredential.user, {
          displayName: username,
        }).pipe(map(() => userCredential))
      ),
      switchMap((userCredential) =>
        this.handleAuthAndFetchUser(
          userCredential,
          `${this.baseUrl}/create-user`,
          "POST"
        )
      ),
      handleErrorsGlobally(this.injector)
    );
  }

  login(identifier: string, password: string): Observable<User> {
    return this.getEmailFromIdentifier(identifier).pipe(
      switchMap((email) =>
        this.isUserOnline(email).pipe(
          switchMap((isOnline) => {
            if (isOnline)
              throw new Error("User is already logged in on another device.");
            return this.signInUser(email, password);
          })
        )
      ),
      switchMap((userCredential) =>
        this.handleAuthAndFetchUser(userCredential, `${this.baseUrl}/profile`)
      ),
      catchError((error) => {
        console.error("Error in login function:", error);
        return throwError(() => error); // Pass errors up the chain
      }),
      handleErrorsGlobally(this.injector)
    );
  }

  signWithGoogle(): Observable<User> {
    return this.signInWithGoogleSDK().pipe(
      switchMap((userCredential) =>
        // Check if the user is online
        this.isUserOnline(userCredential.user.email).pipe(
          switchMap((isOnline) => {
            if (isOnline)
              throw new Error("User is already logged in on another device.");

            // Update user profile
            return this.updateUserProfile(userCredential.user, {
              displayName: userCredential.user.displayName,
            }).pipe(
              // Fetch or create user from backend
              switchMap(() =>
                this.handleAuthAndFetchUser(
                  userCredential,
                  `${this.baseUrl}/signin-google`,
                  "POST"
                )
              )
            );
          })
        )
      ),
      handleErrorsGlobally(this.injector)
    );
  }

  logout(): void {
    const token = localStorage.getItem("firebaseToken");
    if (token) {
      this.http
        .post<void>(
          `${this.baseUrl}/logout`,
          {},
          { headers: { Authorization: `Bearer ${token}` } }
        )
        .subscribe({
          next: () => {
            this.signOutAndClearSession();
          },
          error: (err) => {
            console.error("Error during backend logout:", err);
          },
        });
    } else {
      this.signOutAndClearSession();
    }
  }

  restoreSession(): void {
    const token = localStorage.getItem("firebaseToken");
    if (token) {
      this.http
        .get<User>(`${this.baseUrl}/profile`, {
          headers: { Authorization: `Bearer ${token}` },
        })
        .subscribe({
          next: (user) => this.userBS.next(user),
          error: () => this.clearSession(),
        });
    } else {
      this.logout();
    }
  }

  isAuthenticated(): boolean {
    return !!localStorage.getItem("firebaseToken");
  }

  setUser(user: User): void {
    this.userBS.next(user);
  }

  monitorTokenChanges(): void {
    onIdTokenChanged(this.auth, (firebaseUser: FirebaseUser | null) => {
      if (firebaseUser) {
        firebaseUser.getIdToken().then((idToken) => {
          localStorage.setItem("firebaseToken", idToken);
          this.restoreSession();
        });
      } else {
        this.clearSession();
      }
    });
  }

  checkingUsername(username: string): Observable<boolean> {
    return this.http
      .get<{ usernameExists: boolean }>(`${this.baseUrl}/check-username`, {
        params: { username },
      })
      .pipe(map((response) => response.usernameExists));
  }

  checkingEmail(email: string): Observable<boolean> {
    return this.http
      .get<{ emailExists: boolean }>(`${this.baseUrl}/check-email`, {
        params: { email },
      })
      .pipe(map((response) => response.emailExists));
  }

  forgotPassword(email: string): Observable<void> {
    this.auth.languageCode = "fr";
    return from(sendPasswordResetEmail(this.auth, email)).pipe(
      handleErrorsGlobally(this.injector) // Apply the global error handler
    );
  }

  private handleAuthAndFetchUser(
    userCredential: UserCredential,
    endpoint: string,
    method: "GET" | "POST" = "GET" // Default to GET
  ): Observable<User> {
    return from(userCredential.user.getIdToken()).pipe(
      switchMap((idToken) => {
        const options = {
          headers: { Authorization: `Bearer ${idToken}` },
        };

        // Dynamically handle request based on the HTTP method
        switch (method) {
          case "GET":
            return this.http.get<User>(endpoint, options).pipe(
              tap(() => localStorage.setItem("firebaseToken", idToken)) // Save token on final success
            );
          case "POST":
            return this.http.post<User>(endpoint, {}, options).pipe(
              tap(() => localStorage.setItem("firebaseToken", idToken)) // Save token on final success
            );
          default:
            throw new Error(`Unsupported HTTP method: ${method}`);
        }
      })
    );
  }

  private getEmailFromIdentifier(identifier: string): Observable<string> {
    if (identifier.includes("@")) {
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

  private clearSession(): void {
    localStorage.removeItem("firebaseToken");
    this.userBS.next(null);
  }

  private signOutAndClearSession(): void {
    from(this.auth.signOut()).subscribe({
      next: () => this.clearSession(),
      error: (err) => {
        console.error("Error during Firebase sign out:", err);
        this.clearSession();
      },
    });
  }
  private isUserOnline(email: string | null): Observable<boolean> {
    if (!email) {
      return of(false);
    }

    return this.http
      .get<{ isOnline: boolean }>(`${this.baseUrl}/check-online-status`, {
        params: { email },
      })
      .pipe(
        map((response) => response.isOnline),
        catchError((error) => {
          console.error("Error checking online status from backend:", error);
          return of(false);
        })
      );
  }

  private signInWithGoogleSDK(): Observable<UserCredential> {
    return from(signInWithPopup(this.auth, this.googleProvider));
  }

  private createUser(
    email: string,
    password: string
  ): Observable<UserCredential> {
    return from(createUserWithEmailAndPassword(this.auth, email, password));
  }

  private signInUser(
    email: string,
    password: string
  ): Observable<UserCredential> {
    return from(signInWithEmailAndPassword(this.auth, email, password));
  }

  private updateUserProfile(
    user: FirebaseUser,
    profileData: Partial<Pick<FirebaseUser, "displayName" | "photoURL">>
  ): Observable<void> {
    return from(updateProfile(user, profileData));
  }
}
