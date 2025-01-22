import { Injectable } from '@angular/core';
import { DisconnectEvents, GameEvents } from '@app/constants/enum-class';
import { EMPTY_QUESTION } from '@app/constants/mock-constants';
import { Question } from '@app/interfaces/question';
import { SocketClientService } from '@app/services/websocket-services/general/socket-client-manager.service';

interface PlayerData {
    name: string;
    points: number;
    noBonusesObtained: number;
    isInGame: boolean;
}
interface ResultsData {
    questions: Question[];
    players: PlayerData[];
    choicesHistory: number[][];
}
@Injectable({
    providedIn: 'root',
})
export class ResultsService {
    resultsData: ResultsData = {
        questions: [],
        players: [],
        choicesHistory: [],
    };
    playerList: PlayerData[] = this.resultsData.players;
    nbAnswersArray: number[] = [];
    correctAnswersArray: boolean[];
    nbPlayers: number;
    sortedPlayersList: PlayerData[] = [];
    questions: Question[];
    question: Question;
    resultsReady: boolean = false;
    currentQuestionIndex = 0;

    constructor(private socketHandlerService: SocketClientService) {
        this.resetAttributes();
    }

    get roomId() {
        return this.socketHandlerService.roomId;
    }

    setAttributes() {
        this.questions = this.resultsData.questions;
        this.question = this.questions[this.currentQuestionIndex];
        this.nbPlayers = this.resultsData.players.length;
    }

    sortPlayers() {
        this.playerList = this.resultsData.players;
        const comparePlayers = (a: PlayerData, b: PlayerData) => {
            if (a.points === b.points) {
                return a.name.localeCompare(b.name);
            } else {
                return b.points - a.points;
            }
        };
        const playersInGame = this.playerList.filter((player) => player.isInGame);
        const playersNotInGame = this.playerList.filter((player) => !player.isInGame);
        const sortedPlayersInGame = playersInGame.sort(comparePlayers);
        const sortedPlayersNotInGame = playersNotInGame.sort(comparePlayers);
        this.sortedPlayersList = sortedPlayersInGame.concat(sortedPlayersNotInGame);
    }

    setAnswersArray() {
        this.nbAnswersArray = [];

        // if (!this.question.choices) return;
        this.nbAnswersArray = this.resultsData.choicesHistory[this.currentQuestionIndex];
    }

    setCorrectAnswers() {
        this.correctAnswersArray = [];
        const choices = this.question.choices;
        if (choices) {
            for (const choice of choices) {
                if (choice.isCorrect) this.correctAnswersArray.push(true);
                else this.correctAnswersArray.push(false);
            }
        }
    }

    handleResultsSockets() {
        this.socketHandlerService.on(GameEvents.SendResults, (data: ResultsData) => {
            this.resultsData = data;
            this.setAttributes();
        });
    }

    disconnectUser() {
        this.socketHandlerService.isRandomMode = false;
        this.socketHandlerService.send(DisconnectEvents.UserFromResults, this.socketHandlerService.playerName);
        this.resetAttributes();
    }

    resetAttributes() {
        this.resultsData = {
            questions: [],
            players: [],
            choicesHistory: [],
        };
        this.playerList = this.resultsData.players;
        this.nbAnswersArray = [];
        this.correctAnswersArray = [];
        this.nbPlayers = 0;
        this.sortedPlayersList = [];
        this.questions = [];
        this.resultsReady = false;
        this.currentQuestionIndex = 0;
        this.question = EMPTY_QUESTION;
    }
}
