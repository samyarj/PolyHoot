/* eslint-disable complexity */
import { Component, computed, OnDestroy, OnInit, signal } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { ConfirmationDialogComponent } from '@app/components/general-elements/confirmation-dialog/confirmation-dialog.component';
import { User } from '@app/interfaces/user';
import { AdminService } from '@app/services/back-end-communication-services/admin-service/admin.service';
import { ToastrService } from 'ngx-toastr';
import { MILLISECONDS_PER_MINUTE } from 'src/app/constants/constants';

type SortColumn = 'username' | 'coins' | 'nWins' | 'isOnline' | 'nbReport' | 'banned' | null;
type SortDirection = 'asc' | 'desc';

@Component({
    selector: 'app-player-info-page',
    templateUrl: './player-info-page.component.html',
    styleUrls: ['./player-info-page.component.scss'],
})
export class PlayerInfoPageComponent implements OnInit, OnDestroy {
    players = signal<User[]>([]);
    isLoading = signal<boolean>(false);
    error = signal<string | null>(null);
    searchTerm = signal<string>('');

    sortColumn = signal<SortColumn>('isOnline');
    sortDirection = signal<SortDirection>('desc');

    hasPlayers = computed(() => this.players().length > 0);

    filteredPlayers = computed(() => {
        const term = this.searchTerm().toLowerCase().trim();
        let filtered = !term ? this.players() : this.players().filter((player) => player.username.toLowerCase().includes(term));

        const column = this.sortColumn();
        const direction = this.sortDirection();

        if (column) {
            filtered = [...filtered].sort((a, b) => {
                if (column === 'username') {
                    const usernameA = a.username?.toLowerCase() || '';
                    const usernameB = b.username?.toLowerCase() || '';
                    return direction === 'asc' ? usernameA.localeCompare(usernameB) : usernameB.localeCompare(usernameA);
                }

                if (column === 'isOnline') {
                    const isOnlineValueA = a.isOnline ? 1 : 0;
                    const isOnlineValueB = b.isOnline ? 1 : 0;
                    return direction === 'asc' ? isOnlineValueA - isOnlineValueB : isOnlineValueB - isOnlineValueA;
                }

                if (column === 'banned') {
                    const isBannedA = this.isBanned(a) ? 1 : 0;
                    const isBannedB = this.isBanned(b) ? 1 : 0;

                    if (isBannedA === isBannedB && isBannedA === 1) {
                        // If both are banned, sort by unban time (earliest first)
                        const unbanDateA = this.getUnbanDate(a).getTime();
                        const unbanDateB = this.getUnbanDate(b).getTime();
                        return direction === 'asc' ? unbanDateA - unbanDateB : unbanDateB - unbanDateA;
                    }

                    return direction === 'asc' ? isBannedA - isBannedB : isBannedB - isBannedA;
                }

                const valueA = a[column] || 0;
                const valueB = b[column] || 0;
                return direction === 'asc' ? valueA - valueB : valueB - valueA;
            });
        }

        return filtered;
    });

    private unsubscribeFromPlayers: (() => void) | null = null;

    constructor(
        private adminService: AdminService,
        private toastr: ToastrService,
        private dialog: MatDialog,
    ) {}

    ngOnInit(): void {
        this.loadPlayersRealtime();
    }

    ngOnDestroy(): void {
        if (this.unsubscribeFromPlayers) {
            this.unsubscribeFromPlayers();
        }
    }

    // Add sorting method
    sort(column: SortColumn): void {
        if (this.sortColumn() === column) {
            this.sortDirection.set(this.sortDirection() === 'asc' ? 'desc' : 'asc');
        } else {
            this.sortColumn.set(column);
            this.sortDirection.set(column === 'username' ? 'asc' : 'desc');
        }
    }

    loadPlayers(): void {
        this.isLoading.set(true);
        this.error.set(null);

        this.adminService.getAllPlayers().subscribe({
            next: (data) => this.players.set(data),
            error: (err) => this.error.set(err.message || 'Failed to load players'),
            complete: () => this.isLoading.set(false),
        });
    }

    loadPlayersRealtime(): void {
        this.isLoading.set(true);
        this.error.set(null);

        try {
            if (this.unsubscribeFromPlayers) {
                this.unsubscribeFromPlayers();
            }

            // Set up new real-time listener
            this.unsubscribeFromPlayers = this.adminService.getPlayersRealtime((players) => {
                this.players.set(players);
                this.isLoading.set(false);
            });
        } catch (err: any) {
            this.error.set(err.message || 'Failed to load players');
            this.isLoading.set(false);
        }
    }

    updateSearch(event: Event): void {
        const input = event.target as HTMLInputElement;
        this.searchTerm.set(input.value);
    }

    clearSearch(): void {
        this.searchTerm.set('');
    }

    adminBanPlayer(playerId: string): void {
        const player = this.players().find((p) => p.uid === playerId);

        const dialogRef = this.dialog.open(ConfirmationDialogComponent, {
            width: '400px',
            panelClass: 'custom-container',
            data: `Êtes-vous sûr de vouloir bannir ${player?.username} ?`,
        });

        dialogRef.afterClosed().subscribe((confirmed) => {
            if (confirmed) {
                // Proceed with banning the player
                this.adminService.adminBanPlayer(playerId).subscribe({
                    next: () => {
                        this.toastr.success(`${player?.username} a été banni pour 15 minutes.`);
                    },
                    error: (err) => {
                        this.toastr.error(`Échec du bannissement de ${player?.username}. Erreur : ${err.message}`);
                    },
                });
            }
        });
    }

    isBanned(player: User): boolean {
        if (!player.unBanDate) return false;

        const unbanDate =
            player.unBanDate instanceof Date
                ? player.unBanDate
                : (player.unBanDate as any).toDate
                ? (player.unBanDate as any).toDate()
                : new Date(player.unBanDate);

        return unbanDate > new Date();
    }

    formatUnbanDate(player: User): string {
        if (!player.unBanDate) return '';

        // Convert Firestore Timestamp to Date if needed
        const unbanDate =
            player.unBanDate instanceof Date
                ? player.unBanDate
                : (player.unBanDate as any).toDate
                ? (player.unBanDate as any).toDate()
                : new Date(player.unBanDate);

        // Calculate minutes left
        const now = new Date();
        const minutesLeft = Math.ceil((unbanDate.getTime() - now.getTime()) / MILLISECONDS_PER_MINUTE);

        if (minutesLeft <= 0) return 'Débloqué';

        return `Débloqué dans ${minutesLeft} min`;
    }

    private getUnbanDate(player: User): Date {
        if (!player.unBanDate) return new Date(0);

        return player.unBanDate instanceof Date
            ? player.unBanDate
            : (player.unBanDate as any).toDate
            ? (player.unBanDate as any).toDate()
            : new Date(player.unBanDate);
    }
}
