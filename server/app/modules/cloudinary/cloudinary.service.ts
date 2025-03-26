import { Injectable } from '@nestjs/common';
import * as toStream from 'buffer-to-stream';
import { UploadApiErrorResponse, UploadApiResponse, v2 } from 'cloudinary';
import { Multer } from 'multer';

@Injectable()
export class CloudinaryService {
    async uploadImage(file: Multer.File): Promise<UploadApiResponse | UploadApiErrorResponse> {
        // Check file size limit (10 MB = 10,000,000 bytes)
        if (file.size > 10000000) {
            throw new Error('File size exceeds 10 MB');
        }
        // Verify file is an image
        if (!file.mimetype.startsWith('image')) {
            throw new Error('Only image files are allowed');
        }
        return new Promise((resolve, reject) => {
            const upload = v2.uploader.upload_stream({ folder: 'avatars' }, (error, result) => {
                if (error) return reject(error);
                resolve(result);
            });
            toStream(file.buffer).pipe(upload);
        });
    }

    async deleteImage(publicUrl: string): Promise<void> {
        try {
            const urlParts = publicUrl.split('/');
            const fileName = urlParts[urlParts.length - 1];
            const publicId = `avatars/${fileName.split('.')[0]}`;

            await v2.uploader.destroy(publicId);
        } catch (error) {
            throw new Error(`Failed to delete image: ${error.message}`);
        }
    }
}
