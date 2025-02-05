import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
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
