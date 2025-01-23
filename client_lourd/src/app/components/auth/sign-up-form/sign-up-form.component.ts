import { Component, OnInit } from "@angular/core";
import { FormBuilder, FormGroup, Validators } from "@angular/forms";
import { ActivatedRoute, Router } from "@angular/router";
import {
  EMAIL_REGEX,
  PASSWORD_MIN_LENGTH,
  USERNAME_REGEX,
} from "@app/constants/constants";
import { User } from "@app/interfaces/user";
import { ToastrService } from "ngx-toastr";
import { AuthService } from "src/app/services/auth/auth.service";

@Component({
  selector: "app-sign-up-form",
  templateUrl: "./sign-up-form.component.html",
  styleUrls: ["./sign-up-form.component.scss"],
})
export class SignUpFormComponent implements OnInit {
  signUpForm: FormGroup;
  errorMessage: string = "";
  successMessage: string = "";
  isLoading: boolean = false;
  isCheckingUsername: boolean = false;
  isCheckingEmail: boolean = false;
  isTypingUsername: boolean = false;
  isTypingEmail: boolean = false;
  currentUsername: string = "";
  currentEmail: string = "";
  isUsernameTaken: boolean = false;
  isEmailTaken: boolean = false;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private route: ActivatedRoute,
    private router: Router,
    private toast: ToastrService
  ) {}

  ngOnInit(): void {
    this.initializeForm();
  }

  /**
   * Handle normal sign-up form submission
   */
  signUp(): void {
    const { username, email, password, confirmPassword } =
      this.signUpForm.value;

    if (password !== confirmPassword) {
      this.toast.error("Passwords do not match.", "Error", {
        positionClass: "toast-top-left",
      });

      return;
    }

    this.isLoading = true;
    this.signUpForm.disable();

    this.authService.signUp(username, email, password).subscribe({
      next: (user) => this.handleUserSuccess(user),
      error: (err) => {
        this.toast;
        this.isLoading = false;
        this.signUpForm.enable();
      },
    });
  }

  signUpWithGoogle(): void {
    this.isLoading = true;
    this.authService.signWithGoogle().subscribe({
      next: (user) => this.handleUserSuccess(user),
      error: (err) => {
        this.errorMessage =
          err.message || "An error occurred during Google sign-up.";
        this.isLoading = false;
      },
    });
  }

  checkUsername(): void {
    const username = this.signUpForm.controls.username.value;
    this.isTypingUsername = false;

    if (
      !username ||
      username === this.currentUsername ||
      this.signUpForm.get("username")?.hasError("pattern")
    ) {
      return;
    }
    this.isUsernameTaken = false;
    this.currentUsername = username;
    this.isCheckingUsername = true;
    this.signUpForm.get("username")?.disable();

    this.authService.checkingUsername(username).subscribe({
      next: (isTaken) => {
        this.isCheckingUsername = false;
        this.isTypingUsername = false;
        this.isUsernameTaken = isTaken;

        this.signUpForm.get("username")?.enable();
      },
      error: () => {
        this.isCheckingUsername = false;
        this.signUpForm.get("username")?.enable();
      },
    });
  }

  checkEmail(): void {
    const email = this.signUpForm.controls.email.value;
    this.isTypingEmail = false;

    if (
      !email ||
      email === this.currentEmail ||
      this.signUpForm.get("email")?.hasError("pattern")
    ) {
      return;
    }
    this.isEmailTaken = false;
    this.currentEmail = email;

    this.isCheckingEmail = true;
    this.signUpForm.get("email")?.disable();

    this.authService.checkingEmail(email).subscribe({
      next: (isTaken) => {
        this.isCheckingEmail = false;
        this.isTypingEmail = false;
        this.isEmailTaken = isTaken;

        this.signUpForm.get("email")?.enable();
      },
      error: () => {
        this.isCheckingEmail = false;
        this.signUpForm.get("email")?.enable();
      },
    });
  }

  invalidFormStatus(): boolean {
    return (
      this.signUpForm.invalid ||
      this.isLoading ||
      this.isCheckingEmail ||
      this.isCheckingUsername ||
      this.isTypingUsername ||
      this.isTypingEmail ||
      this.isUsernameTaken ||
      this.isEmailTaken
    );
  }

  private handleUserSuccess(user: User): void {
    this.successMessage = "Sign-up successful! Welcome!";
    const returnUrl = this.route.snapshot.queryParams["returnUrl"] || "/";
    this.router.navigate([returnUrl]);
    this.authService.setUser(user);
    this.isLoading = false;
  }

  private initializeForm(): void {
    this.signUpForm = this.fb.group({
      username: ["", [Validators.required, Validators.pattern(USERNAME_REGEX)]],
      email: ["", [Validators.required, Validators.pattern(EMAIL_REGEX)]],
      password: [
        "",
        [Validators.required, Validators.minLength(PASSWORD_MIN_LENGTH)],
      ],
      confirmPassword: ["", [Validators.required]],
    });
  }

  onInputEvent(fieldName: string) {
    if (fieldName === "username") {
      this.isTypingUsername = true;
    } else if (fieldName === "email") {
      this.isTypingEmail = true;
    }
  }
}
