import { Global, Module } from '@nestjs/common';
import * as admin from 'firebase-admin';
import { CloudinaryModule } from './cloudinary/cloudinary.module';

@Global()
@Module({
    providers: [
        {
            provide: 'FIREBASE_ADMIN',
            useFactory: () => {
                return admin.initializeApp({
                    credential: admin.credential.cert(JSON.parse(Buffer.from(process.env.FIREBASE_SERVICE_ACCOUNT, 'base64').toString('utf-8'))),
                });
            },
        },
    ],
    exports: ['FIREBASE_ADMIN'],
    imports: [CloudinaryModule],
})
export class FirebaseModule {}
