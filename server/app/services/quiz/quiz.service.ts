/* eslint-disable no-underscore-dangle */ // Mongo utilise des attributs avec un underscore
import { ERROR } from '@app/constants/error-messages';
import { MOCK_QUIZZES } from '@app/constants/mock-quizzes';
import { SUCCESS } from '@app/constants/success-messages';
import { CreateQuizDto } from '@app/model/dto/quiz/create-quiz.dto';
import { UpdateQuizDto } from '@app/model/dto/quiz/update-quiz.dto';
import { Quiz, QuizDocument } from '@app/model/schema/quiz/quiz';
import { BadRequestException, ConflictException, Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

@Injectable()
export class QuizService {
    constructor(
        @InjectModel(Quiz.name) private quizModel: Model<QuizDocument>,
        private readonly logger: Logger,
    ) {
        this.start();
    }

    async start() {
        const count = await this.quizModel.countDocuments();
        if (count === 0) {
            this.populateDB();
        }
    }

    async populateDB(): Promise<void> {
        try {
            await this.quizModel.insertMany(MOCK_QUIZZES);
            this.logger.log(SUCCESS.QUIZ_INSERTION);
        } catch (error) {
            this.logger.error(ERROR.QUIZ.FAILED_TO_INSERT, error);
        }
    }

    async getAllQuizzes(): Promise<Quiz[]> {
        try {
            return await this.quizModel.find().exec();
        } catch (error) {
            throw new NotFoundException(ERROR.QUIZ.LIST_FAILED_TO_LOAD);
        }
    }
    async getQuizById(id: string): Promise<Quiz> {
        const quiz = await this.quizModel.findById(id).exec();
        if (!quiz) {
            throw new NotFoundException(ERROR.QUIZ.ID_NOT_FOUND);
        }
        return quiz;
    }

    async createQuiz(createQuizDto: CreateQuizDto): Promise<Quiz> {
        const existingQuiz = await this.findQuizByTitle(createQuizDto.title);
        if (existingQuiz && existingQuiz.title !== 'Mode aléatoire') throw new ConflictException(ERROR.QUIZ.ALREADY_EXISTS);
        const createdQuiz = new this.quizModel(createQuizDto);
        return createdQuiz.save();
    }

    async verifyAndUpdateQuiz(id: string, updateQuizDto: UpdateQuizDto): Promise<Quiz> {
        if (updateQuizDto.title) {
            const existingQuiz = await this.findQuizByTitle(updateQuizDto.title);
            if (existingQuiz && existingQuiz._id.toString() !== id) {
                throw new ConflictException(ERROR.QUIZ.ALREADY_EXISTS);
            }
        }
        return await this.updateQuiz(id, updateQuizDto);
    }

    async deleteQuizById(id: string): Promise<void> {
        try {
            await this.quizModel.deleteOne({ _id: id }).exec();
        } catch (error) {
            throw new NotFoundException(ERROR.QUIZ.ID_NOT_FOUND);
        }
    }

    async toggleQuizVisibility(id: string): Promise<Quiz> {
        const updatedQuiz = await this.quizModel.findByIdAndUpdate(id, [{ $set: { visibility: { $not: '$visibility' } } }], { new: true }).exec();

        if (!updatedQuiz) {
            throw new NotFoundException(ERROR.QUIZ.ID_NOT_FOUND);
        }

        this.logger.log(`Quiz avec ID ${id} est visible : ${updatedQuiz.visibility}.`);
        return updatedQuiz;
    }

    private async findQuizByTitle(title: string) {
        const escapedTitle = title.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, '\\$&');
        const titleRegex = new RegExp('^' + escapedTitle + '$', 'i');
        return await this.quizModel.findOne({ title: titleRegex });
    }

    private async updateQuiz(id: string, updateData: UpdateQuizDto): Promise<Quiz> {
        const quiz = await this.quizModel.findById(id).exec();

        if (!quiz) {
            this.logger.log(`Quiz avec ID ${id} pas trouvé. Création d'un nouveau...`);
            const createQuizDto: CreateQuizDto = {
                title: updateData.title,
                description: updateData.description,
                duration: updateData.duration,
                lastModification: updateData.lastModification,
                questions: updateData.questions,
            };
            try {
                return await this.createQuiz(createQuizDto);
            } catch (error) {
                this.logger.error(ERROR.QUIZ.FAILED_TO_CREATE, error);
                throw new BadRequestException(ERROR.QUIZ.FAILED_TO_CREATE);
            }
        }
        try {
            const updatedQuiz = await this.quizModel.findByIdAndUpdate(id, updateData, { new: true }).exec();
            this.logger.log(`Quiz avec ID ${id} mis à jour avec succès.`);
            return updatedQuiz;
        } catch (error) {
            this.logger.error(ERROR.QUIZ.FAILED_TO_UPDATE, error);
            throw new NotFoundException(ERROR.QUIZ.FAILED_TO_UPDATE);
        }
    }
}
