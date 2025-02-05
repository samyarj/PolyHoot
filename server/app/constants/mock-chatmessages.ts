import { ChatMessage } from '@common/chat-message';

export const MOCK_CHAT_MESSAGES: ChatMessage[] = [
    {
        message: 'Yo je vais gagner',
        author: 'Peach',
        date: new Date(),
    },
    {
        message: 'On verra bien',
        author: 'Abricot',
        date: new Date(),
    },
    {
        message: 'Yo jessaie de me concentrer la shatap',
        author: 'Kikina',
        date: new Date(),
    },
    {
        message: 'Omg tes trop savage Kikina',
        author: 'Peach',
        date: new Date(),
    },
];

export const MOCK_CHAT_MESSAGE = {
    message: 'Vive le Japon !',
    author: 'Saburo',
    date: new Date(),
};

export const MOCK_CHAT_MESSAGE_FROM_CLIENT = {
    message: 'Shatap',
    author: 'Amelie',
};

export const MOCK_CHAT_DATA = {
    message: MOCK_CHAT_MESSAGE,
    roomId: '2025',
};
