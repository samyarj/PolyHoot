import { Component } from '@angular/core';
import { UploadImgService } from '@app/services/upload-img.service';

@Component({
    selector: 'app-profile-page',
    templateUrl: './profile-page.component.html',
    styleUrls: ['./profile-page.component.scss'],
})
export class ProfilePageComponent {
    selectedFile: File | null = null;

    constructor(private uploadImgService: UploadImgService) {}

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
                // Optionally, update the avatar image in the UI
            },
            error: (error) => {
                alert(`Error: ${error.message}`);
            },
        });
    }
}
