import { Component } from '@angular/core';

const MILLISECONDS_PER_HOUR = 3600000;

interface LogEntry {
    timestamp: Date;
    action: string;
    details: string;
    user: string;
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
            action: 'Login',
            details: 'User logged in successfully',
            user: 'JohnDoe',
        },
        {
            timestamp: new Date(Date.now() - MILLISECONDS_PER_HOUR), // 1 hour ago
            action: 'Game Started',
            details: 'Started new quiz game',
            user: 'JohnDoe',
        },
        {
            timestamp: new Date(Date.now() - MILLISECONDS_PER_HOUR * 2), // 2 hours ago
            action: 'Profile Update',
            details: 'Updated username',
            user: 'JohnDoe',
        },
    ];
}
