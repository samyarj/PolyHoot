import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { User } from '@app/interfaces/user';
import { AuthService } from 'src/app/services/auth/auth.service';

const PASSWORD_MIN_LENGTH = 6;

@Component({
    selector: 'app-sign-up-form',
    templateUrl: './sign-up-form.component.html',
    styleUrls: ['./sign-up-form.component.scss'],
})
export class SignUpFormComponent implements OnInit {
    signUpForm: FormGroup;
    errorMessage: string = '';
    successMessage: string = '';
    isLoading: boolean = false;
    isCheckingUsername: boolean = false;
    isCheckingEmail: boolean = false;

    constructor(
        private fb: FormBuilder,
        private authService: AuthService,
        private route: ActivatedRoute,
        private router: Router,
    ) {}

    ngOnInit(): void {
        this.initializeForm();
    }

    /**
     * Handle normal sign-up form submission
     */
    signUp(): void {
        this.errorMessage = '';
        this.successMessage = '';

        if (this.signUpForm.invalid) {
            this.errorMessage = 'Please fill in all fields correctly.';
            return;
        }

        const { username, email, password, confirmPassword } = this.signUpForm.value;

        if (password !== confirmPassword) {
            this.errorMessage = 'Passwords do not match.';
            return;
        }

        this.isLoading = true;
        this.signUpForm.disable();

        this.authService.signUp(username, email, password).subscribe({
            next: (user) => this.handleUserSuccess(user),
            error: (err) => {
                this.errorMessage = err.message || 'An error occurred during sign-up.';
                this.isLoading = false;
                this.signUpForm.enable(); // Re-enable the form on error
            },
        });
    }

    signUpWithGoogle(): void {
        this.isLoading = true;
        this.authService.signWithGoogle().subscribe({
            next: (user) => this.handleUserSuccess(user),
            error: (err) => {
                this.errorMessage = err.message || 'An error occurred during Google sign-up.';
                this.isLoading = false;
            },
        });
    }

    checkUsername(): void {
        const username = this.signUpForm.controls.username.value;
        if (!username) {
            return;
        }
        this.isCheckingUsername = true;
        this.signUpForm.get('username')?.disable();

        this.authService.checkingUsername(username).subscribe({
            next: (isTaken) => {
                this.isCheckingUsername = false;
                this.signUpForm.get('username')?.enable();

                if (isTaken) {
                    this.signUpForm.get('username')?.setErrors({ taken: true });
                } else {
                    this.signUpForm.get('username')?.setErrors(null);
                }
                console.log('form: after username fetched', this.signUpForm);
            },
            error: () => {
                this.isCheckingUsername = false;
                this.signUpForm.get('username')?.enable();
            },
        });
    }

    checkEmail(): void {
        const email = this.signUpForm.controls.email.value;
        if (!email) {
            return;
        }
        this.isCheckingEmail = true;
        this.signUpForm.get('email')?.disable();

        this.authService.checkingEmail(email).subscribe({
            next: (isTaken) => {
                this.isCheckingEmail = false;
                this.signUpForm.get('email')?.enable();
                if (isTaken) {
                    this.signUpForm.get('email')?.setErrors({ taken: true });
                } else {
                    this.signUpForm.get('email')?.setErrors(null);
                }

                // this.signUpForm.get('email')?.enable();
                console.log('form: after email fetched', this.signUpForm);
            },
            error: () => {
                this.isCheckingEmail = false;
                this.signUpForm.get('email')?.enable();
            },
        });
    }

    setFieldToInvalid(field: string): void {
        const control = this.signUpForm.get(field);
        if (control) {
            const existingErrors = control.errors || {}; // Get existing errors or empty object
            console.log('existingErrors', existingErrors);
            control.setErrors({ ...existingErrors, isChanged: true }); // Add the new error without overwriting others
        }
    }

    invalidFormStatus(): boolean {
        return this.signUpForm.invalid || this.isLoading || this.isCheckingEmail || this.isCheckingUsername;
    }

    private handleUserSuccess(user: User): void {
        this.successMessage = 'Sign-up successful! Welcome!';
        const returnUrl = this.route.snapshot.queryParams['returnUrl'] || '/';
        this.router.navigate([returnUrl]);
        this.authService.setUser(user);
        console.log('Sign-up successful:', user);
        this.isLoading = false;
    }

    private initializeForm(): void {
        this.signUpForm = this.fb.group({
            username: ['', [Validators.required]],
            email: ['', [Validators.required, Validators.email]],
            password: ['', [Validators.required, Validators.minLength(PASSWORD_MIN_LENGTH)]],
            confirmPassword: ['', [Validators.required]],
        });
    }
}
