import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { SoundPlayer } from '@app/classes/sound-player/sound-player.class';
import { ALERT_SOUND_PATH } from '@app/constants/constants';
import {
    AppRoute,
    ChoiceFeedback,
    ConfirmationMessage,
    ConnectEvents,
    DisconnectEvents,
    GameEvents,
    JoinEvents,
    TimerEvents,
} from '@app/constants/enum-class';
import { PlayerInfo } from '@app/interfaces/player-info';
import { Question } from '@app/interfaces/question';
import { ResultsService } from '@app/services/game-services/results-service/results-service.service';
import { MessageHandlerService } from '@app/services/general-services/error-handler/message-handler.service';
import { SocketClientService } from '@app/services/websocket-services/general/socket-client-manager.service';

@Injectable({
    providedIn: 'root',
})
export class GameClientService {
    alertSoundPlayer: SoundPlayer = new SoundPlayer(ALERT_SOUND_PATH);
    choiceFeedback: ChoiceFeedback = ChoiceFeedback.Idle;
    currentQuestion: Question;
    currentQuestionIndex = 0;
    gamePaused: boolean = false;
    playerInfo: PlayerInfo = { submitted: false, userFirst: false, choiceSelected: [], waitingForQuestion: false };
    playerPoints: number = 0;
    pointsReceived: number = 0;
    quizTitle: string;
    shouldDisconnect: boolean = true;
    time: number = 0;
    answer: string = '';
    private finalAnswer: boolean;
    private realShowAnswers: boolean;
    private socketsInitialized: boolean = false;
    private interacted: boolean = false;

    // constructeur a 4 parametres permis selon les charges et le prof, etant donne la nature des attributs
    // eslint-disable-next-line max-params
    constructor(
        private socketHandler: SocketClientService,
        private router: Router,
        private resultService: ResultsService,
        private messageHandlerService: MessageHandlerService,
    ) {
        this.resetAttributes();
    }

    get showAnswers(): boolean {
        return this.realShowAnswers;
    }

    get roomId() {
        return this.socketHandler.roomId;
    }

    get isRandomMode() {
        return this.socketHandler.isRandomMode;
    }

    selectChoice(indexChoice: number): boolean {
        if (this.time > 0 && !this.finalAnswer) {
            if (!this.interacted) {
                this.interacted = true;
                this.socketHandler.send(GameEvents.PlayerInteraction);
            }
            if (this.currentQuestion.choices && this.currentQuestion.choices[indexChoice]) {
                this.currentQuestion.choices[indexChoice].isSelected = !this.currentQuestion.choices[indexChoice].isSelected;
                this.playerInfo.choiceSelected[indexChoice] = !this.playerInfo.choiceSelected[indexChoice];
                this.socketHandler.send(GameEvents.SelectFromPlayer, { choice: indexChoice });
                return true;
            }
        }
        return false;
    }

    /*     sendModifyUpdate(modified: boolean) {
        if (!this.interacted) {
            this.interacted = true;
            this.socketHandler.send(GameEvents.PlayerInteraction);
        }
        this.socketHandler.send(GameEvents.ModifyUpdate, { playerName: this.socketHandler.playerName, modified });
    } */

    finalizeAnswer() {
        this.playerInfo.submitted = true;
        this.choiceFeedback = ChoiceFeedback.Awaiting;

        if (!this.finalAnswer && this.time > 0) {
            this.finalAnswer = true;
            this.socketHandler.send(GameEvents.FinalizePlayerAnswer);
        }
    }

    handleSockets() {
        if (!this.socketsInitialized) {
            this.handleWaitingForCorrection();
            this.handleTimerValue();
            this.goToNextQuestion();
            this.getTitle();
            this.playerPointsUpdate();
            this.organizerHasDisconnected();
            this.showEndResults();
            this.resultService.handleResultsSockets();
            this.socketsInitialized = true;
        }
    }

    resetAttributes() {
        this.choiceFeedback = ChoiceFeedback.Idle;
        this.answer = '';
        this.interacted = false;
        this.gamePaused = false;
        this.finalAnswer = false;
        this.realShowAnswers = false;
        this.playerInfo.userFirst = false;
        this.playerInfo.waitingForQuestion = false;
        this.playerInfo.choiceSelected = [false, false, false, false];
        this.shouldDisconnect = true;
        // this.socketsInitialized = false;
        if (this.currentQuestion && this.currentQuestion.choices) {
            for (const choice of this.currentQuestion.choices) {
                choice.isSelected = false;
            }
        }
    }

    resetInformationFields() {
        this.currentQuestion = {
            type: '',
            text: '',
            points: 0,
        };
    }

    getTitle() {
        this.socketHandler.send(JoinEvents.TitleRequest, (title: string) => {
            this.quizTitle = title;
        });
    }
    signalUserDisconnect() {
        this.socketHandler.isRandomMode = false;
        this.socketHandler.send(DisconnectEvents.Player);
        this.alertSoundPlayer.stop();
    }

    signalUserConnect() {
        this.socketHandler.send(ConnectEvents.UserToGame);
    }
    sendAnswerForCorrection(answer: string) {
        this.socketHandler.send(GameEvents.QRLAnswerSubmitted, { player: this.socketHandler.playerName, playerAnswer: answer });
    }

    abandonGame() {
        this.messageHandlerService.confirmationDialog(ConfirmationMessage.AbandonGame, () => {
            this.socketHandler.isRandomMode = false;
            this.router.navigate([AppRoute.HOME]);
            this.alertSoundPlayer.stop();
        });
    }

    private handleTimerValue() {
        this.socketHandler.on(TimerEvents.Paused, (pauseState: boolean) => {
            this.gamePaused = pauseState;
        });
        this.socketHandler.on(TimerEvents.AlertModeStarted, () => {
            this.alertSoundPlayer.play();
        });
        this.socketHandler.on(TimerEvents.QuestionCountdownValue, (time: number) => {
            this.gamePaused = false;
            this.playerInfo.waitingForQuestion = true;
            this.time = time;
        });
        this.socketHandler.on(TimerEvents.QuestionCountdownEnd, () => {
            this.playerInfo.waitingForQuestion = false;
            this.alertSoundPlayer.stop();
        });

        this.socketHandler.on(TimerEvents.Value, (time: number) => {
            this.time = time;
        });
        this.socketHandler.on(TimerEvents.End, (time: number) => {
            this.time = time;
        });
    }

    private handleWaitingForCorrection() {
        this.socketHandler.on(GameEvents.WaitingForCorrection, () => {
            this.choiceFeedback = ChoiceFeedback.AwaitingCorrection;
        });
    }

    private goToNextQuestion() {
        this.socketHandler.on(GameEvents.NextQuestion, (nextQuestion: { question: Question; index: number }) => {
            if (nextQuestion && nextQuestion.index != null) {
                this.resetAttributes();
                this.playerInfo.submitted = false;
                this.currentQuestionIndex = nextQuestion.index;
                this.currentQuestion = nextQuestion.question;
            } else {
                if (this.isRandomMode) {
                    this.socketHandler.send(GameEvents.ShowResults);
                }
            }
        });
    }
    private playerPointsUpdate() {
        this.socketHandler.on(GameEvents.PlayerPointsUpdate, (playerQuestionInfo: { points: number; isFirst: boolean }) => {
            if (playerQuestionInfo.points === this.playerPoints + this.currentQuestion.points) {
                this.choiceFeedback = ChoiceFeedback.Correct;
            } else if (playerQuestionInfo.points === this.playerPoints) {
                this.choiceFeedback = ChoiceFeedback.Incorrect;
            } else {
                this.choiceFeedback = ChoiceFeedback.Partial;
            }
            if (playerQuestionInfo.isFirst) {
                this.playerInfo.userFirst = playerQuestionInfo.isFirst;
                this.choiceFeedback = ChoiceFeedback.First;
            }

            this.playerPoints = playerQuestionInfo.points;
            this.pointsReceived = playerQuestionInfo.points;
            this.playerInfo.userFirst = playerQuestionInfo.isFirst;
            this.realShowAnswers = true;
            this.playerInfo.choiceSelected = [false, false, false, false];
        });
    }

    private organizerHasDisconnected() {
        this.socketHandler.on(DisconnectEvents.OrganizerHasLeft, () => {
            this.router.navigate([AppRoute.HOME]);
            if (!this.socketHandler.isOrganizer) {
                this.messageHandlerService.popUpErrorDialog("L'organisateur a mis fin brusquement à la partie");
                this.alertSoundPlayer.stop();
            }
        });
    }

    private showEndResults() {
        this.socketHandler.on(GameEvents.SendResults, () => {
            this.shouldDisconnect = false;
            this.router.navigate([AppRoute.RESULTS]);
            this.alertSoundPlayer.stop();
            this.socketHandler.canChat = true;
        });
    }
}
