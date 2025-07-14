import {
  Component,
  ElementRef,
  ViewChild,
  OnInit,
  Output,
  EventEmitter,
  Input,
} from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  Validators,
  ReactiveFormsModule,
  AbstractControl,
  ValidationErrors,
} from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { CommonModule } from '@angular/common';
import {
  UserService,
  User,
  CreateUserData,
  UpdateUserData,
} from '../../../services/user/user.service';

@Component({
  selector: 'app-create-user',
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatButtonModule,
    MatCardModule,
    MatIconModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatProgressSpinnerModule,
  ],
  templateUrl: './create-user.component.html',
  styleUrl: './create-user.component.scss',
})
export class CreateUserComponent implements OnInit {
  @ViewChild('fileInput') fileInput!: ElementRef<HTMLInputElement>;

  // Input for editing existing user
  @Input() userToEdit: User | null = null;

  // Output events
  @Output() closeModal = new EventEmitter<void>();
  @Output() userRegistered = new EventEmitter<User>();
  @Output() userDeleted = new EventEmitter<User>();

  registrationForm!: FormGroup;
  selectedImage: string | null = null;
  isSubmitting = false;
  hidePassword = true;
  hideConfirmPassword = true;

  // Available roles
  roles = [
    { value: 'Admin', label: 'Administrator' },
    { value: 'Teacher', label: 'Teacher' },
    { value: 'Student', label: 'Student' },
  ];

  // Check if we're in edit mode
  get isEditMode(): boolean {
    return this.userToEdit !== null;
  }

  constructor(
    private formBuilder: FormBuilder,
    private userService: UserService
  ) {}

  ngOnInit(): void {
    console.log('CreateUserComponent initialized', {
      isEditMode: this.isEditMode,
      userToEdit: this.userToEdit,
    });
    this.initializeForm();

    // If editing, populate the form with existing data
    if (this.isEditMode && this.userToEdit) {
      this.populateFormForEdit();
    }
  }

  // Custom validator for password confirmation
  passwordMatchValidator(control: AbstractControl): ValidationErrors | null {
    const password = control.get('password');
    const confirmPassword = control.get('confirmPassword');

    if (!password || !confirmPassword) {
      return null;
    }

    // Skip validation if password is empty (for edit mode)
    if (!password.value && !confirmPassword.value) {
      return null;
    }

    return password.value === confirmPassword.value
      ? null
      : { passwordMismatch: true };
  }

  // Custom validator for username (no spaces, special characters)
  usernameValidator(control: AbstractControl): ValidationErrors | null {
    const username = control.value;
    if (!username) return null;

    const usernamePattern = /^[a-zA-Z0-9_]+$/;
    return usernamePattern.test(username) ? null : { invalidUsername: true };
  }

  // FIXED: Initialize form with validation (updated to match backend requirements)
  initializeForm(): void {
    this.registrationForm = this.formBuilder.group(
      {
        username: [
          '',
          [
            Validators.required,
            Validators.minLength(3),
            Validators.maxLength(50), // FIXED: Match backend max length
            this.usernameValidator,
          ],
        ],
        password: [
          '',
          [
            Validators.required,
            Validators.minLength(8), // FIXED: Match backend minimum length
            Validators.pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).*$/), // At least one lowercase, uppercase, and digit
          ],
        ],
        confirmPassword: ['', [Validators.required]],
        role: ['Student', [Validators.required]],
      },
      { validators: this.passwordMatchValidator }
    );

    // Watch for password changes to trigger confirm password validation
    this.registrationForm.get('password')?.valueChanges.subscribe(() => {
      this.registrationForm.get('confirmPassword')?.updateValueAndValidity();
    });
  }

  // FIXED: Populate form for editing (make password optional in edit mode)
  populateFormForEdit(): void {
    if (this.userToEdit) {
      setTimeout(() => {
        this.registrationForm.patchValue({
          username: this.userToEdit!.username,
          role: this.userToEdit!.role,
          password: '', // Clear password field
          confirmPassword: '', // Clear confirm password field
        });

        // FIXED: In edit mode, make password optional
        this.registrationForm.get('password')?.clearValidators();
        this.registrationForm
          .get('password')
          ?.setValidators([
            Validators.minLength(8),
            Validators.pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).*$/),
          ]);

        this.registrationForm.get('confirmPassword')?.clearValidators();
        this.registrationForm.get('password')?.updateValueAndValidity();
        this.registrationForm.get('confirmPassword')?.updateValueAndValidity();

        console.log('Populating form for edit with:', this.userToEdit);
        console.log('Form values after patch:', this.registrationForm.value);
      }, 0);
    }
  }

  // Handle profile image selection
  selectProfileImage(): void {
    this.fileInput.nativeElement.click();
  }

  // Handle image file selection
  onImageSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files[0]) {
      const file = input.files[0];

      if (!file.type.startsWith('image/')) {
        alert('Please select a valid image file.');
        return;
      }

      if (file.size > 5 * 1024 * 1024) {
        alert('Please select an image smaller than 5MB.');
        return;
      }

      const reader = new FileReader();
      reader.onload = (e) => {
        this.selectedImage = e.target?.result as string;
      };
      reader.readAsDataURL(file);
    }
  }

  // FIXED: Form submission with proper validation
  onRegister(): void {
    console.log('Form submission started');
    console.log('Form valid:', this.registrationForm.valid);
    console.log('Form values:', this.registrationForm.value);
    console.log('Form errors:', this.registrationForm.errors);

    // FIXED: In edit mode, form is valid even if password is empty
    const isFormValid = this.isEditMode
      ? this.isFormValidForEdit()
      : this.registrationForm.valid;

    if (isFormValid) {
      this.isSubmitting = true;

      const formData = this.registrationForm.value;

      if (this.isEditMode && this.userToEdit) {
        // Update existing user
        const updateData: UpdateUserData = {
          username: formData.username,
          role: formData.role,
        };

        // Only include password if it's provided and not empty
        if (formData.password && formData.password.trim() !== '') {
          updateData.password = formData.password;
        }

        console.log('Updating user data:', updateData);

        this.userService
          .updateUser(this.userToEdit.user_id, updateData)
          .subscribe({
            next: (response: any) => {
              console.log('User updated successfully:', response);
              this.isSubmitting = false;
              alert('User updated successfully!');
              // FIXED: Get updated user data from backend
              this.userService.getUserById(this.userToEdit!.user_id).subscribe({
                next: (updatedUser) => {
                  this.userRegistered.emit(updatedUser);
                  this.closeModalHandler();
                },
                error: (error) => {
                  console.error('Error fetching updated user:', error);
                  this.closeModalHandler(); // Still close modal
                },
              });
            },
            error: (error: { message: any }) => {
              console.error('Error updating user:', error);
              this.isSubmitting = false;
              alert(`Error updating user: ${error.message}`);
            },
          });
      } else {
        // Create new user
        const createData: CreateUserData = {
          username: formData.username,
          password: formData.password,
          role: formData.role,
        };

        console.log('Creating new user:', createData);

        this.userService.createUser(createData).subscribe({
          next: (response: any) => {
            console.log('User registered successfully:', response);
            this.isSubmitting = false;
            alert('User registered successfully!');
            // FIXED: Emit a user object instead of response
            const newUser: User = {
              user_id: response.user_id || response.id,
              username: createData.username,
              role: createData.role,
            };
            this.userRegistered.emit(newUser);
            this.closeModalHandler();
          },
          error: (error: { message: any }) => {
            console.error('Error registering user:', error);
            this.isSubmitting = false;
            alert(`Error registering user: ${error.message}`);
          },
        });
      }
    } else {
      console.log('Form is invalid, marking all fields as touched');
      this.markFormGroupTouched();
    }
  }

  // FIXED: Check if form is valid for edit mode (password optional)
  private isFormValidForEdit(): boolean {
    const usernameValid = this.registrationForm.get('username')?.valid;
    const roleValid = this.registrationForm.get('role')?.valid;
    const passwordValue = this.registrationForm.get('password')?.value;
    const confirmPasswordValue =
      this.registrationForm.get('confirmPassword')?.value;

    // If password is provided, both password and confirm password must be valid
    if (passwordValue && passwordValue.trim() !== '') {
      const passwordValid = this.registrationForm.get('password')?.valid;
      const passwordsMatch = passwordValue === confirmPasswordValue;
      return !!(usernameValid && roleValid && passwordValid && passwordsMatch);
    }

    // If no password provided, just check username and role
    return !!(usernameValid && roleValid);
  }

  // Handle form reset or delete (depending on mode)
  onReset(): void {
    if (this.isEditMode && this.userToEdit) {
      this.onDeleteUser();
    } else {
      this.resetForm();
    }
  }

  // Delete user
  onDeleteUser(): void {
    if (!this.userToEdit) return;

    const confirmDelete = confirm(
      `Are you sure you want to delete user "${this.userToEdit.username}"?\n\nThis action cannot be undone.`
    );

    if (confirmDelete) {
      this.isSubmitting = true;

      this.userService.deleteUser(this.userToEdit.user_id).subscribe({
        next: () => {
          console.log('User deleted successfully');
          this.isSubmitting = false;
          alert('User deleted successfully!');
          this.userDeleted.emit(this.userToEdit!);
          this.closeModalHandler();
        },
        error: (error: { message: any }) => {
          console.error('Error deleting user:', error);
          this.isSubmitting = false;
          alert(`Error deleting user: ${error.message}`);
        },
      });
    }
  }

  // Reset form to empty state
  resetForm(): void {
    this.registrationForm.reset();
    this.registrationForm.patchValue({ role: 'Student' });
    this.selectedImage = null;

    // FIXED: Re-add validators after reset
    this.initializeForm();

    if (this.fileInput) {
      this.fileInput.nativeElement.value = '';
    }
  }

  // Close modal
  closeModalHandler(): void {
    console.log('CreateUserComponent: Emitting close modal event');
    this.closeModal.emit();
  }

  // Mark all form fields as touched
  private markFormGroupTouched(): void {
    Object.keys(this.registrationForm.controls).forEach((key) => {
      const control = this.registrationForm.get(key);
      control?.markAsTouched();
      control?.markAsDirty();
    });
  }

  // Toggle password visibility
  togglePasswordVisibility(): void {
    this.hidePassword = !this.hidePassword;
  }

  // Toggle confirm password visibility
  toggleConfirmPasswordVisibility(): void {
    this.hideConfirmPassword = !this.hideConfirmPassword;
  }
}
