import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService } from '@app/services/auth/auth.service';

@Component({
    selector: 'app-login-form',
    templateUrl: './login-form.component.html',
    styleUrls: ['./login-form.component.scss'],
})
export class LoginFormComponent {
    loginForm: FormGroup;
    errorMessage: string = '';
    isSubmitting: boolean = false;

    constructor(
        private fb: FormBuilder,
        private authService: AuthService,
        private router: Router,
        private route: ActivatedRoute,
    ) {
        this.loginForm = this.fb.group({
            identifier: ['', [Validators.required]],
            password: ['', Validators.required],
        });
    }

    login(): void {
        this.errorMessage = '';

        if (this.loginForm.invalid) {
            this.errorMessage = 'Please fill in all fields correctly.';
            return;
        }

        let { identifier, password } = this.loginForm.value;
        identifier = identifier.trim();
        password = password.trim();
        this.isSubmitting = true;
        this.loginForm.disable();

        this.authService.login(identifier, password).subscribe({
            next: (user) => {
                const returnUrl = this.route.snapshot.queryParams['returnUrl'] || '/';
                this.router.navigateByUrl(returnUrl);
                this.authService.setUser(user);
            },
            error: (error) => {
                this.errorMessage = error.message;
                this.isSubmitting = false;
                this.loginForm.enable();
            },
        });
    }

    loginWithGoogle(): void {
        this.authService.signWithGoogle().subscribe({
            next: (user) => {
                const returnUrl = this.route.snapshot.queryParams['returnUrl'] || '/';
                this.router.navigateByUrl(returnUrl);
                this.authService.setUser(user);
            },
            error: (error) => {
                this.errorMessage = error.message;
            },
        });
    }
}
