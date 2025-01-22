import { ChoiceFeedback } from '@app/constants/enum-class';
import { Question } from '@app/interfaces/question';
import { QuestionType } from '@app/interfaces/question-type';
import { GameClientService } from '@app/services/game-services/game-client/game-client.service';
import { TestClientService } from '@app/services/game-services/test-client/test-client.service';

type PlayingService = TestClientService | GameClientService;

export abstract class PlayingComponent {
    // car utilise dans le html.
    // eslint-disable-next-line @typescript-eslint/naming-convention
    readonly MAX_CHARACTERS = 200;
    isKeyAlreadyPressed: boolean = false;
    service: PlayingService;
    answer: string = '';
    get choiceFeedback(): ChoiceFeedback {
        return this.service.choiceFeedback;
    }
    get time(): number {
        return this.service.time;
    }

    get currentQuestion(): Question {
        return this.service.currentQuestion;
    }

    get currentIndex(): number {
        return this.service.currentQuestionIndex;
    }

    get playerPoints(): number {
        return this.service.playerPoints;
    }

    abstract get gamePaused(): boolean;

    abstract get quizTitle(): string;

    abstract get submitted(): boolean;

    abstract get userFirst(): boolean;

    abstract get quizReady(): boolean;

    abstract get isTesting(): boolean;

    abstract get choiceSelected(): boolean[];

    abstract get showAnswers(): boolean;

    abstract get waitingForQuestion(): boolean;
    defaultKeyDownHandler(event: KeyboardEvent): void {
        if (this.isKeyAlreadyPressed) {
            return;
        }

        this.isKeyAlreadyPressed = true;

        if (event.key === 'Enter') {
            this.finalizeAnswer();
        }
        if (this.service.currentQuestion.type === QuestionType.QCM) {
            switch (event.key) {
                case '1':
                    this.selectChoice(0);
                    break;
                case '2':
                    this.selectChoice(1);
                    break;
                case '3':
                    this.selectChoice(2);
                    break;
                case '4':
                    this.selectChoice(3);
                    break;
            }
        }
    }

    defaultKeyUpHandler(event: KeyboardEvent): void {
        if (event.key === 'Enter' || (event.key >= '1' && event.key <= '4')) {
            this.isKeyAlreadyPressed = false;
        }
    }
    abstract abandonGame(): void;

    abstract finalizeAnswer(): void;

    abstract textAreaModified(): void;

    abstract selectChoice(indexChoice: number): void;
}
