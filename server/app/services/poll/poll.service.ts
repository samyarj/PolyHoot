/* eslint-disable no-underscore-dangle */ // Mongo utilise des attributs avec un underscore
import { ERROR } from '@app/constants/error-messages';
//import { MOCK_POLLZES } from '@app/constants/mock-Polls';
//import { SUCCESS } from '@app/constants/success-messages';
import { CreatePollDto } from '@app/model/dto/poll/create-poll.dto';
import { UpdatePollDto } from '@app/model/dto/poll/update-poll.dto';
import { Poll, PollDocument } from '@app/model/schema/poll/poll';
import { BadRequestException, ConflictException, Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

@Injectable()
export class PollService {
    constructor(
        @InjectModel(Poll.name) private pollModel: Model<PollDocument>,
        private readonly logger: Logger,
    ) {
        //this.start();
    }

    /* async start() {
        const count = await this.pollModel.countDocuments();
        if (count === 0) {
            this.populateDB();
        }
    } */

    /* async populateDB(): Promise<void> {
        try {
            await this.pollModel.insertMany(MOCK_QUIZZES);
            this.logger.log(SUCCESS.QUIZ_INSERTION);
        } catch (error) {
            this.logger.error(ERROR.QUIZ.FAILED_TO_INSERT, error);
        }
    } */

    async getAllPolls(): Promise<Poll[]> {
        try {
            return await this.pollModel.find().exec();
        } catch (error) {
            throw new NotFoundException(ERROR.POLL.LIST_FAILED_TO_LOAD);
        }
    }
    async getPollById(id: string): Promise<Poll> {
        const poll = await this.pollModel.findById(id).exec();
        if (!poll) {
            throw new NotFoundException(ERROR.POLL.ID_NOT_FOUND);
        }
        return poll;
    }

    async createPoll(createPollDto: CreatePollDto): Promise<Poll> {
        const existingPoll = await this.findPollByTitle(createPollDto.title);
        if (existingPoll && existingPoll.title) throw new ConflictException(ERROR.POLL.ALREADY_EXISTS);
        const createdPoll = new this.pollModel(createPollDto);
        return createdPoll.save();
    }

    async verifyAndUpdatePoll(id: string, updatePollDto: UpdatePollDto): Promise<Poll> {
        if (updatePollDto.title) {
            const existingPoll = await this.findPollByTitle(updatePollDto.title);
            if (existingPoll && existingPoll._id.toString() !== id) {
                throw new ConflictException(ERROR.POLL.ALREADY_EXISTS);
            }
        }
        return await this.updatePoll(id, updatePollDto);
    }

    async deletePollById(id: string): Promise<void> {
        try {
            await this.pollModel.deleteOne({ _id: id }).exec();
        } catch (error) {
            throw new NotFoundException(ERROR.POLL.ID_NOT_FOUND);
        }
    }

    private async findPollByTitle(title: string) {
        const escapedTitle = title.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, '\\$&');
        const titleRegex = new RegExp('^' + escapedTitle + '$', 'i');
        return await this.pollModel.findOne({ title: titleRegex });
    }

    private async updatePoll(id: string, updateData: UpdatePollDto): Promise<Poll> {
        const poll = await this.pollModel.findById(id).exec();

        if (!poll) {
            this.logger.log(`Poll avec ID ${id} pas trouvé. Création d'un nouveau...`);
            const createPollDto: CreatePollDto = {
                title: updateData.title,
                description: updateData.description,
                expired: updateData.expired,
                endDate: updateData.endDate,
                questions: updateData.questions,
            };
            try {
                return await this.createPoll(createPollDto);
            } catch (error) {
                this.logger.error(ERROR.POLL.FAILED_TO_CREATE, error);
                throw new BadRequestException(ERROR.POLL.FAILED_TO_CREATE);
            }
        }
        try {
            const updatedPoll = await this.pollModel.findByIdAndUpdate(id, updateData, { new: true }).exec();
            this.logger.log(`Poll avec ID ${id} mis à jour avec succès.`);
            return updatedPoll;
        } catch (error) {
            this.logger.error(ERROR.POLL.FAILED_TO_UPDATE, error);
            throw new NotFoundException(ERROR.POLL.FAILED_TO_UPDATE);
        }
    }
}
