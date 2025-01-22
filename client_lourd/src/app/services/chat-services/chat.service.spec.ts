import { TestBed } from '@angular/core/testing';
import { MOCK_CHAT_MESSAGES } from '@app/constants/mock-chat-messages';
import { SocketClientService } from '@app/services/websocket-services/general/socket-client-manager.service';
import { ChatMessage } from '@common/chat-message';
import { ChatEvents } from './chat-events';
import { ChatService } from './chat.service';

describe('ChatService', () => {
    let service: ChatService;
    let socketServiceMock: jasmine.SpyObj<SocketClientService>;

    beforeEach(() => {
        socketServiceMock = jasmine.createSpyObj('SocketClientService', ['send', 'on']);
        socketServiceMock.playerName = '';
        socketServiceMock.isOrganizer = false;
        socketServiceMock.roomId = '';
        TestBed.configureTestingModule({
            providers: [ChatService, { provide: SocketClientService, useValue: socketServiceMock }],
        });
        service = TestBed.inject(ChatService);
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    it('canChat getter should return true', () => {
        socketServiceMock.canChat = true;
        expect(service.canChat).toBeTrue();
    });
    it('isRoomIdCurrent should return true if the roomId of the service is equal to the roomId of the socketClientService', () => {
        service.roomId = '2024';
        socketServiceMock.roomId = '2024';
        const result = service.isRoomIdCurrent();
        expect(result).toBeTrue();
    });

    it('isRoomIdCurrent should return false if the roomId of the service is not equal to the roomId of the socketClientService', () => {
        service.roomId = '2000';
        socketServiceMock.roomId = '2024';
        const result = service.isRoomIdCurrent();
        expect(result).toBeFalse();
    });

    it('retrieveRoomIdChat should call getHistory and update roomId if roomId isnt current', () => {
        service.roomId = '1024';
        socketServiceMock.roomId = '1500';
        spyOn(service, 'getHistory');
        service.retrieveRoomIdChat();
        expect(service.getHistory).toHaveBeenCalled();
        expect(service.roomId).toBe(socketServiceMock.roomId);
    });

    it('retrieveRoomIdChat should emit the array of allChatMessages if roomId is current', () => {
        service.roomId = '1000';
        socketServiceMock.roomId = '1000';
        service.allChatMessages = MOCK_CHAT_MESSAGES;
        spyOn(service, 'getHistory');
        service.allChatMessagesObservable.subscribe((chatMessagesArray) => {
            expect(chatMessagesArray).toBe(MOCK_CHAT_MESSAGES);
        });
        service.retrieveRoomIdChat();
        expect(service.getHistory).not.toHaveBeenCalled();
    });

    it('sendMessageToRoom should construct a Chatmessage and call send from socketClientService if roomId is not empty and return true', () => {
        socketServiceMock.roomId = '8383';
        socketServiceMock.playerName = 'Zekaria';
        const messageInputMock = 'Nanani nanana';
        const chatMessageMock = {
            message: messageInputMock,
            author: 'Zekaria',
        };
        const hasBeenSent = service.sendMessageToRoom(messageInputMock);
        expect(socketServiceMock.send).toHaveBeenCalledWith('roomMessage', chatMessageMock);
        expect(hasBeenSent).toBeTrue();
    });

    it('sendMessageToRoom should not call send from socketClientService if the roomId is empty and should return false', () => {
        socketServiceMock.roomId = '';
        const hasBeenSent = service.sendMessageToRoom('Abidjan');
        expect(hasBeenSent).toBeFalse();
        expect(socketServiceMock.send).not.toHaveBeenCalled();
    });

    it('getHistory should call send from socketClientService with proper event name and callback and should emit and update the chatMessages', () => {
        const mockHistory: ChatMessage[] = MOCK_CHAT_MESSAGES;
        service.allChatMessages = [];
        service.allChatMessagesObservable.subscribe((messages) => {
            expect(messages).toEqual(mockHistory);
        });

        service.getHistory();
        expect(socketServiceMock.send).toHaveBeenCalledWith('getHistory', jasmine.any(Function));

        const callback = socketServiceMock.send.calls.mostRecent().args[1] as (history: ChatMessage[]) => void;
        callback(mockHistory);

        expect(service.allChatMessages).toEqual(mockHistory);
    });

    it('getUserName should return playerName from socketClientService', () => {
        socketServiceMock.isOrganizer = false;
        const nameMock = 'Edwini';
        socketServiceMock.playerName = nameMock;
        const result = service.getUserName();
        expect(result).toBe(nameMock);
    });

    it('getUserName should return Organisateur if isOrganizer is true on the socketClientService', () => {
        socketServiceMock.isOrganizer = true;
        const result = service.getUserName();
        expect(result).toBe('Organisateur');
    });

    it('configureChatSocketFeatures should call on from socketClientService and should set isInitialized to true', () => {
        service.isInitialized = false;
        service.configureChatSocketFeatures();
        expect(socketServiceMock.on).toHaveBeenCalledWith('messageAdded', jasmine.any(Function));
        expect(socketServiceMock.on).toHaveBeenCalledWith('roomLeft', jasmine.any(Function));
        expect(service.isInitialized).toBeTrue();
    });

    it('should update and emit the chatMessages array on "messageAdded" event', () => {
        service.allChatMessages = [];
        const chatMessageMock = {
            message: 'this means war',
            author: 'AngryBirds',
            date: new Date(),
        };
        socketServiceMock.on = jasmine.createSpy('on').and.callFake((eventName, callback) => {
            if (eventName === ChatEvents.MessageAdded) callback(chatMessageMock);
        });
        service.allChatMessagesObservable.subscribe((messages) => {
            expect(messages).toEqual([chatMessageMock]);
        });
        service.configureChatSocketFeatures();
        expect(service.allChatMessages).toEqual([chatMessageMock]);
    });

    it('should clear information on the socketClientService on "roomLeft" event', () => {
        socketServiceMock.roomId = '3232';
        socketServiceMock.playerName = 'Zidane';
        socketServiceMock.on = jasmine.createSpy('on').and.callFake((eventName, callback) => {
            if (eventName === 'roomLeft') callback();
        });
        service.configureChatSocketFeatures();
        expect(socketServiceMock.roomId).toBe('');
        expect(socketServiceMock.playerName).toBe('');
        expect(socketServiceMock.isOrganizer).toBeFalse();
    });
    it('should emit the chatMessages array on "messageAdded" event', () => {
        service.allChatMessages = [];
        socketServiceMock.playerName = 'Zidane';
        const chatMessageMock = {
            message: 'this means war',
            author: 'AngryBirds',
            date: new Date(),
        };
        const chatDataMock = { message: chatMessageMock, playerName: 'Zidane' };
        socketServiceMock.on = jasmine.createSpy('on').and.callFake((eventName, callback) => {
            if (eventName === ChatEvents.ChatStatusChange) callback(chatDataMock);
        });
        service.allChatMessagesObservable.subscribe((messages) => {
            expect(messages).toEqual([chatMessageMock]);
        });
        service.configureChatSocketFeatures();
        expect(service.allChatMessages).toEqual([chatMessageMock]);
    });
    it('should send to gateway the SystemMessage on "roomLeft" event if chatData exists', () => {
        service.allChatMessages = [];
        const chatMessageMock = {
            message: 'this means war',
            author: 'AngryBirds',
            date: new Date(),
        };
        const chatDataMock = { message: chatMessageMock, roomId: '1234', playerName: 'PlayerName' };
        socketServiceMock.on = jasmine.createSpy('on').and.callFake((eventName, callback) => {
            if (eventName === ChatEvents.RoomLeft) callback(chatDataMock);
        });
        service.allChatMessagesObservable.subscribe((messages) => {
            expect(messages).toEqual([chatMessageMock]);
        });
        service.configureChatSocketFeatures();
        expect(service.allChatMessages).toEqual([chatMessageMock]);
    });
});
