import { ElementRef } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormsModule } from '@angular/forms';
import { ChatComponent } from '@app/components/chat/chat.component';
import { HeaderGameComponent } from '@app/components/general-elements/header-game/header-game.component';
import { JoinGameService } from '@app/services/game-services/join-game-service/join-game.service';
import { JoinGamePageComponent } from './join-game-page.component';

describe('JoinGamePageComponent', () => {
    let component: JoinGamePageComponent;
    let fixture: ComponentFixture<JoinGamePageComponent>;
    let joinGameServiceSpy: jasmine.SpyObj<JoinGameService>;

    const mockElementRef: ElementRef<HTMLInputElement> = {
        nativeElement: document.createElement('input'),
    };

    beforeEach(async () => {
        joinGameServiceSpy = jasmine.createSpyObj('JoinGameService', [
            'resetService',
            'validGameId',
            'joinGame',
            'redirectToPage',
            'updateGameIdValidated',
        ]);

        Object.assign(joinGameServiceSpy, {
            popUpMessage: 'pop up message for test',
            gameIdValidated: false,
            wrongPin: false,
        });

        await TestBed.configureTestingModule({
            imports: [FormsModule],
            declarations: [JoinGamePageComponent, HeaderGameComponent, ChatComponent],
            providers: [{ provide: JoinGameService, useValue: joinGameServiceSpy }],
        }).compileComponents();

        fixture = TestBed.createComponent(JoinGamePageComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should reset joinGameService on component destroy', () => {
        component.ngOnDestroy();
        expect(joinGameServiceSpy.resetService).toHaveBeenCalled();
    });

    it('should focus on playerName input Field after content checked when gameIdValidated is true', () => {
        // L'utilisation de any est nécessaire puisqu'il s'agit d'une méthode privée
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        spyOn<any>(component, 'focusPlayerNameField').and.callThrough();
        joinGameServiceSpy.gameIdValidated = true;
        component.ngAfterContentChecked();
        expect(component['focusPlayerNameField']).toHaveBeenCalled();
    });

    it("shouldn't focus on playerName input Field after content checked when gameIdValidated is false", () => {
        // L'utilisation de any est nécessaire puisqu'il s'agit d'une méthode privée
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        spyOn<any>(component, 'focusPlayerNameField').and.callThrough();
        joinGameServiceSpy.gameIdValidated = false;
        component.ngAfterContentChecked();
        expect(component['focusPlayerNameField']).not.toHaveBeenCalled();
    });

    it('should call validGameId method from joinGameService on validGameId', () => {
        component.gameId = '1234';
        component.validGameId();
        expect(joinGameServiceSpy.validGameId).toHaveBeenCalledWith('1234');
    });

    it('should call joinGame method from joinGameService on joinGame', () => {
        component.gameId = '1234';
        component.playerName = 'Nour';
        component.joinGame();
        expect(joinGameServiceSpy.joinGame).toHaveBeenCalledWith('1234', 'Nour');
    });

    it('should call redirectToPage method from joinGameService on redirectToPage', () => {
        component.redirectToPage('somePage');
        expect(joinGameServiceSpy.redirectToPage).toHaveBeenCalledWith('somePage');
    });

    it('should update gameIdValidated to false and clear playerName on redirectToGameAcces', () => {
        component.redirectToGameAcces();
        expect(joinGameServiceSpy.updateGameIdValidated).toHaveBeenCalledWith(false);
        expect(component.playerName).toEqual('');
    });

    describe('Getter functions', () => {
        it('should get popUpMessage from joinGameService', () => {
            expect(component.popUpMessage).toEqual('pop up message for test');
        });

        it('should get gameIdValidated from joinGameService', () => {
            expect(component.gameIdValidated).toEqual(false);
        });

        it('should get wrongPin from joinGameService', () => {
            expect(component.wrongPin).toEqual(false);
        });
    });

    it('should focus on playerName input field when playerNameField is available', () => {
        const focusSpy = spyOn(mockElementRef.nativeElement, 'focus');
        component.playerNameField = mockElementRef;
        component['focusPlayerNameField']();
        expect(focusSpy).toHaveBeenCalled();
    });
});
