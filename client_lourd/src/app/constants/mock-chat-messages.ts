/*
Citation du BIG_MOCK_INPUT tiré de https://en.wikipedia.org/wiki/Rabindranath_Tagore 
*/

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

export const BIG_MOCK_INPUT =
    'Our passions and desires are unruly, but our character subdues these elements into a harmonious whole ' +
    'Does something similar to this happen in the physical world? Are the elements rebellious, dynamic with individual impulse? ' +
    'And is there a principle in the physical world that dominates them and puts them into an orderly organization?';
