import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { Auth, updateProfile } from '@angular/fire/auth';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { USERNAME_MAX_LENGTH, USERNAME_MIN_LENGTH, USERNAME_REGEX } from '@app/constants/constants';
import { User } from '@app/interfaces/user';
import { AuthService } from '@app/services/auth/auth.service';
import { UploadImgService } from '@app/services/upload-img.service';
import { ToastrService } from 'ngx-toastr';
import { take } from 'rxjs/operators';
import { environment } from 'src/environments/environment';

const SECONDS_IN_MINUTE = 60;

interface GameLogEntry {
    gameName?: string;
    startTime?: string;
    endTime?: string;
    status?: 'complete' | 'abandoned';
    result?: 'win' | 'lose';
}

interface CnxLogEntry {
    timestamp: string;
    action: 'connect' | 'disconnect';
}

@Component({
    selector: 'app-profile-page',
    templateUrl: './profile-page.component.html',
    styleUrls: ['./profile-page.component.scss'],
})
export class ProfilePageComponent implements OnInit {
    selectedFile: File | null = null;
    defaultAvatars: string[] = [];
    selectedAvatar: string | null = null;
    profileForm: FormGroup;
    currentUsername: string = '';
    isCheckingUsername: boolean = false;
    isUsernameTaken: boolean = false;
    isTypingUsername: boolean = false;

    gameLogs: GameLogEntry[];
    logs: CnxLogEntry[];
    // Constants for username validation
    readonly usernamePattern: string = USERNAME_REGEX.source;
    readonly maxUsernameLength: number = USERNAME_MAX_LENGTH;
    readonly minUsernameLength: number = USERNAME_MIN_LENGTH;

    // Statistics
    totalGamesPlayed: number = 0;
    gamesWon: number = 0;
    averageCorrectAnswers: number = 0;
    averageTimePerGame: string = '0:00';
    totalActions: number = 0;
    lastLogin: string = 'N/A';

    private readonly baseUrl = `${environment.serverUrl}/users`;

    constructor(
        private uploadImgService: UploadImgService,
        private authService: AuthService,
        private fb: FormBuilder,
        private http: HttpClient,
        private auth: Auth,
        private toastr: ToastrService,
    ) {
        this.profileForm = this.fb.group({
            username: ['', [Validators.required, Validators.pattern(USERNAME_REGEX)]],
        });
    }

    ngOnInit() {
        this.loadDefaultAvatars();
        this.loadUserProfile();
        this.loadLogs();
    }
    loadLogs() {
        const user = this.authService.getUser();
        this.logs = user?.cxnLogs ?? [];
        this.gameLogs = user?.gameLogs ?? [];
    }

    getActionDisplay(action: 'connect' | 'disconnect'): string {
        return action === 'connect' ? 'Connection' : 'Déconnection';
    }

    getStatusDisplay(status: 'complete' | 'abandoned'): string {
        return status === 'complete' ? 'Complété' : 'Abandonné';
    }

    getResultDisplay(result: 'win' | 'lose'): string {
        return result === 'win' ? 'Gagné' : 'Perdu';
    }

    loadUserProfile() {
        const user = this.authService.getUser();
        if (user) {
            this.currentUsername = user.username;
            this.profileForm.patchValue({
                username: user.username,
            });
            // Set statistics
            this.totalGamesPlayed = user.nGames || 0;
            this.gamesWon = user.nWins || 0;
            this.averageCorrectAnswers = user.stats?.rightAnswerPercentage || 0;

            // Calculate average time per game if we have both total time and games played
            if (user.stats?.timeSpent && user.nGames) {
                const averageSeconds = Math.floor(user.stats.timeSpent / user.nGames);
                const minutes = Math.floor(averageSeconds / SECONDS_IN_MINUTE);
                const seconds = averageSeconds % SECONDS_IN_MINUTE;
                this.averageTimePerGame = `${minutes}:${seconds.toString().padStart(2, '0')}`;
            }
        }
    }

    onUsernameSubmit() {
        if (this.profileForm.invalid || this.isUsernameTaken) {
            return;
        }

        const newUsername = this.profileForm.get('username')?.value;
        if (!newUsername || newUsername === this.currentUsername) {
            return;
        }

        const user = this.authService.getUser();
        if (!user) {
            return;
        }

        // Get the current token from auth service
        this.authService.token$.pipe(take(1)).subscribe({
            next: async (token) => {
                if (!token) {
                    this.toastr.error('Authentication token not found. Please try again.');
                    return;
                }

                const options = {
                    headers: { authorization: `Bearer ${token}` },
                };

                try {
                    // First update Firebase Auth display name
                    if (this.auth.currentUser) {
                        await updateProfile(this.auth.currentUser, {
                            displayName: newUsername,
                        });
                    }

                    // Then update Firestore through our backend
                    this.http.patch<User>(`${this.baseUrl}/update-username`, { username: newUsername }, options).subscribe({
                        next: (updatedUser) => {
                            this.currentUsername = updatedUser.username;
                            this.authService.setUser(updatedUser);
                            this.toastr.success('Pseudonyme mis à jour avec succès !');
                        },
                        error: (error: Error) => {
                            this.toastr.error('Erreur lors de la mise à jour du pseudonyme : ' + error.message);
                        },
                    });
                } catch (error) {
                    this.toastr.error('Erreur lors de la mise à jour du profil : ' + (error as Error).message);
                }
            },
            error: (error: Error) => {
                this.toastr.error("Erreur lors de la récupération du jeton d'authentification : " + error.message);
            },
        });
    }

    checkUsername(): void {
        this.authService.handleUsernameCheck(
            this.profileForm,
            this.currentUsername,
            (value) => (this.isTypingUsername = value),
            (value) => (this.isCheckingUsername = value),
            (value) => (this.isUsernameTaken = value),
        );
    }

    onFileSelected(event: Event): void {
        const file = (event.target as HTMLInputElement).files?.[0];
        if (file) {
            this.selectedFile = file;
        }
    }

    onUpload(): void {
        if (!this.selectedFile) {
            this.toastr.warning('Veuillez sélectionner une image à téléverser.');
            return;
        }

        this.uploadImgService.uploadImage(this.selectedFile, 'avatar').subscribe({
            next: () => {
                this.toastr.success('Image téléversée avec succès');
                this.selectedFile = null;
                const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;
                if (fileInput) fileInput.value = '';
            },
            error: (error) => {
                this.toastr.error(`Erreur : ${error.message}`);
            },
        });
    }

    selectAvatar(avatarUrl: string) {
        if (this.selectedAvatar !== avatarUrl) this.selectedAvatar = avatarUrl;
        else this.selectedAvatar = null;
    }

    equipSelectedAvatar() {
        if (this.selectedAvatar) {
            this.uploadImgService.updateSelectedDefaultAvatar(this.selectedAvatar).subscribe({
                next: () => {
                    this.toastr.success('Avatar mis à jour avec succès !');
                    this.selectedAvatar = null;
                },
                error: (error) => {
                    this.toastr.error(`Erreur lors de l'équipement de l'avatar : ${error.message}`);
                    this.selectedAvatar = null;
                },
            });
        }
    }

    onInput(event: Event) {
        this.isTypingUsername = true;
        this.filterInput(event); // Filter the input in real-time
    }

    filterInput(event: Event) {
        const input = event.target as HTMLInputElement;
        let value = input.value;

        value = value.replace(/[^a-zA-Z0-9]/g, '');

        if (value.length > USERNAME_MAX_LENGTH) {
            value = value.substring(0, USERNAME_MAX_LENGTH);
        }

        if (input.value !== value) {
            input.value = value;
            this.profileForm.get('username')?.setValue(value, { emitEvent: false });
        }
    }

    private loadDefaultAvatars() {
        this.uploadImgService.getDefaultAvatars().subscribe({
            next: (response) => {
                this.defaultAvatars = response.avatars;
            },
            error: (error) => {
                console.error('Error loading default avatars:', error);
            },
        });
    }
}
