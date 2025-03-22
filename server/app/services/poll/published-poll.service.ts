/* eslint-disable no-underscore-dangle */ // Mongo utilise des attributs avec un underscore
import { ERROR } from '@app/constants/error-messages';
import { PublishedPoll, PublishedPollDocument } from '@app/model/schema/poll/published-poll.schema';
import { BadRequestException, Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

@Injectable()
export class PublishedPollService {
    constructor(
        @InjectModel(PublishedPoll.name) private publishedPollModel: Model<PublishedPollDocument>,
        private readonly logger: Logger,
    ) {}

    async getAllPublishedPolls(): Promise<PublishedPoll[]> {
        try {
            return await this.publishedPollModel.find().exec();
        } catch (error) {
            throw new NotFoundException(ERROR.POLL.LIST_FAILED_TO_LOAD);
        }
    }

    async getPublishedPollById(id: string): Promise<PublishedPoll> {
        const publishedPoll = await this.publishedPollModel.findById(id).exec();
        if (!publishedPoll) {
            throw new NotFoundException(ERROR.POLL.ID_NOT_FOUND);
        }
        return publishedPoll;
    }

    async deletePublishedPollById(id: string): Promise<void> {
        try {
            await this.publishedPollModel.deleteOne({ _id: id }).exec();
        } catch (error) {
            throw new NotFoundException(ERROR.POLL.ID_NOT_FOUND);
        }
    }

    async updatePublishedPollVotes(id: string, results: number[]): Promise<PublishedPoll> {
        // 1. Vérifier que le sondage publié existe
        const publishedPoll = await this.publishedPollModel.findById(id).exec();
        if (!publishedPoll) {
            throw new NotFoundException(ERROR.POLL.ID_NOT_FOUND);
        }

        // 2. Vérifier que results est valide
        if (!results || !Array.isArray(results)) {
            throw new BadRequestException(ERROR.POLL.INVALID_RESULTS);
        }

        // 3. Mettre à jour totalVotes en fonction des results
        for (let i = 0; i < results.length; i++) {
            const questionIndex = i; // Index de la question
            const choiceIndex = results[i]; // Index du choix sélectionné pour cette question

            // Vérifier que l'index du choix est valide
            if (choiceIndex < 0 || choiceIndex >= publishedPoll.totalVotes[questionIndex].length) {
                throw new BadRequestException(ERROR.POLL.INVALID_CHOICE_INDEX);
            }

            // Incrémenter le vote pour le choix sélectionné
            publishedPoll.totalVotes[questionIndex][choiceIndex]++;
        }

        // 4. Sauvegarder les modifications
        const updatedPublishedPoll = await publishedPoll.save();

        return updatedPublishedPoll;
    }
}
