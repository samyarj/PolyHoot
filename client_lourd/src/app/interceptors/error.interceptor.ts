/* eslint-disable @typescript-eslint/no-magic-numbers */
import { HttpErrorResponse, HttpEvent, HttpHandler, HttpInterceptor, HttpRequest } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { AuthService } from '@app/services/auth/auth.service';
import { ToastrService } from 'ngx-toastr';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';

@Injectable()
export class ErrorInterceptor implements HttpInterceptor {
    constructor(
        private toastr: ToastrService,
        private authService: AuthService,
    ) {}

    intercept(req: HttpRequest<unknown>, next: HttpHandler): Observable<HttpEvent<unknown>> {
        return next.handle(req).pipe(catchError((error: HttpErrorResponse) => this.handleError(error)));
    }

    private handleError(error: HttpErrorResponse): Observable<never> {
        if (error.error instanceof ErrorEvent) {
            // Client-side or network error
            console.error('Client-side error:', error.error.message);
            this.toastr.error('A network error occurred. Please try again.', 'Network Error');
        } else {
            // Backend error
            console.error('Backend error:', error);

            const message = error.error?.message || 'An unexpected error occurred.';
            switch (error.status) {
                case 400:
                    this.toastr.error(message, 'Bad Request');
                    break;
                case 401:
                    this.toastr.warning(message || 'Unauthorized access. Please log in again.', 'Unauthorized');
                    this.authService.logout();
                    break;
                case 403:
                    this.toastr.error(message || 'You do not have permission to perform this action.', 'Forbidden');
                    break;
                case 404:
                    this.toastr.error(message || 'The requested resource was not found.', 'Not Found');
                    break;
                case 500:
                    this.toastr.error(message || 'A server error occurred. Please try again later.', 'Server Error');
                    break;
                default:
                    this.toastr.error(message || 'An error occurred. Please try again.', 'Error');
            }
        }

        // Re-throw the error so it can be handled further if needed
        return throwError(() => error);
    }
}
