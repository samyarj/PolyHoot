import { Component } from '@angular/core';

const MILLISECONDS_PER_HOUR = 3600000;

enum ActionCategory {
    Connection = 'Connection',
    Disconnection = 'Disconnection',
}

enum GameStatus {
    Completed = 'Completed',
    Abandoned = 'Abandoned',
}

interface LogEntry {
    timestamp: Date;
    action: ActionCategory;
    details: string;
    user: string;
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
export class ActionLogsPageComponent {
    logs: LogEntry[] = [
        {
            timestamp: new Date(),
            action: ActionCategory.Connection,
            details: 'User logged in successfully',
            user: 'JohnDoe',
        },
        {
            timestamp: new Date(Date.now() - MILLISECONDS_PER_HOUR), // 1 hour ago
            action: ActionCategory.Disconnection,
            details: 'User logged out',
            user: 'JohnDoe',
        },
        {
            timestamp: new Date(Date.now() - MILLISECONDS_PER_HOUR * 2), // 2 hours ago
            action: ActionCategory.Connection,
            details: 'User logged in',
            user: 'JohnDoe',
        },
    ];

    gameLogs: GameLogEntry[] = [
        {
            startTime: new Date(Date.now() - MILLISECONDS_PER_HOUR * 3),
            endTime: new Date(Date.now() - MILLISECONDS_PER_HOUR * 2.5),
            player: 'JohnDoe',
            status: GameStatus.Completed,
            won: true,
        },
        {
            startTime: new Date(Date.now() - MILLISECONDS_PER_HOUR * 5),
            endTime: new Date(Date.now() - MILLISECONDS_PER_HOUR * 4.7),
            player: 'JohnDoe',
            status: GameStatus.Abandoned,
            won: false,
        },
    ];
}
