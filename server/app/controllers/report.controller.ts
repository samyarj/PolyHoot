import { AuthGuard } from '@app/guards/auth/auth.guard';
import { AuthenticatedRequest } from '@app/interface/authenticated-request';
import { UserService } from '@app/services/auth/user.service';
import { Body, Controller, HttpStatus, Logger, Post, Req, Res, UseGuards } from '@nestjs/common';
import { ApiInternalServerErrorResponse, ApiOkResponse, ApiTags } from '@nestjs/swagger';
import { Response } from 'express';

@ApiTags('Report')
@Controller('report')
export class ReportController {
    constructor(
        private readonly logger: Logger,
        private userService: UserService,
    ) {}

    @UseGuards(AuthGuard)
    @ApiOkResponse({ description: 'User reported successfully' })
    @ApiInternalServerErrorResponse({ description: 'Internal server error' })
    @Post('report')
    async reportUser(@Body() body: { reportedUID: string }, @Req() req: AuthenticatedRequest, @Res() response: Response) {
        this.logger.log(`Report made by user : ${req.user.displayName} for uid: ${body.reportedUID}`);
        try {
            const isReported = await this.userService.reportUser(req.user.uid, body.reportedUID);
            response.status(HttpStatus.OK).json(isReported);
        } catch (error) {
            this.logger.error(`Error reporting user: ${error.message}`);

            response.status(HttpStatus.INTERNAL_SERVER_ERROR).send({ message: error.message || 'Erreur interne du serveur' });
        }
    }

    @ApiOkResponse({ description: 'User reported successfully' })
    @ApiInternalServerErrorResponse({ description: 'Internal server error' })
    @Post('state')
    async getReportState(@Body() body: { uid: string }, @Req() req: AuthenticatedRequest, @Res() response: Response) {
        this.logger.log(`Report state taken for ${body.uid}`);
        try {
            const reportState = await this.userService.getReportState(body.uid);
            return response.status(HttpStatus.OK).json(reportState);
        } catch (error) {
            this.logger.error(`Error reporting user: ${error.message}`);

            response.status(HttpStatus.INTERNAL_SERVER_ERROR).send({ message: error.message || 'Erreur interne du serveur' });
        }
    }
}
