import { Component, ElementRef, EventEmitter, Input, OnChanges, Output, SimpleChanges, ViewChild } from '@angular/core';
import { Timestamp } from '@angular/fire/firestore';
import { MatDialog } from '@angular/material/dialog';
import { ConfirmationDialogComponent } from '@app/components/general-elements/confirmation-dialog/confirmation-dialog.component';
import { MAX_CHAR, MESSAGES_LIMIT, WIDTH_SIZE } from '@app/constants/constants';
import { FirebaseChatMessage } from '@app/interfaces/chat-message';
import { AuthService } from '@app/services/auth/auth.service';
import { ToastrService } from 'ngx-toastr';
@Component({
    selector: 'app-chat2',
    templateUrl: './chat2.component.html',
    styleUrls: ['./chat2.component.scss'],
})
export class Chat2Component implements OnChanges {
    @Input() name: string = ''; // Chat name
    @Input() chatMessages: FirebaseChatMessage[] = [];
    @Input() chatMessagesLoading: boolean = true;
    @Output() sendMessageToRoom = new EventEmitter<string>(); // Emits sent messages
    @Output() loadOlderMessages = new EventEmitter<void>(); // Emits when loading older messages
    @ViewChild('previousMessages') private previousMessagesContainer: ElementRef;

    isNearTop: boolean = false;
    wasAtBottom: boolean = true; // Track if user was at bottom before update
    inputMessage = '';

    constructor(
        private authService: AuthService,
        private toastr: ToastrService,
        private matdialog: MatDialog,
    ) {}

    get user() {
        return this.authService.user$;
    }

    reportUser(uid: string, username: string | undefined) {
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

    /**
     * Detect changes in messages and handle scroll behavior
     */
    ngOnChanges(changes: SimpleChanges) {
        if (changes.chatMessages) {
            if (changes.chatMessages.firstChange || this.chatMessages.length <= MESSAGES_LIMIT) {
                // 🚀 Force scroll to bottom on first load
                setTimeout(() => this.scrollToBottom(), 0);
            } else {
                this.handleScrollOnMessagesUpdate();
            }
        }
    }

    /**
     * Handle Enter key press to send messages
     */
    onKeyDown(event: KeyboardEvent) {
        event.stopPropagation();
        if (event.key === 'Enter') {
            event.preventDefault();
            this.handleSendMessage();
        }
    }

    /**
     * Detects user scrolling to the top and triggers loading older messages
     */
    onScroll(): void {
        if (!this.previousMessagesContainer) return;

        const container = this.previousMessagesContainer.nativeElement;
        const nearTop = container.scrollTop < MESSAGES_LIMIT; // Detect scroll near top

        if (nearTop && !this.isNearTop) {
            this.isNearTop = true;
            this.loadOlderMessages.emit(); // Request older messages
        } else if (!nearTop) {
            this.isNearTop = false;
        }

        // Track if user is at bottom before new messages arrive
        this.wasAtBottom = container.scrollTop + container.clientHeight >= container.scrollHeight;
    }

    /**
     * Sends a new message
     */
    handleSendMessage() {
        if (this.isLengthInRange() && this.isNotEmpty()) {
            this.sendMessageToRoom.emit(this.inputMessage);
            this.inputMessage = '';
            this.delayedScrollToBottom();
        }
    }

    /**
     * Checks if message length is within the limit
     */
    isLengthInRange(): boolean {
        return this.inputMessage.length <= MAX_CHAR;
    }

    getFormattedDate(chatmessage: FirebaseChatMessage): Date {
        return chatmessage.date instanceof Timestamp ? chatmessage.date.toDate() : new Date();
    }

    /**
     * Handles scrolling correctly when messages update
     */
    private handleScrollOnMessagesUpdate(): void {
        if (!this.previousMessagesContainer) return;
        // const container = this.previousMessagesContainer.nativeElement;

        if (this.wasAtBottom || this.chatMessages.length <= MESSAGES_LIMIT) {
            // Scroll to bottom on first load or when sending a new message
            this.scrollToBottom();
        } else {
            // Preserve scroll position when loading older messages
            this.preserveScrollPosition();
        }
    }

    /**
     * Delays scrolling to the bottom (fixes timing issues)
     */
    private delayedScrollToBottom(): void {
        setTimeout(() => {
            this.scrollToBottom();
        }, 0);
    }

    /**
     * Scrolls to bottom of the chat
     */
    private scrollToBottom(): void {
        setTimeout(() => {
            if (this.previousMessagesContainer) {
                const container = this.previousMessagesContainer.nativeElement;
                container.scrollTop = container.scrollHeight;
            }
        }, 0);
    }

    /**
     * Preserves scroll position when new messages are loaded
     */
    private preserveScrollPosition(): void {
        try {
            const container = this.previousMessagesContainer.nativeElement;
            const oldScrollHeight = container.scrollHeight;
            setTimeout(() => {
                const newScrollHeight = container.scrollHeight;
                container.scrollTop += newScrollHeight - oldScrollHeight;
            }, 0);
        } catch (err) {
            console.error('Error preserving scroll position:', err);
        }
    }
    /**
     * Checks if message is not empty
     */
    private isNotEmpty(): boolean {
        return this.inputMessage.trim().length > 0;
    }
}
