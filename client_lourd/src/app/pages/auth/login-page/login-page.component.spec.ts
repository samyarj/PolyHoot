/* 
https://stackoverflow.com/questions/43220348/cant-bind-to-formcontrol-since-it-isnt-a-known-property-of-input-angular
https://stackoverflow.com/questions/47201037/angular-unit-testing-error-cannot-match-any-routes-url-segment-home-adviso
https://stackoverflow.com/questions/39791773/how-can-i-unit-test-a-component-that-uses-the-router-in-angular
 */

import { HttpErrorResponse } from '@angular/common/http';
import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { HeaderGameComponent } from '@app/components/layout/filler/header-game/header-game.component';
import { AppRoute } from '@app/constants/enum-class';
import { AdminPageComponent } from '@app/pages/admin-related/admin-page/admin-page.component';
import { AuthentificationService } from '@app/services/admin-services/authentification-service/authentification.service';
import { MessageHandlerService } from '@app/services/general-services/error-handler/message-handler.service';
import { of, throwError } from 'rxjs';
import { LoginPageComponent } from './login-page.component';
import SpyObj = jasmine.SpyObj;

describe('LoginPageComponent', () => {
    let authentificationServiceSpy: SpyObj<AuthentificationService>;
    let component: LoginPageComponent;
    let fixture: ComponentFixture<LoginPageComponent>;
    let router: Router;
    let messageHandlerServiceSpy: SpyObj<MessageHandlerService>;

    beforeEach(() => {
        authentificationServiceSpy = jasmine.createSpyObj('authentification', ['authorize', 'verifyPassword']);
        messageHandlerServiceSpy = jasmine.createSpyObj('ErrorHandlerService', ['popUpErrorDialog']);
    });

    beforeEach(waitForAsync(() => {
        TestBed.configureTestingModule({
            imports: [RouterTestingModule.withRoutes([{ path: 'admin', component: AdminPageComponent }]), FormsModule, ReactiveFormsModule],
            declarations: [LoginPageComponent, HeaderGameComponent],
            providers: [
                { provide: AuthentificationService, useValue: authentificationServiceSpy },
                { provide: MessageHandlerService, useValue: messageHandlerServiceSpy },
            ],
        }).compileComponents();
        router = TestBed.inject(Router);
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(LoginPageComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('onClick should call verifyPassword from authentification service', () => {
        component.password.setValue('Elpassword');
        authentificationServiceSpy.verifyPassword.and.returnValue(of(false));
        component.onClick();
        expect(authentificationServiceSpy.verifyPassword).toHaveBeenCalledWith('Elpassword');
    });

    it('should authorize and redirect user if verifyPassword observable returns true', () => {
        component.password.setValue('log2990-211');
        authentificationServiceSpy.verifyPassword.and.returnValue(of(true));
        const navigateSpy = spyOn(router, 'navigate');
        const connexionButton = fixture.debugElement.nativeElement.querySelector('#submit');
        connexionButton.click();
        expect(authentificationServiceSpy.authorize).toHaveBeenCalled();
        expect(navigateSpy).toHaveBeenCalledWith([AppRoute.ADMIN]);
    });

    it('should warn and not authorize user if observable returns false', () => {
        component.password.setValue('log2990211');
        authentificationServiceSpy.verifyPassword.and.returnValue(of(false));
        const connexionButton = fixture.debugElement.nativeElement.querySelector('#submit');
        connexionButton.click();
        expect(messageHandlerServiceSpy.popUpErrorDialog).toHaveBeenCalledWith('Mauvais mot de passe: accès refusé');
        expect(authentificationServiceSpy.authorize).not.toHaveBeenCalled();
    });

    it('should navigate to home if user clicks on the Retour button', () => {
        const navigateSpy = spyOn(router, 'navigate');
        const retourButton = fixture.debugElement.nativeElement.querySelector('#homebutton');
        retourButton.click();
        expect(navigateSpy).toHaveBeenCalledWith([AppRoute.HOME]);
    });

    it('should toggle password visibility', () => {
        const initialVisibility = component.passwordVisible;
        component.togglePasswordVisibility();
        expect(component.passwordVisible).toBe(!initialVisibility);
    });

    it('popUpErrorDialog method should call popUpErrorDialog with proper message to show', () => {
        messageHandlerServiceSpy.popUpErrorDialog('The message the user sees');
        expect(messageHandlerServiceSpy.popUpErrorDialog).toHaveBeenCalledWith('The message the user sees');
    });

    it('User should receive a pop up message if verifyPassword sends an httpErrorResponse', () => {
        const errorResponse = new HttpErrorResponse({
            error: { code: 500, message: 'Internal Error' },
            status: 500,
            statusText: 'Internal Server error ',
        });
        authentificationServiceSpy.verifyPassword.and.returnValue(throwError(() => errorResponse));
        authentificationServiceSpy.verifyPassword('random').subscribe(component.passwordObserver);
        expect(messageHandlerServiceSpy.popUpErrorDialog).toHaveBeenCalledWith(errorResponse.error.message);
    });
});
