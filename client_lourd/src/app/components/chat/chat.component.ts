import { AfterViewChecked, Component, ElementRef, Input, OnDestroy, ViewChild } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MAX_CHAR, WIDTH_SIZE } from '@app/constants/constants';
import { AuthService } from '@app/services/auth/auth.service';
import { ChatEvents } from '@app/services/chat-services/chat-events';
import { ChatService } from '@app/services/chat-services/chat.service';
import { MessageHandlerService } from '@app/services/general-services/error-handler/message-handler.service';
import { ChatMessage } from '@common/chat-message';
import { ToastrService } from 'ngx-toastr';
import { Observer, Subscription } from 'rxjs';
import { ConfirmationDialogComponent } from '../general-elements/confirmation-dialog/confirmation-dialog.component';

@Component({
    selector: 'app-chat',
    templateUrl: './chat.component.html',
    styleUrls: ['./chat.component.scss'],
})
export class ChatComponent implements OnDestroy, AfterViewChecked {
    @ViewChild('previousMessages') private previousMessagesContainer: ElementRef;
    @Input() parentAction!: () => void; // Function passed from the parent

    // Trigger the function when needed (e.g., on some event)
    triggerParentAction() {
        if (this.parentAction) {
            this.parentAction(); // This will call the parent's function
        }
    }

    inputMessage = '';
    containerHasChanged: boolean = false;
    chatMessages: ChatMessage[] = [];
    chatMessagesLoading: boolean = false;
    messagesObserver: Partial<Observer<ChatMessage[]>> = {
        next: (newChatMessages: ChatMessage[]) => {
            this.chatMessages = newChatMessages;
            this.containerHasChanged = true;
        },
    };
    private messagesSubscription: Subscription;
    private chatEventsSubscription: Subscription;

    constructor(
        private chatService: ChatService,
        private messageHandlerService: MessageHandlerService,
        private authService: AuthService,
        private toastr: ToastrService,
        private matdialog: MatDialog,
    ) {
        this.messagesSubscription = this.chatService.allChatMessagesObservable.subscribe(this.messagesObserver);
        this.chatEventsSubscription = this.chatService.chatEvents$.subscribe((event) => {
            if (event.event === ChatEvents.RoomLeft) {
                this.clearMessages();
            }
        });

        this.chatService.configureChatSocketFeatures();
        this.chatService.retrieveRoomIdChat();
    }

    get user() {
        return this.authService.user$;
    }

    get name() {
        return this.chatService.getUserName();
    }

    ngAfterViewChecked() {
        if (this.containerHasChanged) {
            this.scrollToBottom();
            this.containerHasChanged = false;
        }
    }

    onKeyDown(event: KeyboardEvent) {
        event.stopPropagation();

        if (event.key === 'Enter') {
            event.preventDefault();
            this.sendMessageToRoom();
        }
    }

    onScroll() {
        // Implement scroll handling if needed
    }

    sendMessageToRoom() {
        if (this.isLengthInRange() && this.isNotEmpty()) {
            const hasBeenSent: boolean = this.chatService.sendMessageToRoom(this.inputMessage);
            this.inputMessage = '';
            if (!hasBeenSent) {
                this.messageHandlerService.popUpErrorDialog('Vous ne pouvez pas envoyer de message sans être dans une partie');
            }
        }
    }

    reportUser(uid: string, username: string) {
        const dialogRef = this.matdialog.open(ConfirmationDialogComponent, {
            width: WIDTH_SIZE,
            panelClass: 'custom-container',
            data: `Voulez-vous signaler ${username}?`,
        });

        dialogRef.afterClosed().subscribe((result) => {
            if (result) {
                this.authService
                    .getReportService()
                    .reportPlayer(uid)
                    .subscribe({
                        next: (value: boolean | null) => {
                            switch (value) {
                                case true: {
                                    this.toastr.success('Merci pour votre contribution à la bonne atmosphère du jeu. Le joueur est signalé.');
                                    break;
                                }
                                case false: {
                                    this.toastr.info('Vous avez déjà signalé ce joueur.');
                                    break;
                                }
                                case null: {
                                    this.toastr.info('Vous ne pouvez pas signaler un administrateur.');
                                    break;
                                }
                            }
                        },
                    });
            }
        });
    }

    ngOnDestroy(): void {
        if (this.messagesSubscription) this.messagesSubscription.unsubscribe();
        if (this.chatEventsSubscription) this.chatEventsSubscription.unsubscribe();
        this.triggerParentAction();
    }

    isLengthInRange() {
        return this.inputMessage.length <= MAX_CHAR;
    }

    private scrollToBottom(): void {
        this.previousMessagesContainer.nativeElement.scrollTop = this.previousMessagesContainer.nativeElement.scrollHeight;
    }

    private isNotEmpty() {
        return this.inputMessage.trim();
    }

    private clearMessages(): void {
        this.chatMessages = [];
    }
}
