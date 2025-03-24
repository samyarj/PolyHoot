import { Component, computed, OnDestroy, OnInit, signal } from '@angular/core';
import { User } from '@app/interfaces/user';
import { AdminService } from '@app/services/back-end-communication-services/admin-service/admin.service';

// Add these types for sorting
type SortColumn = 'username' | 'coins' | 'nWins' | 'isOnline' | 'nbReport' | null;
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

    // Default sorting: by 'isOnline' in descending order
    sortColumn = signal<SortColumn>('isOnline');
    sortDirection = signal<SortDirection>('desc');

    // Computed signals
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

                const valueA = a[column] || 0;
                const valueB = b[column] || 0;
                return direction === 'asc' ? valueA - valueB : valueB - valueA;
            });
        }

        return filtered;
    });

    // Store unsubscribe function for cleanup
    private unsubscribeFromPlayers: (() => void) | null = null;

    constructor(private adminService: AdminService) {}

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
            // Toggle direction if same column
            this.sortDirection.set(this.sortDirection() === 'asc' ? 'desc' : 'asc');
        } else {
            // Set new sort column and reset direction
            this.sortColumn.set(column);
            this.sortDirection.set('asc');
        }
    }

    // Keep your existing methods
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
            // Clean up existing subscription if any
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

    banPlayer(playerId: string): void {
        // Implement ban functionality
        console.log(`Banning player with ID: ${playerId}`);
    }
}
