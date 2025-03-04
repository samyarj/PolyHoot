import { AuthenticatedSocket } from '@app/interface/authenticated-request';
import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import { WsException } from '@nestjs/websockets';
import * as admin from 'firebase-admin';

@Injectable()
export class AuthGuard implements CanActivate {
    private auth = admin.auth();

    async canActivate(context: ExecutionContext): Promise<boolean> {
        const request = context.switchToHttp().getRequest();
        const authHeader = request.headers['authorization'];

        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            throw new UnauthorizedException('Authorization token missing or malformed.');
        }

        const token = authHeader.split(' ')[1];

        try {
            // Verify the Firebase token
            const decodedToken = await this.auth.verifyIdToken(token);
            const userRecord = await this.auth.getUser(decodedToken.uid);

            request.user = {
                uid: decodedToken.uid,
                email: decodedToken.email,
                displayName: userRecord.displayName,
            };

            return true;
        } catch (error) {
            throw new UnauthorizedException('Invalid or expired token.');
        }
    }
}

@Injectable()
export class WsAuthGuard implements CanActivate {
    private auth = admin.auth();

    async canActivate(context: ExecutionContext): Promise<boolean> {
        const client = context.switchToWs().getClient<AuthenticatedSocket>();

        // Get token from query or headers
        let token = client.handshake?.query?.token || client.handshake?.headers?.authorization?.split(' ')[1];

        // Ensure token is a string (handle case where it's an array)
        if (Array.isArray(token)) {
            token = token[0]; // Take the first element if it's an array
        }

        if (!token || typeof token !== 'string') {
            throw new WsException('Authorization token missing or malformed.');
        }

        try {
            // Verify Firebase token
            const decodedToken = await this.auth.verifyIdToken(token);
            const userRecord = await this.auth.getUser(decodedToken.uid);
            // Attach user data to WebSocket client
            client.user = {
                uid: decodedToken.uid,
                email: decodedToken.email,
                displayName: userRecord.displayName,
            };

            return true;
        } catch (error) {
            throw new WsException('Invalid or expired token.');
        }
    }
}
