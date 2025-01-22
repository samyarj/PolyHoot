import { TestBed } from '@angular/core/testing';
import { ActivatedRouteSnapshot, CanActivateFn, Router, RouterStateSnapshot } from '@angular/router';
import { AuthentificationService } from '@app/services/admin-services/authentification-service/authentification.service';
import { Observable, lastValueFrom } from 'rxjs';
import { authGuard } from './auth.guard';

describe('authGuard', () => {
    let executeGuard: CanActivateFn;
    let authService: jasmine.SpyObj<AuthentificationService>;
    let router: jasmine.SpyObj<Router>;
    let route: ActivatedRouteSnapshot;
    let state: RouterStateSnapshot;

    beforeEach(() => {
        const authServiceSpy = jasmine.createSpyObj('AuthentificationService', ['getStatus']);
        const routerSpy = jasmine.createSpyObj('Router', ['navigate']);

        state = {
            url: '/mock-url',
            root: undefined as unknown,
        } as RouterStateSnapshot;

        TestBed.configureTestingModule({
            providers: [
                { provide: AuthentificationService, useValue: authServiceSpy },
                { provide: Router, useValue: routerSpy },
            ],
        });

        authService = TestBed.inject(AuthentificationService) as jasmine.SpyObj<AuthentificationService>;
        router = TestBed.inject(Router) as jasmine.SpyObj<Router>;
        executeGuard = async (...parameters) => {
            const result = await TestBed.runInInjectionContext(async () => authGuard(...parameters));
            return result instanceof Observable ? lastValueFrom(result) : result;
        };
    });

    it('should redirect an unauthenticated user to the login page', () => {
        authService.getStatus.and.returnValue(false);
        executeGuard(route, state);
        expect(router.navigate).toHaveBeenCalledWith(['/login'], { queryParams: { returnUrl: state.url } });
    });

    it('should allow the navigation for an authenticated user', () => {
        authService.getStatus.and.returnValue(true);
        executeGuard(route, state);
        expect(router.navigate).not.toHaveBeenCalled();
    });
});
