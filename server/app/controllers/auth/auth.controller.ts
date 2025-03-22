import { AuthGuard } from '@app/guards/auth/auth.guard';
import { AuthenticatedRequest } from '@app/interface/authenticated-request';
import { UserService } from '@app/services/auth/user.service';
import { Body, Controller, Get, HttpStatus, Logger, Patch, Post, Query, Req, Res, UseGuards } from '@nestjs/common';
import {
    ApiBadRequestResponse,
    ApiConflictResponse,
    ApiCreatedResponse,
    ApiInternalServerErrorResponse,
    ApiOkResponse,
    ApiTags,
} from '@nestjs/swagger';
import { Response } from 'express';

@ApiTags('Authentication')
@Controller('users')
export class AuthController {
    constructor(
        private readonly userService: UserService,
        private readonly logger: Logger,
    ) {}

    @UseGuards(AuthGuard)
    @ApiCreatedResponse({ description: 'User successfully created' })
    @ApiConflictResponse({ description: 'Username or email already exists' })
    @ApiBadRequestResponse({ description: 'Validation error or bad request' })
    @ApiInternalServerErrorResponse({ description: 'Internal server error' })
    @Post('create-user')
    async createUser(@Req() request: AuthenticatedRequest, @Res() response: Response) {
        this.logger.log(`Attempting to create user: ${request.user.email}`);
        try {
            const user = await this.userService.createUserInFirestore(request.user.uid, request.user.displayName, request.user.email);
            this.logger.log(`User successfully created: ${user.email}`);
            response.status(HttpStatus.CREATED).json(user);
        } catch (error) {
            this.logger.error(`Error creating user: ${error.message}`);
            if (error.message.includes('Ce pseudonyme est déjà pris') || error.message.includes('Cette adresse e-mail est déjà utilisée')) {
                response.status(HttpStatus.CONFLICT).send({ message: error.message });
            } else {
                response.status(HttpStatus.INTERNAL_SERVER_ERROR).send({ message: error.message || 'Erreur interne du serveur' });
            }
        }
    }

    @UseGuards(AuthGuard)
    @ApiCreatedResponse({ description: 'User successfully created' })
    @ApiConflictResponse({ description: 'Username or email already exists' })
    @ApiBadRequestResponse({ description: 'Validation error or bad request' })
    @Post('signin-google')
    async signInWithGoogle(@Req() request: AuthenticatedRequest, @Res() response: Response) {
        this.logger.log(`Attempting Google sign-in for: ${request.user.email}`);
        try {
            console.log('Entering sign-in-google');
            console.log(request.user.uid, request.user.email, request.user.displayName);
            const user = await this.userService.signInWithGoogle(request.user.uid, request.user.email, request.user.displayName);
            this.logger.log(`Google sign-in successful for: ${user.email}`);
            response.status(HttpStatus.CREATED).json(user);
        } catch (error) {
            this.logger.error(`Google sign-in failed: ${error.message}`);

            if (error.message.includes('Ce pseudonyme est déjà pris') || error.message.includes('Cette adresse e-mail est déjà utilisée')) {
                response.status(HttpStatus.CONFLICT).send({ message: error.message });
            } else {
                response.status(HttpStatus.INTERNAL_SERVER_ERROR).send({ message: error.message || 'Erreur interne du serveur' });
            }
        }
    }

    @UseGuards(AuthGuard)
    @ApiOkResponse({ description: 'User successfully fetched' })
    @ApiInternalServerErrorResponse({ description: 'Internal server error' })
    @Get('profile')
    async getProfile(@Req() req: AuthenticatedRequest, @Res() response: Response) {
        this.logger.log(`Fetching profile for user: ${req.user.displayName}`);
        try {
            const user = await this.userService.getUserByUid(req.user.uid);
            response.status(HttpStatus.OK).json(user);
        } catch (error) {
            this.logger.error(`Error fetching profile: ${error.message}`);

            response.status(HttpStatus.INTERNAL_SERVER_ERROR).send({ message: error.message || 'Erreur interne du serveur' });
        }
    }

    @UseGuards(AuthGuard)
    @ApiOkResponse({ description: 'Avatar successfully updated' })
    @ApiBadRequestResponse({ description: 'Invalid request' })
    @ApiInternalServerErrorResponse({ description: 'Internal server error' })
    @Post('update-avatar')
    async updateAvatar(@Req() req: AuthenticatedRequest, @Body('avatarUrl') avatarUrl: string, @Res() response: Response) {
        this.logger.log(`Updating avatar for user: ${req.user.displayName}`);
        try {
            await this.userService.updateUserAvatar(req.user.uid, avatarUrl);
            response.status(HttpStatus.OK).json({ message: 'Avatar updated successfully' });
        } catch (error) {
            this.logger.error(`Error updating avatar: ${error.message}`);
            response.status(HttpStatus.INTERNAL_SERVER_ERROR).send({ message: error.message || 'Erreur interne du serveur' });
        }
    }

    @ApiOkResponse({ description: 'User successfully fetched' })
    @ApiInternalServerErrorResponse({ description: 'Internal server error' })
    @Get('check-online-status')
    async isUserOnline(@Query('email') email: string, @Res() res: Response) {
        this.logger.log(`Checking online status for email: ${email}`);
        try {
            if (!email) {
                return res.status(HttpStatus.BAD_REQUEST).json({ message: "L'adresse e-mail est requise." });
            }

            const isOnline = await this.userService.isUserOnline(email);
            return res.status(HttpStatus.OK).json({ isOnline });
        } catch (error) {
            this.logger.error(`Failed to check online status: ${error.message}`);

            return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({ message: 'Échec de la vérification du statut en ligne.' });
        }
    }

    @ApiOkResponse({ description: 'Email exists or does not exist' })
    @ApiBadRequestResponse({ description: 'Invalid email format' })
    @Get('check-email')
    async verifyEmail(@Query('email') email: string, @Res() response: Response) {
        this.logger.log(`Checking email availability for: ${email}`);
        try {
            const results = await this.userService.isEmailTaken(email);
            response.status(HttpStatus.OK).json(results);
        } catch (error) {
            this.logger.error(`Error checking email availability: ${error.message}`);
            response.status(HttpStatus.BAD_REQUEST).send({ message: error.message || 'Adresse e-mail invalide' });
        }
    }

    @ApiOkResponse({ description: 'Username exists or does not exist' })
    @ApiBadRequestResponse({ description: 'Invalid username format' })
    @Get('check-username')
    async verifyUsername(@Query('username') username: string, @Res() response: Response) {
        this.logger.log(`Checking username availability for: ${username}`);
        try {
            const exists = await this.userService.isUsernameTaken(username);
            response.status(HttpStatus.OK).json({ usernameExists: exists });
        } catch (error) {
            this.logger.error(`Error checking username availability: ${error.message}`);
            response.status(HttpStatus.BAD_REQUEST).send({ message: error.message || 'Pseudonyme invalide' });
        }
    }

    @ApiOkResponse({ description: 'Email successfully fetched' })
    @ApiInternalServerErrorResponse({ description: 'Internal server error' })
    @Get('get-email')
    async getEmailByUsername(@Query('username') username: string, @Res() res: Response) {
        this.logger.log(`Fetching email for username: ${username}`);
        try {
            if (!username) {
                return res.status(HttpStatus.BAD_REQUEST).json({ message: 'Pseudonyme est requis.' });
            }

            const email = await this.userService.getEmailByUsername(username);
            return res.status(HttpStatus.OK).json({ email });
        } catch (error) {
            this.logger.error(`Error fetching email for username: ${error.message}`);
            return res.status(HttpStatus.NOT_FOUND).json({ message: error.message });
        }
    }

    @UseGuards(AuthGuard)
    @ApiOkResponse({ description: 'User successfully logged out' })
    @ApiInternalServerErrorResponse({ description: 'Internal server error' })
    @Post('logout')
    async logout(@Req() req: AuthenticatedRequest, @Res() response: Response) {
        try {
            console.log('Loggin out here');
            await this.userService.logout(req.user.uid);
            response.status(HttpStatus.OK).send({ message: 'Déconnexion réussie.' });
        } catch (error) {
            response.status(HttpStatus.INTERNAL_SERVER_ERROR).send({ message: error.message || 'Erreur interne du serveur' });
        }
    }

    @UseGuards(AuthGuard)
    @ApiOkResponse({ description: 'Username successfully updated' })
    @ApiBadRequestResponse({ description: 'Invalid username format or username taken' })
    @ApiInternalServerErrorResponse({ description: 'Internal server error' })
    @Patch('update-username')
    async updateUsername(@Req() req: AuthenticatedRequest, @Body('username') username: string, @Res() response: Response) {
        this.logger.log(`Updating username for user: ${req.user.displayName} to ${username}`);
        try {
            const user = await this.userService.updateUsername(req.user.uid, username);
            response.status(HttpStatus.OK).json(user);
        } catch (error) {
            this.logger.error(`Error updating username: ${error.message}`);
            if (error.message.includes('Ce pseudonyme est déjà pris')) {
                response.status(HttpStatus.CONFLICT).send({ message: error.message });
            } else {
                response.status(HttpStatus.INTERNAL_SERVER_ERROR).send({ message: error.message || 'Erreur interne du serveur' });
            }
        }
    }
}
