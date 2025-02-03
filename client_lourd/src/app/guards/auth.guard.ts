import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '@app/services/auth/auth.service';
import { of, switchMap } from 'rxjs';

export const authGuard: CanActivateFn = (route, state) => {
    const authService = inject(AuthService);

    const router = inject(Router);

    return authService.loadingToken$.pipe(
        switchMap((isLoading) => {
            if (isLoading) {
                return authService.loadingToken$;
            }

            if (!authService.isAuthenticated()) {
                router.navigate(['/login'], { queryParams: { returnUrl: state.url } });
                return of(false);
            }

            return of(true);
        }),
    );
};
