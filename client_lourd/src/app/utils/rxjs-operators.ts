import { ErrorHandler, Injector } from '@angular/core';
import { catchError, MonoTypeOperatorFunction, throwError } from 'rxjs';

export const handleErrorsGlobally = <T>(injector: Injector): MonoTypeOperatorFunction<T> => {
    const globalErrorHandler = injector.get(ErrorHandler);

    return catchError((error: unknown) => {
        globalErrorHandler.handleError(error); // Use global error handler
        return throwError(() => error); // Re-throw error for further processing
    });
};
