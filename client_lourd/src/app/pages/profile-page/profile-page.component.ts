import { Component, OnInit } from '@angular/core';
import { UploadImgService } from '@app/services/upload-img.service';

@Component({
    selector: 'app-profile-page',
    templateUrl: './profile-page.component.html',
    styleUrls: ['./profile-page.component.scss'],
})
export class ProfilePageComponent implements OnInit {
    selectedFile: File | null = null;
    defaultAvatars: string[] = [];
    selectedAvatar: string | null = null;

    constructor(private uploadImgService: UploadImgService) {}

    ngOnInit() {
        this.loadDefaultAvatars();
    }

    onFileSelected(event: Event): void {
        const file = (event.target as HTMLInputElement).files?.[0];
        if (file) {
            this.selectedFile = file;
        }
    }

    onUpload(): void {
        if (!this.selectedFile) {
            alert('Please select an image file to upload.');
            return;
        }

        this.uploadImgService.uploadImage(this.selectedFile).subscribe({
            next: (response) => {
                alert(`Image uploaded successfully: ${response.avatarUrl}`);
                this.selectedFile = null;
                const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;
                if (fileInput) fileInput.value = '';
            },
            error: (error) => {
                alert(`Error: ${error.message}`);
            },
        });
    }

    selectAvatar(avatarUrl: string) {
        this.selectedAvatar = avatarUrl;
    }

    equipSelectedAvatar() {
        if (this.selectedAvatar) {
            this.uploadImgService.updateSelectedDefaultAvatar(this.selectedAvatar).subscribe({
                next: () => {
                    alert('Avatar updated successfully!');
                },
                error: (error) => {
                    alert(`Error equipping avatar: ${error.message}`);
                },
            });
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
