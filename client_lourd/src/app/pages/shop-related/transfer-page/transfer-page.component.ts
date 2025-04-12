/* eslint-disable @typescript-eslint/member-ordering */
import { Component, OnDestroy, OnInit } from '@angular/core';
import { doc, Firestore, getDoc, onSnapshot, Unsubscribe } from '@angular/fire/firestore';
import { AuthService } from '@app/services/auth/auth.service';
import { CoinTransferService } from '@app/services/coin-transfer.service';
import { ToastrService } from 'ngx-toastr';

@Component({
    selector: 'app-transfer-page',
    templateUrl: './transfer-page.component.html',
    styleUrls: ['./transfer-page.component.scss'],
})
export class TransferPageComponent implements OnInit, OnDestroy {
    friends: { id: string; username: string; avatarEquipped: string; borderEquipped: string }[] = [];
    searchQuery: string = '';
    searchResults: { id: string; username: string; avatarEquipped: string; borderEquipped: string }[] = [];
    searchError: string = '';
    private userDocSubscription: Unsubscribe;
    userUID: string | null = null;
    isTransferring: boolean = false;
    // New properties for tabbed interface
    currentTab: number = 0;
    selectedRecipient: { id: string; username: string; avatarEquipped: string; borderEquipped: string } | null = null;
    transferAmount: number = 0;
    userBalance: number = 0;
    transferError: string = '';

    constructor(
        private authService: AuthService,
        private firestore: Firestore,
        private coinTransferService: CoinTransferService,
        private toastr: ToastrService,
    ) {}

    ngOnInit(): void {
        this.authService.user$.subscribe((user) => {
            if (user) {
                this.userUID = user.uid;
                this.setupRealtimeUserUpdates(user.uid);
            }
        });
    }

    private setupRealtimeUserUpdates(uid: string) {
        if (this.userDocSubscription) {
            this.userDocSubscription();
        }

        const userRef = doc(this.firestore, 'users', uid);
        this.userDocSubscription = onSnapshot(userRef, async (docSnapshot) => {
            if (docSnapshot.exists()) {
                const userData = docSnapshot.data();

                if (userData.friends) {
                    const friendsData = await Promise.all(
                        userData.friends.map(async (id: string) => {
                            const friendDoc = await getDoc(doc(this.firestore, 'users', id));
                            return {
                                id,
                                username: friendDoc.data()?.username || 'Unknown User',
                                avatarEquipped: friendDoc.data()?.avatarEquipped || '',
                                borderEquipped: friendDoc.data()?.borderEquipped || '',
                            };
                        }),
                    );
                    this.friends = friendsData;
                    // Update search results if there's an active search
                    if (this.searchQuery) {
                        this.filterFriends(this.searchQuery);
                    }
                } else {
                    this.friends = [];
                    this.searchResults = [];
                }

                // Update user balance
                this.userBalance = userData.coins || 0;
            }
        });
    }

    onSearchInputChange(event: any): void {
        const searchTerm = event.target.value.trim();
        this.searchQuery = searchTerm;
        this.filterFriends(searchTerm);
    }

    private filterFriends(searchTerm: string): void {
        if (!searchTerm) {
            this.searchResults = [];
            return;
        }

        const searchLower = searchTerm.toLowerCase();
        this.searchResults = this.friends.filter((friend) => friend.username.toLowerCase().includes(searchLower));
    }

    selectRecipient(user: { id: string; username: string; avatarEquipped: string; borderEquipped: string }): void {
        this.selectedRecipient = user;
    }

    canProceedToNextTab(): boolean {
        switch (this.currentTab) {
            case 0:
                return this.selectedRecipient !== null;
            case 1:
                return this.transferAmount > 0 && this.transferAmount <= this.userBalance;
            case 2:
                return true; // Always can proceed from the final tab
            default:
                return false;
        }
    }

    async confirmTransfer(): Promise<void> {
        if (!this.isTransferring) {
            this.isTransferring = true;

            if (!this.selectedRecipient || !this.transferAmount || this.transferAmount <= 0 || this.transferAmount > this.userBalance) {
                this.transferError = 'Transaction invalide';
                return;
            }

            if (!this.userUID) {
                this.transferError = 'Vous devez être connecté pour effectuer un transfert';
                return;
            }

            try {
                this.coinTransferService.transferCoins(this.userUID, this.selectedRecipient.id, this.transferAmount).subscribe({
                    next: (response) => {
                        if (response.success) {
                            // Reset the form
                            this.currentTab = 0;
                            this.selectedRecipient = null;
                            this.transferAmount = 0;
                            this.transferError = '';
                            this.toastr.success('Vous avez effectué la transaction avec succès.');
                        } else {
                            this.transferError = response.message;
                        }
                        this.isTransferring = false;
                    },
                    error: (error) => {
                        console.error('Error during transfer:', error);
                        this.transferError = 'Une erreur est survenue lors du transfert';
                        this.isTransferring = false;
                    },
                });
            } catch (error) {
                console.error('Error during transfer:', error);
                this.transferError = 'Une erreur est survenue lors du transfert';
                this.isTransferring = false;
            }
        }
    }

    validateAmount(event: Event): void {
        const input = event.target as HTMLInputElement;
        let value = input.value;

        // Remove any non-digit characters
        value = value.replace(/[^0-9]/g, '');

        // Ensure the value is at least 1
        if (value === '') {
            this.transferAmount = 0;
        } else {
            this.transferAmount = parseInt(value, 10);
        }
    }

    ngOnDestroy(): void {
        if (this.userDocSubscription) {
            this.userDocSubscription();
        }
    }
}
