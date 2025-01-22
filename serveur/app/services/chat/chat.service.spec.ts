// any est accepté dans ce contexte car on veut spy sur une méthode privée
/* eslint-disable @typescript-eslint/no-explicit-any */
import { MOCK_CHAT_MESSAGE, MOCK_CHAT_MESSAGES } from '@app/constants/mock-chatmessages';
import { ChatMessage } from '@common/chat-message';
import { Test } from '@nestjs/testing';
import { ChatService } from './chat.service';

describe('ChatServiceEndToEnd', () => {
    let service: ChatService;
    let mockRoomId: string;

    beforeEach(async () => {
        const module = await Test.createTestingModule({
            providers: [ChatService],
        }).compile();

        service = module.get<ChatService>(ChatService);

        mockRoomId = '2025';
        service['histories'].set(mockRoomId, MOCK_CHAT_MESSAGES);
    });

    it('should be defined', () => {
        expect(service).toBeDefined();
    });

    it('isConvoInHistories should return true if roomId has a history in the map', () => {
        const result = service['isConvoInHistories'](mockRoomId);
        expect(result).toBe(true);
    });

    it('isConvoInHistories should return false if roomId has no history in the map', () => {
        const result = service['isConvoInHistories']('1000');
        expect(result).toBe(false);
    });

    it('addMessageAndCreateHistory should add an entry in the map if roomId is truthy', () => {
        const mapSize = service['histories'].size;
        service['addMessageAndCreateHistory'](MOCK_CHAT_MESSAGE, '4352');
        expect(service['histories'].size).toBe(mapSize + 1);
        expect(service['histories'].get('4352')).toStrictEqual([MOCK_CHAT_MESSAGE]);
    });

    it('addMessageAndCreateHistory should not add an entry in the map if roomId is falsy', () => {
        const mapSize = service['histories'].size;
        service['addMessageAndCreateHistory'](MOCK_CHAT_MESSAGE, '');
        expect(service['histories'].size).toBe(mapSize);
        expect(service['histories'].get('')).toBeUndefined();
    });

    it('addMessageInHistory should add a chat message in the existing history', () => {
        const chatMessages = service['histories'].get('2025');
        const expectedChatMessages = JSON.parse(JSON.stringify(chatMessages));
        expectedChatMessages.forEach((message: ChatMessage) => {
            message.date = new Date(message.date);
        });
        expectedChatMessages.push(MOCK_CHAT_MESSAGE);
        service['addMessageInHistory'](MOCK_CHAT_MESSAGE, '2025');
        expect(service['histories'].get('2025')).toStrictEqual(expectedChatMessages);
    });

    it('deleteHistory should delete the corresponding entry in the map and return true', () => {
        const result = service.deleteHistory('2025');
        expect(result).toBe(true);
        expect(service['histories'].size).toBe(0);
    });

    it('deleteHistory should return false if theres no corresponding entry in the map', () => {
        const result = service.deleteHistory('1000');
        expect(result).toBe(false);
        expect(service['histories'].size).toBe(1);
    });

    it('getHistory should return the chatMessages corresponding to the roomId in the map', () => {
        const result = service['getHistory']('2025');
        expect(result).toStrictEqual(MOCK_CHAT_MESSAGES);
    });

    it('getHistory should return an empty array if there is no corresponding entry in the map', () => {
        const result = service['getHistory']('4500');
        expect(result).toStrictEqual([]);
    });

    it('addMessage should call addMessageInHistory if roomId is in the map', () => {
        const addMessageInHistorySpy = jest.spyOn(service as any, 'addMessageInHistory');
        const addMessageAndCreateHistorySpy = jest.spyOn(service as any, 'addMessageAndCreateHistory');
        service.addMessage(MOCK_CHAT_MESSAGE, '2025');
        expect(addMessageInHistorySpy).toHaveBeenCalledWith(MOCK_CHAT_MESSAGE, '2025');
        expect(addMessageAndCreateHistorySpy).not.toHaveBeenCalled();
    });

    it('addMessage should call addMessageAndCreateHistory if roomId is not in the map', () => {
        const addMessageInHistorySpy = jest.spyOn(service as any, 'addMessageInHistory');
        const addMessageAndCreateHistorySpy = jest.spyOn(service as any, 'addMessageAndCreateHistory');
        service.addMessage(MOCK_CHAT_MESSAGE, '2000');
        expect(addMessageAndCreateHistorySpy).toHaveBeenCalledWith(MOCK_CHAT_MESSAGE, '2000');
        expect(addMessageInHistorySpy).not.toHaveBeenCalled();
    });
});
