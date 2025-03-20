import { Component, OnInit } from '@angular/core';
import { AuthService } from '@app/services/auth/auth.service';

interface GameLogEntry {
    gameName?: string;
    startTime?: string;
    endTime?: string;
    status?: 'complete' | 'abandoned';
    result?: 'win' | 'lose';
}

interface CnxLogEntry {
    timestamp: string;
    action: 'connect' | 'disconnect';
}

@Component({
    selector: 'app-action-logs-page',
    templateUrl: './action-logs-page.component.html',
    styleUrls: ['./action-logs-page.component.scss'],
})
export class ActionLogsPageComponent implements OnInit {
    gameLogs: GameLogEntry[];
    logs: CnxLogEntry[];

    constructor(private authService: AuthService) {}

    ngOnInit(): void {
        this.loadLogs();
    }

    loadLogs() {
        const user = this.authService.getUser();
        this.logs = user?.cxnLogs ?? [];
        this.gameLogs = user?.gameLogs ?? [];
    }

    getActionDisplay(action: 'connect' | 'disconnect'): string {
        return action === 'connect' ? 'Connection' : 'Déconnection';
    }

    getStatusDisplay(status: 'complete' | 'abandoned'): string {
        return status === 'complete' ? 'Complété' : 'Abandonné';
    }

    getResultDisplay(result: 'win' | 'lose'): string {
        return result === 'win' ? 'Gagné' : 'Perdu';
    }
}
