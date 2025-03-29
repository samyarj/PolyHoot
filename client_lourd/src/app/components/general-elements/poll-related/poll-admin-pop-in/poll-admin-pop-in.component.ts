import { AfterViewInit, Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { ConfirmationMessage } from '@app/constants/enum-class';
import { Poll } from '@app/interfaces/poll';
import { ConsultPollPageComponent } from '@app/pages/admin-pages/poll-related/consult-poll-page/consult-poll-page.component';
import { MessageHandlerService } from '@app/services/general-services/error-handler/message-handler.service';

@Component({
    selector: 'app-poll-admin-pop-in.component',
    templateUrl: './poll-admin-pop-in.component.html',
    styleUrls: ['./poll-admin-pop-in.component.scss'],
})
export class PollAdminPopInComponent implements AfterViewInit {
    poll: Poll;
    constructor(
        public dialogRef: MatDialogRef<PollAdminPopInComponent>,
        @Inject(MAT_DIALOG_DATA)
        public data: {
            poll: Poll;
            parentComponent: ConsultPollPageComponent;
        },
        private messageHandlerService: MessageHandlerService,
    ) {
        this.poll = data.poll;
        // this.poll.endDate = poll.endDate.slice(0, 16);
    }
    onPublish() {
        if (this.data.poll.id) {
            // Appel direct de la méthode du parent
            this.messageHandlerService.confirmationDialog(
                ConfirmationMessage.PublishPoll,
                () => {
                    // Callback si l'utilisateur confirme
                    this.data.parentComponent.publishCallback(this.data.poll.id);
                    this.dialogRef.close();
                },
                () => {
                    // Callback si l'utilisateur annule
                    console.log('Publication annulée');
                },
            );
        }
    }
    ngAfterViewInit(): void {
        this.setMinDate();
    }
    onSubmit(): void {
        this.dialogRef.close();
    }

    onClose(): void {
        this.dialogRef.close();
    }
    isDateValid(): boolean {
        if (!this.poll.endDate) {
            return false;
        }
        const selectedDate = new Date(this.poll.endDate);
        const now = new Date();
        now.setSeconds(0, 0);
        return selectedDate >= now;
    }
    private setMinDate(): void {
        const dateTimeInput = document.querySelector<HTMLInputElement>('#dateTimePicker');

        if (dateTimeInput) {
            const updateMinDateTime = () => {
                const now = new Date();
                now.setMinutes(now.getMinutes() - now.getTimezoneOffset()); // Ajustement fuseau horaire

                const minDateTime = now.toISOString().slice(0, 16); // Format YYYY-MM-DDTHH:MM
                dateTimeInput.setAttribute('min', minDateTime);

                // Vérifier si la valeur sélectionnée est devenue invalide
                const selectedDateTime = new Date(dateTimeInput.value);
                if (selectedDateTime < now) {
                    dateTimeInput.value = minDateTime; // Réinitialiser si la valeur devient invalide
                }
            };

            // Mettre à jour immédiatement et ensuite toutes les secondes
            updateMinDateTime();
            setInterval(updateMinDateTime, 1000);
        }
    }
}
