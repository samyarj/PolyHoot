/* eslint-disable no-underscore-dangle */ // Mongo utilise des attributs avec un underscore
import { ERROR } from '@app/constants/error-messages';
import { MOCK_QUESTIONS } from '@app/constants/mock-questions';
import { SUCCESS } from '@app/constants/success-messages';
import { CreateQuestionDto } from '@app/model/dto/question/create-question.dto';
import { UpdateQuestionDto } from '@app/model/dto/question/update-question.dto';
import { QuestionChoice } from '@app/model/schema/question-choice/question-choice';
import { Question, QuestionDocument } from '@app/model/schema/question/question';
import { ConflictException, Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

@Injectable()
export class QuestionService {
    constructor(
        @InjectModel(Question.name) private questionModel: Model<QuestionDocument>,
        private readonly logger: Logger,
    ) {
        this.start();
    }
    async verifyAnswers(currentQuestion: Question): Promise<boolean> {
        if (currentQuestion.type === 'QCM') {
            if (this.choiceVerifier(currentQuestion.choices)) {
                return true;
            }
        }
        return false;
    }

    async start() {
        const count = await this.questionModel.countDocuments();
        if (count === 0) {
            this.populateDB();
        }
    }

    async populateDB(): Promise<void> {
        try {
            await this.questionModel.insertMany(MOCK_QUESTIONS);
            this.logger.log(SUCCESS.QUESTION_INSERTION);
        } catch (error) {
            this.logger.error(ERROR.QUESTION.FAILED_TO_INSERT, error);
        }
    }

    async getAllQuestions(): Promise<Question[]> {
        try {
            return await this.questionModel.find().exec();
        } catch (error) {
            throw new NotFoundException(ERROR.QUESTION.LIST_FAILED_TO_LOAD);
        }
    }

    async getQuestionById(id: string): Promise<Question> {
        try {
            return await this.questionModel.findById(id).exec();
        } catch (error) {
            throw new NotFoundException(ERROR.QUESTION.ID_NOT_FOUND);
        }
    }

    async createQuestion(createQuestionDto: CreateQuestionDto): Promise<Question> {
        const existingQuestion = await this.findQuestionByText(createQuestionDto.text);

        if (existingQuestion) {
            throw new ConflictException(ERROR.QUESTION.ALREADY_EXISTS);
        }
        const createdQuestion = new this.questionModel(createQuestionDto);
        return createdQuestion.save();
    }

    async verifyAndUpdateQuestion(id: string, updateData: UpdateQuestionDto): Promise<Question> {
        const existingQuestion = await this.findQuestionByText(updateData.text);
        if (existingQuestion && existingQuestion._id.toString() !== id) {
            throw new ConflictException(ERROR.QUESTION.ALREADY_EXISTS);
        }
        return await this.updateQuestion(id, updateData);
    }

    async deleteQuestionById(id: string): Promise<void> {
        try {
            await this.questionModel.deleteOne({ _id: id }).exec();
            this.logger.log(`Question avec ID ${id} supprimée avec succès`);
        } catch (error) {
            this.logger.error(ERROR.QUESTION.ID_NOT_FOUND);
            throw new NotFoundException(ERROR.QUESTION.ID_NOT_FOUND);
        }
    }

    private async findQuestionByText(text: string) {
        const escapedText = text.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, '\\$&');
        const titleRegex = new RegExp('^' + escapedText + '$', 'i');
        return await this.questionModel.findOne({ text: titleRegex });
    }

    private async updateQuestion(id: string, updateData: UpdateQuestionDto): Promise<Question> {
        try {
            const updatedQuestion = await this.questionModel.findByIdAndUpdate(id, updateData, { new: true }).exec();
            this.logger.log(`Question avec ID ${id} mis à jour avec succès`);
            return updatedQuestion;
        } catch (error) {
            this.logger.error(ERROR.QUESTION.FAILED_TO_UPDATE, error);
            throw new NotFoundException(ERROR.QUESTION.ID_NOT_FOUND);
        }
    }

    private choiceVerifier(choices: QuestionChoice[]): boolean {
        if (choices.length === 0) return false;
        let correct = true;
        for (const choice of choices) {
            if (choice.isCorrect) {
                if (!choice.isSelected) correct = false;
            } else {
                if (choice.isSelected) correct = false;
            }
        }
        return correct;
    }
}
