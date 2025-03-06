import { CloudinaryService } from '@app/modules/cloudinary/cloudinary.service';
import { Controller, Post, UploadedFile, UseInterceptors } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { Multer } from 'multer';

@Controller('upload-img')
export class UploadImgController {
    constructor(private readonly cloudinaryService: CloudinaryService) {}
    @Post()
    @UseInterceptors(FileInterceptor('image'))
    async uploadImage(@UploadedFile() file: Multer.File) {
        try {
            const result = await this.cloudinaryService.uploadImage(file);
            return { message: 'Image uploaded successfully', data: result };
        } catch (error) {
            return { error: error.message };
        }
    }
}
