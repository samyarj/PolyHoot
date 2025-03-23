import { DEFAULT_AVATARS } from '@app/constants';
import { AuthGuard } from '@app/guards/auth/auth.guard';
import { AuthenticatedRequest } from '@app/interface/authenticated-request';
import { CloudinaryService } from '@app/modules/cloudinary/cloudinary.service';
import { UserService } from '@app/services/auth/user.service';
import { Body, Controller, Delete, Get, HttpStatus, Post, Query, Req, Res, UploadedFile, UseGuards, UseInterceptors } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { Response } from 'express';
import { Multer } from 'multer';

@Controller('upload-img')
export class UploadImgController {
    constructor(
        private readonly cloudinaryService: CloudinaryService,
        private readonly userService: UserService,
    ) {}

    @Get('default-avatars')
    async getDefaultAvatars(@Res() res: Response) {
        try {
            return res.status(HttpStatus.OK).json({ avatars: DEFAULT_AVATARS });
        } catch (error) {
            return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({ error: error.message });
        }
    }

    @Post()
    @UseGuards(AuthGuard)
    @UseInterceptors(FileInterceptor('image'))
    async uploadImage(@UploadedFile() file: Multer.File, @Req() req: AuthenticatedRequest, @Res() res: Response) {
        try {
            const result = await this.cloudinaryService.uploadImage(file);

            // Vérifiez le contexte de l'appel
            const context = req.query.context; // Par défaut, le contexte est "avatar"

            if (context === 'avatar') {
                // Mettre à jour l'avatar de l'utilisateur
                await this.userService.updateUserAvatar(req.user.uid, result.secure_url);
                return res.status(HttpStatus.OK).json({
                    message: 'Image uploaded and avatar updated successfully',
                    avatarUrl: result.secure_url,
                });
            } else if (context === 'question') {
                // Retourner simplement l'URL de l'image pour une question
                return res.status(HttpStatus.OK).json({
                    message: 'Image uploaded successfully for question',
                    imageUrl: result.secure_url,
                });
            } else {
                return res.status(HttpStatus.BAD_REQUEST).json({
                    error: 'Invalid context provided',
                });
            }
        } catch (error) {
            return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({ error: error.message });
        }
    }
    @Delete('delete')
    @UseGuards(AuthGuard)
    async deleteImage(@Query('imageUrl') imageURL: string, @Res() res: Response) {
        try {
            if (!imageURL) {
                return res.status(HttpStatus.BAD_REQUEST).json({ error: 'Image URL is required' });
            }

            await this.cloudinaryService.deleteImage(imageURL);

            return res.status(HttpStatus.OK).json({
                message: 'Image deleted successfully',
            });
        } catch (error) {
            return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({ error: error.message });
        }
    }
}
