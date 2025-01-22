/* eslint-disable @typescript-eslint/no-explicit-any */
// spy sur methode privee
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { BIG_MOCK_INPUT, MOCK_CHAT_MESSAGES } from '@app/constants/mock-chat-messages';
import { MOCK_SCROLL_HEIGHT } from '@app/constants/mock-constants';
import { ChatService } from '@app/services/chat-services/chat.service';
import { MessageHandlerService } from '@app/services/general-services/error-handler/message-handler.service';
import { ChatMessage } from '@common/chat-message';
import { Subject } from 'rxjs';
import { ChatComponent } from './chat.component';

describe('ChatComponent', () => {
    let component: ChatComponent;
    let fixture: ComponentFixture<ChatComponent>;
    let chatServiceSpy: jasmine.SpyObj<ChatService>;
    let mockAllChatMessagesSource: Subject<ChatMessage[]>;
    let messageHandlerServiceSpy: jasmine.SpyObj<MessageHandlerService>;
    const chatMessages: ChatMessage[] = MOCK_CHAT_MESSAGES;

    beforeEach(() => {
        chatServiceSpy = jasmine.createSpyObj(
            'chatService',
            ['getUserName', 'configureChatSocketFeatures', 'getHistory', 'retrieveRoomIdChat', 'sendMessageToRoom'],
            { canChat: true },
        );
        Object.defineProperties(chatServiceSpy, {
            isInitialized: {
                value: false,
                writable: true,
            },
        });
        messageHandlerServiceSpy = jasmine.createSpyObj('ErrorHandlerService', ['popUpErrorDialog']);
        mockAllChatMessagesSource = new Subject<ChatMessage[]>();
        chatServiceSpy.allChatMessagesObservable = mockAllChatMessagesSource.asObservable();
    });

    beforeEach(() => {
        TestBed.configureTestingModule({
            declarations: [ChatComponent],
            imports: [FormsModule, MatIconModule],
            providers: [
                { provide: MessageHandlerService, useValue: messageHandlerServiceSpy },
                { provide: ChatService, useValue: chatServiceSpy },
            ],
        });
        fixture = TestBed.createComponent(ChatComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('ngOnInit should make adequate function calls if chatService isnt initialized', () => {
        component.ngOnInit();
        fixture.detectChanges();
        expect(chatServiceSpy.configureChatSocketFeatures).toHaveBeenCalled();
        expect(chatServiceSpy.getHistory).toHaveBeenCalled();
        expect(chatServiceSpy.retrieveRoomIdChat).not.toHaveBeenCalled();
    });

    it('ngOnInit should make adequate function calls if chatService is initialized', () => {
        chatServiceSpy.isInitialized = true;
        chatServiceSpy.configureChatSocketFeatures.calls.reset();
        chatServiceSpy.getHistory.calls.reset();
        component.ngOnInit();
        fixture.detectChanges();
        expect(chatServiceSpy.configureChatSocketFeatures).not.toHaveBeenCalled();
        expect(chatServiceSpy.getHistory).not.toHaveBeenCalled();
        expect(chatServiceSpy.retrieveRoomIdChat).toHaveBeenCalled();
    });

    it('ngOnInit should subscribe to chatServiceObservable', () => {
        spyOn(chatServiceSpy.allChatMessagesObservable, 'subscribe').and.callThrough();
        component.ngOnInit();
        // l'erreur de lint n'est pas valide dans ce contexte car on subscribe bel et bien avec un observer dans le code mais a des fin de test
        // je dois mettre l'observer dans l'argument de 'toHaveBeenCalledWith'
        // eslint-disable-next-line deprecation/deprecation
        expect(chatServiceSpy.allChatMessagesObservable.subscribe).toHaveBeenCalledWith(component.messagesObserver);
        expect(component['messagesSubscription']).toBeDefined();
    });

    it('chatMessages attribute should be updated upon observer emiting a new chatMessages array and containerHasChanged should be set true', () => {
        component.chatMessages = [];
        mockAllChatMessagesSource.next(chatMessages);
        expect(component.chatMessages).toEqual(chatMessages);
        expect(component['containerHasChanged']).toBeTrue();
    });

    it('should call stopPropagation on keyDown event', () => {
        const event = new KeyboardEvent('keydown');
        const spy = spyOn(event, 'stopPropagation');
        component.onKeyDown(event);
        expect(spy).toHaveBeenCalled();
    });

    it('should call sendMessageToRoom and preventDefault if Enter key is pressed', () => {
        spyOn(component, 'sendMessageToRoom');
        const event = new KeyboardEvent('keydown', { key: 'Enter' });
        const spy = spyOn(event, 'preventDefault');
        component.onKeyDown(event);
        expect(component.sendMessageToRoom).toHaveBeenCalled();
        expect(spy).toHaveBeenCalled();
    });

    it('should get name using chatService.getUserName()', () => {
        const mockName = 'Coconut';
        chatServiceSpy.getUserName.and.returnValue(mockName);
        const name = component.name;
        expect(chatServiceSpy.getUserName).toHaveBeenCalled();
        expect(name).toEqual(mockName);
    });

    it('sendMessageToRoom should call isLengthInRange & isNotEmpty and sendMessageToRoom if isLenghtInRange returns true', () => {
        const mockInput = '1 2 3...Viva LAlgerie!';
        component.inputMessage = mockInput;
        spyOn(component, 'isLengthInRange').and.callFake(() => true);
        spyOn<any>(component, 'isNotEmpty').and.callFake(() => true);
        component.sendMessageToRoom();
        expect(component.isLengthInRange).toHaveBeenCalled();
        expect(component['isNotEmpty']).toHaveBeenCalled();
        expect(chatServiceSpy.sendMessageToRoom).toHaveBeenCalledWith(mockInput);
        expect(component.inputMessage).toBe('');
    });

    it('sendMessageToRoom should call popUpErrorDialog if chatService.sendMessageToRoom returns false', () => {
        chatServiceSpy.sendMessageToRoom.and.returnValue(false);
        component.isLengthInRange = () => true;
        component['isNotEmpty'] = () => 'true';
        component.sendMessageToRoom();
        expect(messageHandlerServiceSpy.popUpErrorDialog).toHaveBeenCalledWith('Vous ne pouvez pas envoyer de message sans être dans une partie');
    });

    it('sendMessageToRoom should call popUpErrorDialog if chatService.canChat is false', () => {
        spyOnProperty(component, 'canChat', 'get').and.returnValue(false);
        component.sendMessageToRoom();
        expect(messageHandlerServiceSpy.popUpErrorDialog).toHaveBeenCalledWith('Vous avez été restreint de discuter dans le clavardage');
    });

    it('should unsubscribe from messagesSubscription on ngOnDestroy', () => {
        spyOn(component['messagesSubscription'], 'unsubscribe');
        component.ngOnDestroy();
        expect(component['messagesSubscription'].unsubscribe).toHaveBeenCalled();
    });

    it('isLengthInRange should return false if inputMessage length is higher than 200 characters', () => {
        component.inputMessage = BIG_MOCK_INPUT;
        const result = component.isLengthInRange();
        expect(result).toBeFalse();
    });

    it('isLengthInRange should return true if inputMessage is lesser or equal than 200 characters', () => {
        component.inputMessage = 'Nikolay';
        const result = component.isLengthInRange();
        expect(result).toBeTrue();
    });

    it('popUpErrorDialog method should call popUpErrorDialog with proper message to show', () => {
        messageHandlerServiceSpy.popUpErrorDialog('The message the user sees');
        expect(messageHandlerServiceSpy.popUpErrorDialog).toHaveBeenCalledWith('The message the user sees');
    });

    it('isNotEmpty should return a truthy value if input is not empty', () => {
        component.inputMessage = 'test';
        const result = component['isNotEmpty']();
        expect(result).toBeTruthy();
    });

    it('isNotEmpty() should return a falsy value if input is empty', () => {
        component.inputMessage = '      ';
        const result = component['isNotEmpty']();
        expect(result).toBeFalsy();
    });

    it('scrollToBottom() should scroll to bottom', () => {
        const nativeElementMock = {
            scrollTop: 0,
            scrollHeight: MOCK_SCROLL_HEIGHT,
        };

        component['previousMessagesContainer'].nativeElement = nativeElementMock;

        component['scrollToBottom']();

        expect(nativeElementMock.scrollTop).toBe(MOCK_SCROLL_HEIGHT);
    });

    it('ngAfterViewChecked should call scrollToBottom if container has changed and should put it back to false', () => {
        spyOn<any>(component, 'scrollToBottom');
        component['containerHasChanged'] = true;
        component.ngAfterViewChecked();
        expect(component['scrollToBottom']).toHaveBeenCalled();
        expect(component['containerHasChanged']).toBeFalse();
    });
});
