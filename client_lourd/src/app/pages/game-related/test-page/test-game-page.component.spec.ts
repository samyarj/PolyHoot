import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { ChatComponent } from '@app/components/chat/chat.component';
import { HeaderGameComponent } from '@app/components/layout/filler/header-game/header-game.component';
import { MOCK_QUIZ } from '@app/constants/mock-constants';
import { TestClientService } from '@app/services/game-services/test-client/test-client.service';
import { Subject } from 'rxjs';
import { TestGamePageComponent } from './test-game-page.component';

describe('TestGamePageComponent', () => {
    let component: TestGamePageComponent;
    let fixture: ComponentFixture<TestGamePageComponent>;
    let testClientServiceSpy: jasmine.SpyObj<TestClientService>;
    let routerSpy: jasmine.SpyObj<Router>;
    const abandonSourceMock = new Subject<void>();
    let activatedRouteSpy: jasmine.SpyObj<ActivatedRoute>;

    beforeEach(async () => {
        const id = '1234';
        const activatedRouteSnapshotMock = {
            paramMap: {
                get: jasmine.createSpy().and.returnValue(id),
            },
        };
        const paramMapSpy = jasmine.createSpyObj('paramMap', ['get']);
        paramMapSpy.get.and.returnValue(id);

        activatedRouteSpy = jasmine.createSpyObj('ActivatedRoute', ['snapshot'], { snapshot: activatedRouteSnapshotMock });
        routerSpy = jasmine.createSpyObj('Router', ['navigate']);
        testClientServiceSpy = jasmine.createSpyObj(
            'testClientService',
            ['selectChoice', 'fetchQuiz', 'addPoints', 'finalizeAnswer', 'abandonGame', 'leavingPage', 'initializeSubscription', 'resetAttributes'],
            {
                abandonSource: abandonSourceMock,
                abandonSourceObservable: abandonSourceMock.asObservable(),
            },
        );
        testClientServiceSpy.quiz = JSON.parse(JSON.stringify(MOCK_QUIZ));
        testClientServiceSpy.questions = testClientServiceSpy.quiz.questions;
        await TestBed.configureTestingModule({
            declarations: [TestGamePageComponent, HeaderGameComponent, ChatComponent],
            imports: [RouterTestingModule, FormsModule],
            providers: [
                { provide: TestClientService, useValue: testClientServiceSpy },
                { provide: Router, useValue: routerSpy },
                { provide: ActivatedRoute, useValue: activatedRouteSpy },
            ],
        }).compileComponents();
        fixture = TestBed.createComponent(TestGamePageComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });
    it('should create the component', () => {
        expect(component).toBeTruthy();
    });

    it('getters should return their expected values', () => {
        expect(component.quizReady).toEqual(testClientServiceSpy.quizReady);
        expect(component.isTesting).toBeTrue();
        expect(component.choiceSelected).toEqual(testClientServiceSpy.choiceSelected);
        expect(component.showAnswers).toEqual(testClientServiceSpy.showAnswers);
        expect(component.quizTitle).toEqual(testClientServiceSpy.quiz.title);
        expect(component.questions).toEqual(testClientServiceSpy.questions);
        expect(component.userFirst).toEqual(testClientServiceSpy.answersCorrect);
        testClientServiceSpy.submitted = true;
        expect(component.submitted).toBeTrue();
        expect(component.waitingForQuestion).toBeFalse();
        expect(component.gamePaused).toBeFalse();
    });

    it('should subscribe to testClientService.abandonSourceObservable and navigate when abandonSource emits', fakeAsync(() => {
        routerSpy.navigate = jasmine.createSpy().and.stub();
        testClientServiceSpy.abandonSource.next();
        tick();
        expect(routerSpy.navigate).toHaveBeenCalledWith(['create']);
    }));

    it('should call selectChoice with the correct index when selectChoice is called', () => {
        testClientServiceSpy.selectChoice = jasmine.createSpy().and.returnValue(true);
        component.selectChoice(0);
        expect(testClientServiceSpy.selectChoice).toHaveBeenCalledWith(0);
    });
    it('handleKeyUp should call defaultKeyUpHandler ', () => {
        spyOn(component, 'defaultKeyUpHandler').and.stub();
        component.handleKeyUp(new KeyboardEvent('keyup', { key: 'Enter' }));
        expect(component.defaultKeyUpHandler).toHaveBeenCalled();
    });
    it('handleKeyDown should call defaultKeyDownHandler ', () => {
        spyOn(component, 'defaultKeyDownHandler').and.stub();
        component.handleKeyDown(new KeyboardEvent('keydown', { key: 'Enter' }));
        expect(component.defaultKeyDownHandler).toHaveBeenCalled();
    });

    it('ngOnDestroy should call leavingPage', () => {
        component.ngOnDestroy();
        expect(testClientServiceSpy.leavingPage).toHaveBeenCalled();
    });
    it('finalizeAnswer should call service finalizeAnswer', () => {
        component.finalizeAnswer();
        expect(testClientServiceSpy.finalizeAnswer).toHaveBeenCalled();
    });

    it('abandonGame should call service abandonGame', () => {
        component.abandonGame();
        expect(testClientServiceSpy.abandonGame).toHaveBeenCalled();
    });
});
