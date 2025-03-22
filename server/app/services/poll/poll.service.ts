/* eslint-disable no-underscore-dangle */ // Mongo utilise des attributs avec un underscore
import { ERROR } from '@app/constants/error-messages';
//import { MOCK_POLLZES } from '@app/constants/mock-Polls';
//import { SUCCESS } from '@app/constants/success-messages';
import { CreatePollDto } from '@app/model/dto/poll/create-poll.dto';
import { CreatePublishedPollDto } from '@app/model/dto/poll/create-published-poll.dto';
import { UpdatePollDto } from '@app/model/dto/poll/update-poll.dto';
import { Poll, PollDocument } from '@app/model/schema/poll/poll';
import { PublishedPoll, PublishedPollDocument } from '@app/model/schema/poll/published-poll.schema';
import { BadRequestException, ConflictException, Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

@Injectable()
export class PollService {
    constructor(
        @InjectModel(Poll.name) private pollModel: Model<PollDocument>,
        @InjectModel(PublishedPoll.name)private publishedPollModel: Model<PublishedPollDocument>,
        private readonly logger: Logger,
    ) {}

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
        // Vérifier si un sondage avec le même titre existe déjà
        const existingPoll = await this.findPollByTitle(createPollDto.title);
        if (existingPoll && existingPoll.title) {
            throw new ConflictException(ERROR.POLL.ALREADY_EXISTS);
        }
        const createdPoll = new this.pollModel(createPollDto);
        return createdPoll.save();
    }

    async createPublishedPoll(createPublishedPollDto: CreatePublishedPollDto): Promise<Poll> {
        const createdPublishedPoll = new this.publishedPollModel(createPublishedPollDto);
        return createdPublishedPoll.save();
    }

    async verifyAndUpdatePoll(id: string, updatePollDto: UpdatePollDto): Promise<Poll> {
        return await this.updatePoll(id, updatePollDto);
    }

    async deletePollById(id: string): Promise<void> {
        try {
            await this.pollModel.deleteOne({ _id: id }).exec();
        } catch (error) {
            throw new NotFoundException(ERROR.POLL.ID_NOT_FOUND);
        }
    }

    private async findPollByTitle(title: string): Promise<Poll | null> {
        try {
            // Recherche un sondage avec le titre exact (insensible à la casse)
            return await this.pollModel.findOne({ title: { $regex: new RegExp(`^${title}$`, 'i') } }).exec();
        } catch (error) {
            this.logger.error(`Erreur lors de la recherche du sondage par titre : ${title}`, error);
            throw new NotFoundException(ERROR.POLL.FAILED_TO_FIND_BY_TITLE);
        }
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
