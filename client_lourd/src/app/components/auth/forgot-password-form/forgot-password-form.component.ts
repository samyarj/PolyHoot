import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
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

    constructor(
        private fb: FormBuilder,
        private authService: AuthService,
        private toastr: ToastrService,
    ) {
        this.forgotPasswordForm = this.fb.group({
            email: ['', [Validators.required, Validators.email]],
        });
    }

    onSubmit(): void {
        if (this.forgotPasswordForm.invalid) {
            this.toastr.error('Please provide a valid email.', 'Error');
            return;
        }

        this.isSubmitting = true;
        const email = this.forgotPasswordForm.value.email;

        this.authService.forgotPassword(email).subscribe({
            next: () => {
                this.toastr.success('Password reset email sent.', 'Success');
                this.isSubmitting = false;
            },
            error: (err) => {
                this.toastr.error(err.message, 'Error');
                this.isSubmitting = false;
            },
        });
    }

    checkEmail(): void {
        const email = this.forgotPasswordForm.controls.email.value;
        if (!email) {
            return;
        }
        this.isCheckingEmail = true;
        this.forgotPasswordForm.get('email')?.disable();

        this.authService.checkingEmail(email).subscribe({
            next: (isAvailable) => {
                this.isCheckingEmail = false;
                this.forgotPasswordForm.get('email')?.enable();
                if (isAvailable) {
                    this.forgotPasswordForm.get('email')?.setErrors(null);
                } else {
                    this.forgotPasswordForm.get('email')?.setErrors({ taken: true });
                }

                // this.signUpForm.get('email')?.enable();
                console.log('form: after email fetched', this.forgotPasswordForm);
            },
            error: () => {
                this.isCheckingEmail = false;
                this.forgotPasswordForm.get('email')?.enable();
            },
        });
    }

    setFieldToInvalid(field: string): void {
        const control = this.forgotPasswordForm.get(field);
        if (control) {
            const existingErrors = control.errors || {}; // Get existing errors or empty object
            console.log('existingErrors', existingErrors);
            control.setErrors({ ...existingErrors, isChanged: true }); // Add the new error without overwriting others
        }
    }
}
