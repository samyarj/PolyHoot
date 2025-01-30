import { Component, ElementRef, EventEmitter, Input, OnChanges, Output, SimpleChanges, ViewChild } from '@angular/core';
import { MAX_CHAR } from '@app/constants/constants';
import { ChatMessage } from '@app/interfaces/chat-message';

@Component({
    selector: 'app-chat2',
    templateUrl: './chat2.component.html',
    styleUrls: ['./chat2.component.scss'],
})
export class Chat2Component implements OnChanges {
    @Input() name: string = ''; // Input for username
    @Input() chatMessages: ChatMessage[] = []; // Input for chat messages
    @Input() chatMessagesLoading: boolean = true;
    @Output() sendMessageToRoom = new EventEmitter<string>(); // Output for sending a message

    @ViewChild('previousMessages') private previousMessagesContainer: ElementRef;

    inputMessage = '';

    // ngAfterViewInit() {
    //     // Scroll to the bottom when the view is initialized
    //     this.delayedScrollToBottom();
    // }

    ngOnChanges(changes: SimpleChanges) {
        if (changes.chatMessages) {
            // Scroll to the bottom when chatMessages input changes
            this.delayedScrollToBottom();
        }
    }

    onKeyDown(event: KeyboardEvent) {
        event.stopPropagation();
        if (event.key === 'Enter') {
            event.preventDefault();
            this.handleSendMessage();
        }
    }

    handleSendMessage() {
        if (this.isLengthInRange() && this.isNotEmpty()) {
            this.sendMessageToRoom.emit(this.inputMessage);
            this.inputMessage = '';
            this.delayedScrollToBottom();
        }
    }

    isLengthInRange() {
        return this.inputMessage.length <= MAX_CHAR;
    }

    private delayedScrollToBottom(): void {
        setTimeout(() => {
            try {
                this.previousMessagesContainer.nativeElement.scrollTop = this.previousMessagesContainer.nativeElement.scrollHeight;
            } catch (err) {
                console.error('Error scrolling to bottom:', err);
            }
        }, 0);
    }

    private isNotEmpty() {
        return this.inputMessage.trim();
    }
}
