import { ChatEvents } from '@app/constants/enum-classes';
import { MOCK_CHAT_MESSAGE, MOCK_CHAT_MESSAGES, MOCK_CHAT_MESSAGE_FROM_CLIENT } from '@app/constants/mock-chatmessages';
import { ChatGateway } from '@app/gateways/chat/chat.gateway';
import { ChatService } from '@app/services/chat/chat.service';
import { Test, TestingModule } from '@nestjs/testing';
import { Server, Socket } from 'socket.io';

describe('ChatGateway', () => {
    let gateway: ChatGateway;
    let mockServer: Server;

    const chatServiceMock = {
        addMessage: jest.fn(),
        getHistory: jest.fn().mockImplementation(() => {
            return MOCK_CHAT_MESSAGES;
        }),
    } as unknown as ChatService;

    const clientSocketMockRoomId = '2025';
    const defaultID = 'mockID';
    const clientSocketMock = {
        rooms: new Set([defaultID, clientSocketMockRoomId]),
        emit: jest.fn(),
    } as unknown as Socket;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                ChatGateway,
                {
                    provide: ChatService,
                    useValue: chatServiceMock,
                },
                {
                    provide: Server,
                    useValue: mockServer,
                },
            ],
        }).compile();

        mockServer = {
            to: jest.fn().mockReturnValue({
                emit: jest.fn(),
            }),
        } as unknown as Server;
        gateway = module.get<ChatGateway>(ChatGateway);
        gateway['server'] = mockServer;
        gateway['chatService'] = chatServiceMock;
    });

    it('should be defined', () => {
        expect(gateway).toBeDefined();
    });

    it('roomMessage() should send message to all client sockets in the corresponding room and should call addMessage from chatService', () => {
        gateway.roomMessage(clientSocketMock, MOCK_CHAT_MESSAGE);
        expect(chatServiceMock.addMessage).toHaveBeenCalledWith(MOCK_CHAT_MESSAGE, clientSocketMockRoomId);
        expect(mockServer.to(clientSocketMockRoomId).emit).toHaveBeenCalledWith(ChatEvents.MessageAdded, MOCK_CHAT_MESSAGE);
    });

    it('roomMessage() should add a date to the message received from the client', () => {
        const mockChatMessageFromClient = JSON.parse(JSON.stringify(MOCK_CHAT_MESSAGE_FROM_CLIENT));
        gateway.roomMessage(clientSocketMock, mockChatMessageFromClient);
        expect(mockChatMessageFromClient.date).toBeInstanceOf(Date);
    });

    it('getHistory() should call getHistory from chatService and return the history', () => {
        const result = gateway.getHistory(clientSocketMock);
        expect(chatServiceMock.getHistory).toHaveBeenCalledWith(clientSocketMockRoomId);
        expect(result).toBe(MOCK_CHAT_MESSAGES);
    });
    it('changeChatStatus() should send a corresponding message if canChat is true', () => {
        const playerData = { playerName: 'Alice', canChat: true };
        const message = {
            author: 'System',
            message: 'Vous pouvez maintenant envoyer des messages',
            date: expect.any(Date),
        };
        const mockChatData = { message, playerName: playerData.playerName };
        gateway.changeChatStatus(clientSocketMock, playerData);
        expect(mockServer.to(clientSocketMockRoomId).emit).toHaveBeenCalledWith(ChatEvents.ChatStatusChange, mockChatData);
    });
    it('changeChatStatus() should send a corresponding message if canChat is false', () => {
        const playerData = { playerName: 'Alice', canChat: false };
        const message = {
            author: 'System',
            message: 'Vous ne pouvez plus envoyer de message',
            date: expect.any(Date),
        };
        const mockChatData = { message, playerName: playerData.playerName };
        gateway.changeChatStatus(clientSocketMock, playerData);
        expect(mockServer.to(clientSocketMockRoomId).emit).toHaveBeenCalledWith(ChatEvents.ChatStatusChange, mockChatData);
    });
});
