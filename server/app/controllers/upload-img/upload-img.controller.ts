import { DEFAULT_AVATARS } from '@app/constants';
import { AuthGuard } from '@app/guards/auth/auth.guard';
import { AuthenticatedRequest } from '@app/interface/authenticated-request';
import { CloudinaryService } from '@app/modules/cloudinary/cloudinary.service';
import { UserService } from '@app/services/auth/user.service';
import { Controller, Get, HttpStatus, Post, Req, Res, UploadedFile, UseGuards, UseInterceptors } from '@nestjs/common';
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
            // Update the user's avatar with the new URL
            await this.userService.updateUserAvatar(req.user.uid, result.secure_url);

            return res.status(HttpStatus.OK).json({
                message: 'Image uploaded and avatar updated successfully',
                avatarUrl: result.secure_url,
            });
        } catch (error) {
            return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({ error: error.message });
        }
    }
}
