import { UploadImgController } from '@app/controllers/upload-img/upload-img.controller';
import { UserService } from '@app/services/auth/user.service';
import { Module } from '@nestjs/common';
import { Cloudinary } from './cloudinary';
import { CloudinaryService } from './cloudinary.service';

@Module({
    providers: [CloudinaryService, Cloudinary, UserService],
    exports: [CloudinaryService],
    controllers: [UploadImgController],
})
export class CloudinaryModule {}
