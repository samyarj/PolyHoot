import { Request } from 'express';
import { Socket } from 'socket.io';

export interface AuthenticatedRequest extends Request {
    user: {
        uid: string;
        email: string;
        displayName: string;
    };
}

export interface AuthenticatedSocket extends Socket {
    user: {
        uid: string;
        email: string;
        displayName: string;
    };
}
