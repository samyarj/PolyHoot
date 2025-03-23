/* eslint-disable @typescript-eslint/no-magic-numbers */
import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { ToastrService } from 'ngx-toastr';
import { catchError, Observable, Subscription } from 'rxjs';
import { environment } from 'src/environments/environment';
import { MessageHandlerService } from './general-services/error-handler/message-handler.service';

@Injectable({
    providedIn: 'root',
})
export class ReportService {
    readonly baseUrl = `${environment.serverUrl}/report`;
    tokenID: string | null = '';
    warned: boolean = false;
    private tokenSubscription?: Subscription;
    constructor(
        private http: HttpClient,
        private toastr: ToastrService,
        private messageHandler: MessageHandlerService,
    ) {}

    subscribeToToken(token$: Observable<string | null>) {
        this.tokenSubscription?.unsubscribe(); // Clean up old subscription if any
        this.tokenSubscription = token$.subscribe((token: string | null) => {
            this.tokenID = token;
        });
    }

    behaviourWarning() {
        if (!this.warned) {
            this.toastr.warning('Attention à votre comportement, plusieurs personnes vous ont signalé. Vous serez banni si vous continuez.');
            this.warned = true;
        }
    }

    resetParams() {
        this.warned = false;
    }

    banInfo(message: string) {
        this.toastr.error(message);
    }

    reportPlayer(uid: string): Observable<boolean | null> {
        const options = {
            headers: { authorization: `Bearer ${this.tokenID}` },
        };
        return this.http
            .post<boolean | null>(`${this.baseUrl}/report`, { reportedUID: uid }, options)
            .pipe(catchError((error) => this.messageHandler.handleHttpError(error)));
    }

    getReportState(uid: string): Observable<{
        message: string;
        isBanned: boolean;
    }> {
        const options = {
            headers: { authorization: `Bearer ${this.tokenID}` },
        };

        return this.http
            .post<{
                message: string;
                isBanned: boolean;
            }>(`${this.baseUrl}/state`, { uid }, options)
            .pipe(catchError((error) => this.messageHandler.handleHttpError(error)));
    }
}
