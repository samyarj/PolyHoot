/* eslint-disable max-lines */ // Nous nous permettons de depasser le nombre maximales de lignes du a la grande quantite de
// evenements que la classe doit gerer.
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { SoundPlayer } from '@app/classes/sound-player/sound-player.class';
import { ALERT_SOUND_PATH, TIME_TO_NEXT_ANSWER } from '@app/constants/constants';
import {
    AppRoute,
    ConfirmationMessage,
    ConnectEvents,
    DisconnectEvents,
    GameEvents,
    GameStatus,
    QRLGrade,
    TimerEvents,
} from '@app/constants/enum-class';
import { AnswerQRL } from '@app/interfaces/answer-qrl';
import { GameInfo } from '@app/interfaces/game-info';
import { Modifiers } from '@app/interfaces/modifiers';
import { PointsUpdateQRL } from '@app/interfaces/points-update';
import { Question } from '@app/interfaces/question';
import { QuestionType } from '@app/interfaces/question-type';
import { PlayerListService } from '@app/services/game-services/player-list/player-list.service';
import { ResultsService } from '@app/services/game-services/results-service/results-service.service';
import { MessageHandlerService } from '@app/services/general-services/error-handler/message-handler.service';
import { SocketClientService } from '@app/services/websocket-services/general/socket-client-manager.service';
import { PartialPlayer } from '@common/partial-player';
import { DEFAULT_QUESTION } from './organizer.constants';

@Injectable({
    providedIn: 'root',
})
export class OrganizerService {
    alertSoundPlayer: SoundPlayer = new SoundPlayer(ALERT_SOUND_PATH);
    answersQRL: AnswerQRL[] = [];
    currentQuestion: Question = { id: '0', points: 0, choices: [], type: QuestionType.QCM, text: '' };
    gameInfo: GameInfo = { time: 0, currentQuestionIndex: 0, currentIndex: 0, playersInGame: 0 };
    gameModifiers: Modifiers = { paused: false, alertMode: false };
    gameStatus: GameStatus = GameStatus.WaitingForAnswers;
    isCorrectAnswersArray: boolean[];
    shouldDisconnect: boolean = true;
    private questionsLength: number;
    private pointsAfterCorrection: PointsUpdateQRL[] = [];
    private totalNumberOfAnswers = [0, 0, 0];
    private socketsInitialized: boolean = false;
    // Ce sont des services qui communiquent avec d'autres composantes selon la logique du jeu
    // eslint-disable-next-line max-params
    constructor(
        private messageHandlerService: MessageHandlerService,
        private socketHandlerService: SocketClientService,
        private resultService: ResultsService,
        private router: Router,
        private playerListService: PlayerListService,
    ) {}
    get roomId() {
        return this.socketHandlerService.roomId;
    }

    nextQuestion() {
        this.gameStatus = GameStatus.WaitingForNextQuestion;
        this.socketHandlerService.send(GameEvents.StartQuestionCountdown);
        setTimeout(() => {
            this.gameStatus = GameStatus.WaitingForAnswers;
        }, TIME_TO_NEXT_ANSWER);
    }

    showResults() {
        this.socketHandlerService.send(GameEvents.ShowResults);
    }

    handleSockets() {
        if (!this.socketsInitialized) {
            this.handleQRLAnswer();
            this.handleEveryoneSubmitted();
            this.handlePlayerListSockets();
            this.handleTimeSockets();
            this.handleResultsSockets();
            this.resultService.handleResultsSockets();
            this.handleGameEnded();
            this.socketsInitialized = true;
        }
    }

    gradeAnswer(value: QRLGrade) {
        this.updateTotalAnswersArray(value);
        this.updatePointsForPlayer(value);

        const isLastQuestion = this.gameInfo.currentIndex >= this.answersQRL.length - 1;
        if (isLastQuestion) {
            this.sendInfoToUsers();
        } else {
            this.gameInfo.currentIndex += 1;
        }
    }
    signalUserDisconnect() {
        this.socketHandlerService.send(DisconnectEvents.OrganizerDisconnected);
        this.alertSoundPlayer.stop();
    }

    signalUserConnect() {
        this.socketHandlerService.send(ConnectEvents.UserToGame);
    }
    pauseGame() {
        this.socketHandlerService.send(TimerEvents.Pause);
    }

    startAlertMode() {
        this.socketHandlerService.send(TimerEvents.AlertGameMode);
    }

    initializeAttributes() {
        this.initializeCorrectAnswers();
        this.gameStatus = GameStatus.WaitingForAnswers;
        this.gameModifiers.paused = false;
        this.gameModifiers.alertMode = false;
        this.gameInfo.time = 0;
        this.currentQuestion = DEFAULT_QUESTION;
        this.shouldDisconnect = true;
    }

    abandonGame() {
        this.messageHandlerService.confirmationDialog(ConfirmationMessage.AbandonGame, () => {
            this.router.navigate([AppRoute.CREATE]);
            this.alertSoundPlayer.stop();
        });
    }

    private updatePointsForPlayer(value: QRLGrade) {
        const foundPlayer = this.playerListService.playerList.find((player) => player.name === this.answersQRL[this.gameInfo.currentIndex].player);
        if (foundPlayer && foundPlayer.isInGame) {
            // eslint-disable-next-line @typescript-eslint/no-magic-numbers
            const additionalPoints = this.currentQuestion.points * (value / 100); // Conversion en pourcentage
            this.pointsAfterCorrection.push({
                playerName: foundPlayer.name,
                points: foundPlayer.points + additionalPoints,
            });
        }
    }

    private updateTotalAnswersArray(value: QRLGrade) {
        if (value === QRLGrade.Wrong) this.totalNumberOfAnswers[0] += 1;
        if (value === QRLGrade.Partial) this.totalNumberOfAnswers[1] += 1;
        if (value === QRLGrade.Correct) this.totalNumberOfAnswers[2] += 1;
    }

    private sendInfoToUsers() {
        this.gameStatus = GameStatus.CorrectionFinished;
        this.answersQRL = [];
        this.socketHandlerService.send(GameEvents.CorrectionFinished, {
            pointsTotal: this.pointsAfterCorrection,
            answers: this.totalNumberOfAnswers,
        });
        if (this.gameInfo.currentQuestionIndex + 1 >= this.questionsLength) {
            this.gameStatus = GameStatus.GameFinished;
        }
    }

    private initializeCorrectAnswers() {
        this.isCorrectAnswersArray = [];
        const choices = this.currentQuestion.choices;
        if (choices) {
            for (const choice of choices) {
                if (choice.isCorrect) this.isCorrectAnswersArray.push(true);
                else this.isCorrectAnswersArray.push(false);
            }
        }
    }

    private handleQRLAnswer() {
        this.socketHandlerService.on(GameEvents.QRLAnswerSubmitted, (data: { player: string; playerAnswer: string }) => {
            this.answersQRL.push(data);
            this.answersQRL.sort((a, b) => a.player.toLowerCase().localeCompare(b.player.toLowerCase()));
        });
    }

    private handleEveryoneSubmitted() {
        this.socketHandlerService.on(GameEvents.EveryoneSubmitted, () => {
            this.gameStatus = GameStatus.OrganizerCorrecting;
        });
    }

    private handlePlayerStatus() {
        this.socketHandlerService.on(GameEvents.PlayerStatusUpdate, (player: { name: string; isInGame: boolean }) => {
            this.playerListService.updatePlayerPresence(player.name, player.isInGame);
            if (player.isInGame === false) {
                this.answersQRL = this.answersQRL.filter((playerGraded) => playerGraded.player !== player.name);
            }
        });
    }

    private handlePlayerPoints() {
        this.socketHandlerService.on(GameEvents.OrganizerPointsUpdate, (player: { name: string; points: number }) => {
            this.playerListService.updatePlayerPoints(player.name, player.points);
        });
    }
    private handlePlayerList() {
        this.socketHandlerService.on(GameEvents.SendPlayerList, (playerList: PartialPlayer[]) => {
            if (playerList.length === 0) {
                this.router.navigate([AppRoute.CREATE]);
                this.messageHandlerService.popUpErrorDialog('Les joueurs ont tous quitté la partie!');
                this.signalUserDisconnect();
                return;
            }
            this.gameInfo.playersInGame = playerList.filter((player) => player.isInGame).length;
            this.playerListService.playerList = playerList;
            this.playerListService.noPlayers = playerList.length;
        });
    }

    private handlePlayerListSockets() {
        this.handlePlayerStatus();
        this.handlePlayerPoints();
        this.handlePlayerList();
    }

    private handleTimerValue() {
        this.socketHandlerService.on(TimerEvents.Value, (time: number) => {
            this.gameInfo.time = time;
        });
        this.socketHandlerService.on(TimerEvents.QuestionCountdownValue, (time: number) => {
            this.gameInfo.time = time;
        });
        this.socketHandlerService.on(TimerEvents.Paused, (pauseState: boolean) => {
            this.gameModifiers.paused = pauseState;
        });
        this.socketHandlerService.on(TimerEvents.AlertModeStarted, () => {
            this.gameModifiers.alertMode = true;
            this.alertSoundPlayer.play();
        });
    }

    private handleTimerEnd() {
        this.socketHandlerService.on(TimerEvents.QuestionCountdownEnd, () => {
            this.alertSoundPlayer.stop();
        });

        this.socketHandlerService.on(TimerEvents.End, () => {
            this.socketHandlerService.send(GameEvents.QuestionEndByTimer);
        });
    }

    private handleQuestionsLength() {
        this.socketHandlerService.on(GameEvents.QuestionsLength, (length: number) => {
            this.questionsLength = length;
        });
    }

    private handleNextQuestion() {
        // Si tout le monde repond a une question QCM, on saute directement a l'etat ou la correction est terminee.
        this.socketHandlerService.on(GameEvents.ProceedToNextQuestion, () => {
            if (this.currentQuestion.type === QuestionType.QCM || this.currentQuestion.type === QuestionType.QRE) {
                this.gameStatus = GameStatus.CorrectionFinished;
                if (this.gameInfo.currentQuestionIndex + 1 >= this.questionsLength) {
                    this.gameStatus = GameStatus.GameFinished;
                }
            }
        });
        this.socketHandlerService.on(GameEvents.NextQuestion, (nextQuestion: { question: Question; index: number }) => {
            this.playerListService.resetPlayerList();
            this.answersQRL = [];
            this.pointsAfterCorrection = [];
            this.totalNumberOfAnswers = [0, 0, 0];
            this.gameInfo.currentIndex = 0;
            this.gameModifiers = { paused: false, alertMode: false };
            this.gameInfo.currentQuestionIndex = nextQuestion.index;
            this.currentQuestion = nextQuestion.question;
            this.initializeCorrectAnswers();
        });
    }

    private handleTimeSockets() {
        this.handleTimerValue();
        this.handleTimerEnd();
        this.handleQuestionsLength();
        this.handleNextQuestion();
    }

    private handleResultsSockets() {
        this.socketHandlerService.on(GameEvents.SendResults, () => {
            this.shouldDisconnect = false;
            this.router.navigate([AppRoute.RESULTS]);
            this.alertSoundPlayer.stop();
        });
    }

    private handleGameEnded() {
        this.socketHandlerService.on(ConnectEvents.AllPlayersLeft, () => {
            this.router.navigate([AppRoute.CREATE]);
            this.messageHandlerService.popUpErrorDialog('Les joueurs ont tous quitté la partie!');
            this.alertSoundPlayer.stop();
        });
    }
}
