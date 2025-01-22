import { HttpErrorResponse } from '@angular/common/http';
import { ErrorHandler, Injectable, Injector } from '@angular/core';
import { FirebaseError } from '@angular/fire/app';
import { AuthService } from '@app/services/auth/auth.service';
import { ToastrService } from 'ngx-toastr';

@Injectable()
export class GlobalErrorHandlerService extends ErrorHandler {
    constructor(private injector: Injector) {
        super();
    }

    handleError(error: unknown): void {
        const toastr = this.injector.get(ToastrService); // Lazy-load ToastrService
        const authService = this.injector.get(AuthService); // Lazy-load AuthService

        if (error instanceof HttpErrorResponse) {
            return;
        }
        if (error instanceof FirebaseError) {
            const message = this.getFirebaseErrorMessage(error);
            if (message) {
                toastr.error(message, 'Firebase Error');
            }
            console.error('Firebase Error:', error);
        } else if (error instanceof Error) {
            // Handle general JavaScript errors
            toastr.error(error.message || 'An unexpected error occurred.', 'Application Error');

            // Optional: Perform logout for critical errors
            if (error.message === 'Critical error') {
                authService.logout();
            }

            console.error('Global Non-HTTP Error:', error);
        } else {
            // Handle other types of unknown errors
            toastr.error('An unknown error occurred.', 'Application Error');
            console.error('Unknown error type:', error);
        }

        // Call the default Angular error handler
        super.handleError(error);
    }

    private getFirebaseErrorMessage(error: FirebaseError): string {
        switch (error.code) {
            case 'auth/user-not-found':
                return 'The user does not exist.';
            case 'auth/invalid-credential':
                return 'Invalid username or password.';
            case 'auth/email-already-in-use':
                return 'This email is already in use.';
            case 'auth/wrong-password':
                return 'The password is incorrect.';
            case 'auth/network-request-failed':
                return 'A network error occurred. Please try again.';
            case 'auth/popup-closed-by-user':
                return '';
            default:
                return error.message || 'An error occurred with Firebase.';
        }
    }
}
