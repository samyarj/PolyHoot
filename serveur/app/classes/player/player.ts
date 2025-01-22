import { QuestionType } from '@app/constants/enum-classes';
import { Question } from '@app/model/schema/question/question';
import { Injectable } from '@nestjs/common';
import { ConnectedSocket } from '@nestjs/websockets';
import { Socket } from 'socket.io';
import { BONUS_MULTIPLIER } from '@app/constants';

@Injectable()
export class Player {
    name: string;
    points: number;
    noBonusesObtained: number;
    isInGame: boolean;
    isOrganizer: boolean;
    isFirst: boolean;
    socket: Socket;
    submitted: boolean;
    interacted: boolean;
    currentChoices: boolean[];
    canChat: boolean;

    constructor(name: string, isOrganizer: boolean, @ConnectedSocket() client: Socket) {
        this.name = name;
        this.isOrganizer = isOrganizer;
        this.isInGame = false;
        this.points = 0;
        this.noBonusesObtained = 0;
        this.socket = client;
        this.submitted = false;
        this.interacted = false;
        this.currentChoices = [false, false, false, false];
        this.canChat = true;
    }

    prepareForNextQuestion() {
        this.interacted = false;
        this.isFirst = false;
        this.submitted = false;
        this.currentChoices = [false, false, false, false];
    }

    updatePlayerPoints(currentQuestion: Question) {
        const correct = this.verifyIfAnswersCorrect(currentQuestion);
        if (correct) {
            if (this.isFirst) this.points += currentQuestion.points * BONUS_MULTIPLIER;
            else this.points += currentQuestion.points;
        }
    }

    verifyIfAnswersCorrect(currentQuestion: Question) {
        let correct = true;
        if (currentQuestion.type === QuestionType.QCM) {
            const choices = currentQuestion.choices;
            const hasChoices = choices && choices.length > 0;
            if (hasChoices) {
                for (let choiceIndex = 0; choiceIndex < choices.length; choiceIndex++) {
                    if (choices[choiceIndex].isCorrect !== this.currentChoices[choiceIndex]) correct = false;
                }
            }
        }
        return correct;
    }
}
