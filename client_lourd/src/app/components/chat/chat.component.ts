import { AfterViewChecked, Component, ElementRef, Input, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { MAX_CHAR } from '@app/constants/constants';
import { AuthService } from '@app/services/auth/auth.service';
import { ChatEvents } from '@app/services/chat-services/chat-events';
import { ChatService } from '@app/services/chat-services/chat.service';
import { MessageHandlerService } from '@app/services/general-services/error-handler/message-handler.service';
import { ChatMessage } from '@common/chat-message';
import { ToastrService } from 'ngx-toastr';
import { Observer, Subscription } from 'rxjs';

@Component({
    selector: 'app-chat',
    templateUrl: './chat.component.html',
    styleUrls: ['./chat.component.scss'],
})
export class ChatComponent implements OnDestroy, OnInit, AfterViewChecked {
    @ViewChild('previousMessages') private previousMessagesContainer: ElementRef;
    @Input() parentAction!: () => void;

    inputMessage = '';
    containerHasChanged: boolean = false;
    chatMessages: ChatMessage[] = [];
    chatMessagesLoading: boolean = false;
    quickReplies: string[] = []; // Array to hold quick reply suggestions
    private quickRepliesSubscription: Subscription;

    messagesObserver: Partial<Observer<ChatMessage[]>> = {
        next: (newChatMessages: ChatMessage[]) => {
            // Check if the last message is from someone else
            if (newChatMessages.length > this.chatMessages.length) {
                const lastMessage = newChatMessages[newChatMessages.length - 1];
                if (lastMessage.author !== this.name) {
                    const user = this.authService.getUser()?.username ?? '';
                    this.chatService.requestQuickReplies(user);
                }
            }
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
    ) {}

    get user() {
        return this.authService.user$;
    }

    get name() {
        return this.chatService.getUserName();
    }

    ngOnInit(): void {
        this.messagesSubscription = this.chatService.allChatMessagesObservable.subscribe(this.messagesObserver);
        this.chatEventsSubscription = this.chatService.chatEvents$.subscribe((event) => {
            if (event.event === ChatEvents.RoomLeft) {
                this.clearMessages();
            }
        });

        // Subscribe to quick replies
        this.quickRepliesSubscription = this.chatService.quickReplies$.subscribe((replies) => {
            this.quickReplies = replies;
            console.log(replies);
        });

        if (!this.chatService.isInitialized) {
            this.chatService.configureChatSocketFeatures();
            this.chatService.getHistory();
        } else {
            this.chatService.retrieveRoomIdChat();
        }
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

    reportUser(uid: string) {
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
                            this.toastr.info('Vous avez déjà signalé cet utilisateur.');
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

    // Request quick replies when the input field is focused
    onInputFocus() {
        const user = this.authService.getUser()?.username ?? '';
        this.chatService.requestQuickReplies(user);
    }

    // Use a quick reply
    useQuickReply(reply: string) {
        this.inputMessage = reply;
        this.sendMessageToRoom();
    }

    ngOnDestroy(): void {
        if (this.messagesSubscription) this.messagesSubscription.unsubscribe();
        if (this.chatEventsSubscription) this.chatEventsSubscription.unsubscribe();
        if (this.quickRepliesSubscription) this.quickRepliesSubscription.unsubscribe();
        console.log('Child component destroyed!');
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

    triggerParentAction() {
        if (this.parentAction) {
            this.parentAction();
        }
    }
}
