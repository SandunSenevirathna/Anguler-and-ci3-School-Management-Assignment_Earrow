import { Component, OnInit } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  Validators,
  ReactiveFormsModule,
} from '@angular/forms';
import { CommonModule } from '@angular/common';
import { UserService, LoginData } from '../../services/user/user.service';
import { AuthService } from '../../services/auth/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss',
})
export class LoginComponent implements OnInit {
  loginForm!: FormGroup;
  showPassword = false;
  isLoading = false;

  constructor(
    private formBuilder: FormBuilder,
    private userService: UserService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.initializeForm();
  }

  private initializeForm(): void {
    this.loginForm = this.formBuilder.group({
      username: [
        '',
        [
          Validators.required,
          Validators.minLength(3),
          Validators.maxLength(50),
        ],
      ],
      password: ['', [Validators.required, Validators.minLength(8)]],
    });
  }

  togglePasswordVisibility(): void {
    this.showPassword = !this.showPassword;
  }

  onSubmit(): void {
    if (this.loginForm.valid) {
      this.isLoading = true;

      const loginData: LoginData = {
        username: this.loginForm.value.username,
        password: this.loginForm.value.password,
      };

      this.userService.login(loginData).subscribe({
        next: (user) => {
          this.isLoading = false;
          //console.log('✅ Login successful:', user);

          // Show success alert (optional - you can remove this)
          // alert(
          //   `Welcome ${user.username}! Login successful.\nRole: ${user.role}`
          // );

          // AuthService will handle login state and navigation to dashboard
          this.authService.login(user);

          // No need to handle navigation here - AuthService does it
        },
        error: (error) => {
          this.isLoading = false;
          console.error('❌ Login failed:', error);

          // Show error alert
          alert(`Login Failed!\n${error.message}`);
        },
      });
    } else {
      this.markFormGroupTouched();
    }
  }

  private markFormGroupTouched(): void {
    Object.keys(this.loginForm.controls).forEach((key) => {
      const control = this.loginForm.get(key);
      control?.markAsTouched();
    });
  }

  // Getter methods for easy access to form controls
  get username() {
    return this.loginForm.get('username');
  }

  get password() {
    return this.loginForm.get('password');
  }

  // Helper methods for validation display
  hasUsernameError(): boolean {
    return !!(this.username?.invalid && this.username?.touched);
  }

  hasPasswordError(): boolean {
    return !!(this.password?.invalid && this.password?.touched);
  }

  getUsernameErrorMessage(): string {
    if (this.username?.errors?.['required']) {
      return 'Username is required';
    }
    if (this.username?.errors?.['minlength']) {
      return 'Username must be at least 3 characters long';
    }
    if (this.username?.errors?.['maxlength']) {
      return 'Username must not exceed 50 characters';
    }
    return '';
  }

  getPasswordErrorMessage(): string {
    if (this.password?.errors?.['required']) {
      return 'Password is required';
    }
    if (this.password?.errors?.['minlength']) {
      return 'Password must be at least 8 characters long';
    }
    return '';
  }
}
