/* eslint-disable max-params */
// constructeur a 5 parametres permis selon les charges et le prof
import { Timer } from '@app/classes/game-timer/game-timer';
import { Player } from '@app/classes/player/player';
import { TIME_FOR_QRL } from '@app/constants';
import { GameEvents, GameState, QuestionType, TimerEvents } from '@app/constants/enum-classes';
import { Quiz } from '@app/model/schema/quiz/quiz';
import { PartialPlayer, PlayerResult } from '@common/partial-player';
import { Injectable } from '@nestjs/common';
import { ConnectedSocket } from '@nestjs/websockets';
import { Socket } from 'socket.io';
import { ALERT_MODE_TIME_LIMITS, ANSWER_TIME_INTERVAL } from './game.constants';

@Injectable()
export class Game {
    bannedNames: string[];
    quiz: Quiz;
    isLocked: boolean;
    roomId: string;
    players: Player[];
    gameState: GameState = GameState.HOME;
    timer: Timer;
    playersRemoved: Player[];
    organizer: Player;
    private playersReadyForNext: boolean;
    private currentQuestionIndex: number;
    private lastFinalizeCall: number | null;
    private lastFinalizePlayer: Player;

    constructor(roomId: string, quiz: Quiz, @ConnectedSocket() client: Socket) {
        this.initializeGame(roomId, quiz, client);
    }

    addPlayer(player: Player, @ConnectedSocket() client: Socket) {
        client.join(this.roomId);
        this.players.push(player);
    }

    removePlayer(playerName: string): Player[] {
        console.log("removePlayer", playerName, this.players);
        const index = this.players.findIndex((player) => player.name.toLowerCase() === playerName.toLowerCase());
        const outRangeIndex = -1;
        if (index !== outRangeIndex) {
            this.players[index].socket.leave(this.roomId);
            return this.players.splice(index, 1);
        }
    }

    validPlayer(playerName: string): boolean {
        const trimmedPlayerName = playerName.trim();
        return (
            trimmedPlayerName &&
            !this.isPlayerBanned(trimmedPlayerName) &&
            !this.isNameOrganizer(trimmedPlayerName)
        );
    }

    isPlayerBanned(playerName: string): boolean {
        const lowerCasePlayerName = playerName.toLowerCase();
        return this.bannedNames.some((name) => name.toLowerCase() === lowerCasePlayerName);
    }

    isNameOrganizer(playerName: string): boolean {
        const trimmedPlayerName = playerName.trim();
        const isOrganizer = trimmedPlayerName.toLowerCase() === 'organisateur';
        return isOrganizer;
    }

    isGameReadyToStart() {
        let ready = true;
        if (!this.organizer.isInGame) ready = false;
        this.players.forEach((player: Player) => {
            if (!player.isInGame) ready = false;
        });
        return ready;
    }

    startGame() {
        this.givePlayerList();
        const timeDuration = this.quiz.questions[this.currentQuestionIndex].type === QuestionType.QRL ? TIME_FOR_QRL : this.quiz.duration;
        this.timer.startTimer(timeDuration, TimerEvents.Value, TimerEvents.End);
        return { question: this.quiz.questions[this.currentQuestionIndex], index: this.currentQuestionIndex, length: this.quiz.questions.length };
    }

    pauseGame() {
        this.timer.pause(TimerEvents.Value, TimerEvents.End);
    }

    startAlertMode() {
        const typeOfQuestion: string = this.quiz.questions[this.currentQuestionIndex].type;
        if (
            (typeOfQuestion === QuestionType.QCM && this.timer.timerValue > ALERT_MODE_TIME_LIMITS.QCM) ||
            (typeOfQuestion === QuestionType.QRL && this.timer.timerValue > ALERT_MODE_TIME_LIMITS.QRL)
        )
            this.timer.startAlertMode();
    }

    toggleGameLock(): boolean {
        this.isLocked = !this.isLocked;
        return this.isLocked;
    }

    nextQuestion() {
        if (this.currentQuestionIndex + 1 < this.quiz.questions.length) {
            if (this.playersReadyForNext) {
                this.playersReadyForNext = false;
                this.lastFinalizeCall = null;
                this.currentQuestionIndex++;
                const timeDuration = this.quiz.questions[this.currentQuestionIndex].type === QuestionType.QRL ? TIME_FOR_QRL : this.quiz.duration;
                this.timer.startTimer(timeDuration, TimerEvents.Value, TimerEvents.End);
                this.timer.isPaused = false;
                return { question: this.quiz.questions[this.currentQuestionIndex], index: this.currentQuestionIndex };
            }
        }
    }

    getResults() {
        if (this.currentQuestionIndex + 1 >= this.quiz.questions.length) {
            const playerList: PlayerResult[] = [];
            this.players.forEach((player: Player) => {
                playerList.push({ name: player.name, points: player.points, isInGame: player.isInGame, noBonusesObtained: player.noBonusesObtained });
            });
            this.playersRemoved.forEach((player: Player) => {
                player.isInGame = false;
                playerList.push({ name: player.name, points: player.points, isInGame: player.isInGame, noBonusesObtained: player.noBonusesObtained });
            });
            const resultsData = playerList;
            return resultsData;
        }
    }

    findTargetedPlayer(@ConnectedSocket() client: Socket) {
        return this.players.find((player: Player) => {
            return player.socket.id === client.id;
        });
    }

    updatePointsQRL(data: { pointsTotal: { playerName: string; points: number }[]; answers: number[] }) {
        data.pointsTotal.forEach((dataPlayer) => {
            const client = this.players.find((player) => player.name === dataPlayer.playerName);
            client.socket.emit(GameEvents.PlayerPointsUpdate, { points: dataPlayer.points, isFirst: false, exactAnswer: false });
            this.organizer.socket.emit(GameEvents.OrganizerPointsUpdate, { name: dataPlayer.playerName, points: dataPlayer.points });
            client.points = dataPlayer.points;
        });
    }
    startGameCountdown(timerValue: number) {
        this.timer.startTimer(timerValue, TimerEvents.GameCountdownValue, TimerEvents.GameCountdownEnd);
    }

    startQuestionCountdown() {
        this.timer.startTimer(3, TimerEvents.QuestionCountdownValue, TimerEvents.QuestionCountdownEnd, () => {
            const currentQuestion = this.nextQuestion();
            if (currentQuestion) {
                this.organizer.socket.emit(GameEvents.NextQuestion, currentQuestion);
                this.organizer.socket.to(this.roomId).emit(GameEvents.NextQuestion, currentQuestion);
            }
            this.players.forEach((player: Player) => {
                player.socket.emit(GameEvents.NextQuestion, currentQuestion);
            });
        });
    }

    finalizePlayerAnswer(@ConnectedSocket() client: Socket, answerData: { choiceSelected: boolean[]; qreAnswer: number }) {
        const targetedPlayer: Player = this.findTargetedPlayer(client);
        targetedPlayer.submitted = true;
        targetedPlayer.currentChoices = answerData.choiceSelected;
        targetedPlayer.qreAnswer = answerData.qreAnswer;
        console.log(targetedPlayer.currentChoices, targetedPlayer.qreAnswer);
        if (!targetedPlayer.verifyIfAnswersCorrect(this.quiz.questions[this.currentQuestionIndex])) {
            targetedPlayer.isFirst = false;
            return this.checkAndPrepareForNextQuestion();
        }
        if (this.quiz.questions[this.currentQuestionIndex].type === QuestionType.QCM) {
            const currentFinalizeTime: number = Date.now();
            if (!this.lastFinalizeCall) {
                this.handleFirstAnswer(targetedPlayer, currentFinalizeTime);
                return this.checkAndPrepareForNextQuestion();
            }

            this.handleLaterAnswer(currentFinalizeTime);
            targetedPlayer.isFirst = false;
        } else if (this.quiz.questions[this.currentQuestionIndex].type === QuestionType.QRE) {
            const question = this.quiz.questions[this.currentQuestionIndex];
            if (question.qreAttributes.tolerance !== 0 && targetedPlayer.qreAnswer === question.qreAttributes.goodAnswer) {
                targetedPlayer.exactAnswer = true;
                targetedPlayer.noBonusesObtained++;
            }
        }
        this.checkAndPrepareForNextQuestion();
    }
    checkAndPrepareForNextQuestion(@ConnectedSocket() client?: Socket) {
        if (client) {
            const targetedPlayer: Player = this.findTargetedPlayer(client);
            targetedPlayer.submitted = true;
        }
        if (this.areResultsReadyToShow()) {
            this.preparePlayersForNextQuestion();
        }
    }
    preparePlayersForNextQuestion() {
        this.updatePlayerAnswersAndPoints();
        this.emitNextQuestionEvents();
        this.prepareForNextRound();
        this.emitCorrectionEvents();
    }

    private areResultsReadyToShow(): boolean {
        let ready = true;
        this.players.forEach((player: Player) => {
            if (!player.submitted) ready = false;
        });
        return ready;
    }
    private givePlayerList() {
        const players: PartialPlayer[] = [];
        this.players.forEach((player: Player) => {
            players.push({
                name: player.name,
                points: player.points,
                isInGame: player.isInGame,
                submitted: player.submitted,
            });
        });
        this.organizer.socket.emit(GameEvents.SendPlayerList, players);
    }

    // Jusqu'à 5 paramètres sont permis d'après les chargés de lab
    // eslint-disable-next-line max-params
    private initializeGame(roomId: string, quiz: Quiz, @ConnectedSocket() client: Socket) {
        this.players = [];
        this.organizer = new Player('Organisateur', true, client);
        this.playersRemoved = [];
        this.bannedNames = [];
        this.quiz = quiz;
        this.currentQuestionIndex = 0;
        this.isLocked = false;
        this.roomId = roomId;
        this.lastFinalizeCall = null;
        this.timer = new Timer(roomId, client);
        this.playersReadyForNext = false;
    }

    private updatePlayerAnswersAndPoints() {
        this.players.forEach((player: Player) => {
            const currentQuestion = this.quiz.questions[this.currentQuestionIndex];
            if (currentQuestion.type === QuestionType.QCM || currentQuestion.type === QuestionType.QRE) {
                player.updatePlayerPoints(this.quiz.questions[this.currentQuestionIndex]);
                player.socket.emit(GameEvents.PlayerPointsUpdate, {
                    points: player.points,
                    isFirst: player.isFirst,
                    exactAnswer: player.exactAnswer,
                });
                this.organizer.socket.emit(GameEvents.OrganizerPointsUpdate, { name: player.name, points: player.points });
            }
            player.prepareForNextQuestion();
        });
    }
    private emitNextQuestionEvents() {
        this.organizer.socket.emit(GameEvents.ProceedToNextQuestion);
    }
    private prepareForNextRound() {
        this.playersReadyForNext = true;
        this.timer.stopTimer();
        this.lastFinalizeCall = null;
    }
    private emitCorrectionEvents() {
        if (this.quiz.questions[this.currentQuestionIndex].type === QuestionType.QRL) {
            this.organizer.socket.emit(GameEvents.EveryoneSubmitted);
            this.players.forEach((player: Player) => {
                player.socket.emit(GameEvents.WaitingForCorrection);
            });
        }
    }
    private handleFirstAnswer(targetedPlayer: Player, currentFinalizeTime: number) {
        targetedPlayer.noBonusesObtained++;
        this.lastFinalizeCall = currentFinalizeTime;
        this.lastFinalizePlayer = targetedPlayer;
        targetedPlayer.isFirst = true;
    }
    private handleLaterAnswer(currentFinalizeTime: number) {
        if (currentFinalizeTime - this.lastFinalizeCall < ANSWER_TIME_INTERVAL) {
            this.lastFinalizePlayer.isFirst = false;
            this.lastFinalizePlayer.noBonusesObtained--;
        }
    }
}
