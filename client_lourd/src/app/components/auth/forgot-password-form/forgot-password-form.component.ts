import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { EMAIL_REGEX } from '@app/constants/constants';
import { AuthService } from '@app/services/auth/auth.service';
import { ToastrService } from 'ngx-toastr';

@Component({
    selector: 'app-forgot-password-form',
    templateUrl: './forgot-password-form.component.html',
    styleUrls: ['./forgot-password-form.component.scss'],
})
export class ForgotPasswordFormComponent {
    forgotPasswordForm: FormGroup;
    isSubmitting = false;
    isCheckingEmail: boolean = false;
    isTypingEmail: boolean = false;
    currentEmail: string = '';
    isEmailAvailable: boolean = false;

    constructor(
        private fb: FormBuilder,
        private authService: AuthService,
        private toastr: ToastrService,
    ) {
        this.forgotPasswordForm = this.fb.group({
            email: ['', [Validators.required, Validators.pattern(EMAIL_REGEX)]],
        });
    }

    onSubmit(): void {
        if (this.forgotPasswordForm.invalid) {
            this.toastr.error('Veuillez fournir une adresse e-mail valide.', 'Erreur');
            return;
        }

        this.isSubmitting = true;
        const email = this.forgotPasswordForm.value.email;

        this.authService.forgotPassword(email).subscribe({
            next: () => {
                this.toastr.success('E-mail de réinitialisation du mot de passe envoyé.', 'Succès');
                this.isSubmitting = false;
            },
            error: (err) => {
                this.toastr.error(err.message, 'Erreur');
                this.isSubmitting = false;
            },
        });
    }
    trimEmail() {
        this.forgotPasswordForm.controls.email.setValue(this.forgotPasswordForm.controls.email.value.toString().trim());
    }

    checkEmail(): void {
        const email = this.forgotPasswordForm.controls.email.value.toString().trim();
        this.trimEmail();
        this.isTypingEmail = false;

        // Skip if email is invalid or unchanged
        if (!email || email === this.currentEmail || this.forgotPasswordForm.get('email')?.hasError('pattern')) {
            return;
        }

        this.currentEmail = email;
        this.isEmailAvailable = false; // Default state
        this.isCheckingEmail = true; // Mark as checking
        this.forgotPasswordForm.get('email')?.disable(); // Disable the field

        // Check if email exists in the database
        this.authService.checkingEmail(email).subscribe({
            next: ({ emailExists, provider }) => {
                this.isCheckingEmail = false;
                this.isTypingEmail = false;
                this.isEmailAvailable = emailExists && provider === 'password';

                this.forgotPasswordForm.get('email')?.enable();
            },
            error: () => {
                this.isCheckingEmail = false;
                this.forgotPasswordForm.get('email')?.enable();
            },
        });
    }

    onInputEvent() {
        this.isTypingEmail = true;
    }
}
