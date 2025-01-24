import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { EMAIL_REGEX } from '@app/constants/constants';
import { AuthService } from '@app/services/auth/auth.service';

@Component({
    selector: 'app-login-form',
    templateUrl: './login-form.component.html',
    styleUrls: ['./login-form.component.scss'],
})
export class LoginFormComponent {
    loginForm: FormGroup;
    errorMessage: string = '';

    constructor(
        private fb: FormBuilder,
        private authService: AuthService,
        private router: Router,
        private route: ActivatedRoute,
    ) {
        this.loginForm = this.fb.group({
            identifier: ['', [Validators.required, Validators.pattern(EMAIL_REGEX)]],
            password: ['', Validators.required],
        });
    }

    login(): void {
        this.errorMessage = '';

        if (this.loginForm.invalid) {
            this.errorMessage = 'Please fill in all fields correctly.';
            return;
        }

        const { identifier, password } = this.loginForm.value;

        this.authService.login(identifier, password).subscribe({
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
