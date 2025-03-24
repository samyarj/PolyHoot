import { Component, computed, OnInit, OnDestroy, signal } from '@angular/core';
import { User } from '@app/interfaces/user';
import { AdminService } from '@app/services/back-end-communication-services/admin-service/admin.service';

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

    // Computed signals
    hasPlayers = computed(() => this.players().length > 0);
    filteredPlayers = computed(() => {
        const term = this.searchTerm().toLowerCase().trim();
        if (!term) return this.players();

        return this.players().filter((player) => player.username.toLowerCase().includes(term));
    });

    // Store unsubscribe function for cleanup
    private unsubscribeFromPlayers: (() => void) | null = null;

    constructor(private adminService: AdminService) {}

    ngOnInit(): void {
        this.loadPlayersRealtime();
    }

    ngOnDestroy(): void {
        // Clean up the Firebase listener when component is destroyed
        if (this.unsubscribeFromPlayers) {
            this.unsubscribeFromPlayers();
        }
    }

    // Original HTTP method (keep as fallback)
    loadPlayers(): void {
        this.isLoading.set(true);
        this.error.set(null);

        this.adminService.getAllPlayers().subscribe({
            next: (data) => this.players.set(data),
            error: (err) => this.error.set(err.message || 'Failed to load players'),
            complete: () => this.isLoading.set(false),
        });
    }

    // New real-time method
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
