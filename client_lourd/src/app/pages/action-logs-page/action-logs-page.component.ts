import { Component, OnInit } from '@angular/core';
import { AuthService } from '@app/services/auth/auth.service';

const MILLISECONDS_PER_HOUR = 3600000;
const THREE_HOURS = MILLISECONDS_PER_HOUR * 3;
const TWO_AND_HALF_HOURS = MILLISECONDS_PER_HOUR * 2.5;
const FIVE_HOURS = MILLISECONDS_PER_HOUR * 5;
const FOUR_AND_SEVEN_TENTHS_HOURS = MILLISECONDS_PER_HOUR * 4.7;

enum GameStatus {
    Completed = 'Completed',
    Abandoned = 'Abandoned',
}
interface GameLogEntry {
    startTime: Date;
    endTime: Date;
    player: string;
    status: GameStatus;
    won: boolean;
}

@Component({
    selector: 'app-action-logs-page',
    templateUrl: './action-logs-page.component.html',
    styleUrls: ['./action-logs-page.component.scss'],
})
export class ActionLogsPageComponent implements OnInit {
    gameLogs: GameLogEntry[] = [
        {
            startTime: new Date(Date.now() - THREE_HOURS),
            endTime: new Date(Date.now() - TWO_AND_HALF_HOURS),
            player: 'JohnDoe',
            status: GameStatus.Completed,
            won: true,
        },
        {
            startTime: new Date(Date.now() - FIVE_HOURS),
            endTime: new Date(Date.now() - FOUR_AND_SEVEN_TENTHS_HOURS),
            player: 'JohnDoe',
            status: GameStatus.Abandoned,
            won: false,
        },
    ];

    logs: { timestamp: string; action: 'connect' | 'disconnect' }[] = [];

    constructor(private authService: AuthService) {}

    ngOnInit(): void {
        this.loadLogs();
    }

    loadLogs() {
        const user = this.authService.getUser();
        if (user && user.cxnLogs) {
            this.logs = user.cxnLogs;
        } else {
            this.logs = [];
        }
    }

    getActionDisplay(action: 'connect' | 'disconnect'): string {
        return action === 'connect' ? 'Connection' : 'Déconnection';
    }
}
