import { Controller, Get, HttpStatus, Logger, Param, Post, Res, UseGuards } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { Response } from 'express';
import { AuthGuard } from '../guards/auth/auth.guard';
import { UserService } from '../services/auth/user.service';

@ApiTags('Friend System')
@Controller('users')
export class FriendSystemController {
    constructor(
        private readonly userService: UserService,
        private readonly logger: Logger,
    ) {}

    @UseGuards(AuthGuard)
    @Get('by-username/:username')
    async getUserByUsername(@Param('username') username: string, @Res() response: Response) {
        try {
            const uid = await this.userService.getUserIdByUsername(username);
            response.status(HttpStatus.OK).json({ uid });
        } catch (error) {
            this.logger.error(`Error getting user by username: ${error.message}`);
            response.status(HttpStatus.INTERNAL_SERVER_ERROR).json({ message: error.message });
        }
    }

    @UseGuards(AuthGuard)
    @Post(':userId/friend-request/:friendId')
    async sendFriendRequest(@Param('userId') userId: string, @Param('friendId') friendId: string, @Res() response: Response) {
        try {
            const result = await this.userService.sendFriendRequest(userId, friendId);
            response.status(HttpStatus.OK).json(result);
        } catch (error) {
            this.logger.error(`Error sending friend request: ${error.message}`);
            response.status(HttpStatus.INTERNAL_SERVER_ERROR).json({ message: error.message });
        }
    }

    @UseGuards(AuthGuard)
    @Post(':userId/accept-friend/:friendId')
    async acceptFriendRequest(@Param('userId') userId: string, @Param('friendId') friendId: string, @Res() response: Response) {
        try {
            const result = await this.userService.addFriend(userId, friendId);
            response.status(HttpStatus.OK).json(result);
        } catch (error) {
            this.logger.error(`Error accepting friend request: ${error.message}`);
            response.status(HttpStatus.INTERNAL_SERVER_ERROR).json({ message: error.message });
        }
    }

    @UseGuards(AuthGuard)
    @Post(':userId/remove-friend/:friendId')
    async removeFriend(@Param('userId') userId: string, @Param('friendId') friendId: string, @Res() response: Response) {
        try {
            const result = await this.userService.removeFriend(userId, friendId);
            response.status(HttpStatus.OK).json(result);
        } catch (error) {
            this.logger.error(`Error removing friend: ${error.message}`);
            response.status(HttpStatus.INTERNAL_SERVER_ERROR).json({ message: error.message });
        }
    }

    @UseGuards(AuthGuard)
    @Post(':userId/cancel-friend-request/:friendId')
    async cancelFriendRequest(@Param('userId') userId: string, @Param('friendId') friendId: string, @Res() response: Response) {
        try {
            const result = await this.userService.cancelFriendRequest(userId, friendId);
            response.status(HttpStatus.OK).json(result);
        } catch (error) {
            this.logger.error(`Error canceling friend request: ${error.message}`);
            response.status(HttpStatus.INTERNAL_SERVER_ERROR).json({ message: error.message });
        }
    }

    @UseGuards(AuthGuard)
    @Get(':userId/friends')
    async getFriends(@Param('userId') userId: string, @Res() response: Response) {
        try {
            const friends = await this.userService.getFriends(userId);
            response.status(HttpStatus.OK).json(friends);
        } catch (error) {
            this.logger.error(`Error getting friends: ${error.message}`);
            response.status(HttpStatus.INTERNAL_SERVER_ERROR).json({ message: error.message });
        }
    }

    @UseGuards(AuthGuard)
    @Get(':userId/friend-requests')
    async getFriendRequests(@Param('userId') userId: string, @Res() response: Response) {
        try {
            const friendRequests = await this.userService.getFriendRequests(userId);
            response.status(HttpStatus.OK).json(friendRequests);
        } catch (error) {
            this.logger.error(`Error getting friend requests: ${error.message}`);
            response.status(HttpStatus.INTERNAL_SERVER_ERROR).json({ message: error.message });
        }
    }
}
