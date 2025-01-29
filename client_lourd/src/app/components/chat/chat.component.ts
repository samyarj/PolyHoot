import { AfterViewChecked, Component, ElementRef, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { MAX_CHAR } from '@app/constants/constants';
import { ChatService } from '@app/services/chat-services/chat.service';
import { MessageHandlerService } from '@app/services/general-services/error-handler/message-handler.service';
import { ChatMessage } from '@common/chat-message';
import { Observer, Subscription } from 'rxjs';

@Component({
    selector: 'app-chat',
    templateUrl: './chat.component.html',
    styleUrls: ['./chat.component.scss'],
})
export class ChatComponent implements OnDestroy, OnInit, AfterViewChecked {
    @ViewChild('previousMessages') private previousMessagesContainer: ElementRef;
    inputMessage = '';
    containerHasChanged: boolean = false;
    chatMessages: ChatMessage[] = [];
    messagesObserver: Partial<Observer<ChatMessage[]>> = {
        next: (newChatMessages: ChatMessage[]) => {
            this.chatMessages = newChatMessages;
            this.containerHasChanged = true;
        },
    };
    private messagesSubscription: Subscription;

    constructor(
        private chatService: ChatService,
        private messageHandlerService: MessageHandlerService,
    ) {}

    get name() {
        return this.chatService.getUserName();
    }
    get canChat() {
        return this.chatService.canChat;
    }

    ngOnInit(): void {
        this.messagesSubscription = this.chatService.allChatMessagesObservable.subscribe(this.messagesObserver);
        if (!this.chatService.isInitialized) {
            this.chatService.configureChatSocketFeatures();
            this.chatService.getHistory();
        } else this.chatService.retrieveRoomIdChat();
    }

    ngAfterViewChecked() {
        console.log('ngAfterViewChecked');
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

    sendMessageToRoom() {
        if (!this.canChat) {
            this.inputMessage = '';
            this.messageHandlerService.popUpErrorDialog('Vous avez été restreint de discuter dans le clavardage');
            return;
        }
        if (this.isLengthInRange() && this.isNotEmpty()) {
            const hasBeenSent: boolean = this.chatService.sendMessageToRoom(this.inputMessage);
            this.inputMessage = '';
            if (!hasBeenSent) {
                this.messageHandlerService.popUpErrorDialog('Vous ne pouvez pas envoyer de message sans être dans une partie');
            }
        }
    }

    ngOnDestroy(): void {
        if (this.messagesSubscription) this.messagesSubscription.unsubscribe();
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
}
