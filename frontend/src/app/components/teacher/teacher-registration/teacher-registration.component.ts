// UPDATED teacher-registration.component.ts
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
} from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatRadioModule } from '@angular/material/radio';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { CommonModule } from '@angular/common';
import {
  TeacherService,
  Teacher,
} from '../../../services/teacher/teacher.service';

@Component({
  selector: 'app-teacher-registration',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatButtonModule,
    MatCardModule,
    MatIconModule,
    MatFormFieldModule,
    MatInputModule,
    MatRadioModule,
    MatProgressSpinnerModule,
  ],
  templateUrl: './teacher-registration.component.html',
  styleUrl: './teacher-registration.component.scss',
})
export class TeacherRegistrationComponent implements OnInit {
  @ViewChild('fileInput') fileInput!: ElementRef<HTMLInputElement>;

  // Input for editing existing teacher
  @Input() teacherToEdit: Teacher | null = null;

  // Output events
  @Output() closeModal = new EventEmitter<void>();
  @Output() teacherRegistered = new EventEmitter<Teacher>();
  @Output() teacherDeleted = new EventEmitter<Teacher>();

  registrationForm!: FormGroup;
  selectedImage: string | null = null;
  isSubmitting = false;

  // Check if we're in edit mode
  get isEditMode(): boolean {
    return this.teacherToEdit !== null;
  }

  constructor(
    private formBuilder: FormBuilder,
    private teacherService: TeacherService
  ) {}

  ngOnInit(): void {
    this.initializeForm();

    // If editing, populate the form with existing data
    if (this.isEditMode && this.teacherToEdit) {
      this.populateFormForEdit();
    }
  }

  // UPDATED form fields to match new database structure
  initializeForm(): void {
    this.registrationForm = this.formBuilder.group({
      teacher_name: [
        '',
        [
          Validators.required,
          Validators.minLength(2),
          Validators.maxLength(100),
        ],
      ],
      class_name: [
        '',
        [
          Validators.required,
          Validators.minLength(1),
          Validators.maxLength(10),
        ],
      ],
      gender: ['Male', [Validators.required]],
    });
  }

  // UPDATED to populate form with new field structure
  populateFormForEdit(): void {
    if (this.teacherToEdit) {
      // Use setTimeout to ensure the form is fully initialized
      setTimeout(() => {
        this.registrationForm.patchValue({
          teacher_name: this.teacherToEdit!.teacher_name,
          class_name: this.teacherToEdit!.class_name,
          gender: this.teacherToEdit!.gender,
        });

        console.log('Populating form for edit with:', this.teacherToEdit);
        console.log('Gender value being set:', this.teacherToEdit!.gender);
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

  // UPDATED form submission to work with new fields
  onRegister(): void {
    if (this.registrationForm.valid) {
      this.isSubmitting = true;

      const formData = this.registrationForm.value;

      // Prepare data for backend API with NEW field structure
      const teacherData: Partial<Teacher> = {
        teacher_name: formData.teacher_name,
        class_name: formData.class_name,
        gender: formData.gender,
      };

      if (this.isEditMode && this.teacherToEdit) {
        // Update existing teacher
        console.log('Updating teacher data:', teacherData);

        this.teacherService
          .updateTeacher(this.teacherToEdit.teacher_id, teacherData)
          .subscribe({
            next: (response) => {
              console.log('Teacher updated successfully:', response);
              this.isSubmitting = false;
              alert('Teacher updated successfully!');
              this.teacherRegistered.emit(response);
              this.closeModalHandler();
            },
            error: (error) => {
              console.error('Error updating teacher:', error);
              this.isSubmitting = false;
              alert(`Error updating teacher: ${error.message}`);
            },
          });
      } else {
        // Create new teacher
        console.log('Creating new teacher:', teacherData);

        this.teacherService.createTeacher(teacherData).subscribe({
          next: (response) => {
            console.log('Teacher registered successfully:', response);
            this.isSubmitting = false;
            alert('Teacher registered successfully!');
            this.teacherRegistered.emit(response);
            this.closeModalHandler();
          },
          error: (error) => {
            console.error('Error registering teacher:', error);
            this.isSubmitting = false;
            alert(`Error registering teacher: ${error.message}`);
          },
        });
      }
    } else {
      this.markFormGroupTouched();
    }
  }

  // Handle form reset or delete (depending on mode)
  onReset(): void {
    if (this.isEditMode && this.teacherToEdit) {
      this.onDeleteTeacher();
    } else {
      this.resetForm();
    }
  }

  // UPDATED delete method to use new field structure
  onDeleteTeacher(): void {
    if (!this.teacherToEdit) return;

    const confirmDelete = confirm(
      `Are you sure you want to delete ${this.teacherToEdit.teacher_name}?\n\nThis action cannot be undone.`
    );

    if (confirmDelete) {
      this.isSubmitting = true;

      this.teacherService
        .deleteTeacher(this.teacherToEdit.teacher_id)
        .subscribe({
          next: () => {
            console.log('Teacher deleted successfully');
            this.isSubmitting = false;
            alert('Teacher deleted successfully!');
            this.teacherDeleted.emit(this.teacherToEdit!);
            this.closeModalHandler();
          },
          error: (error) => {
            console.error('Error deleting teacher:', error);
            this.isSubmitting = false;
            alert(`Error deleting teacher: ${error.message}`);
          },
        });
    }
  }

  // Reset form to empty state
  resetForm(): void {
    this.registrationForm.reset();
    this.registrationForm.patchValue({ gender: 'Male' });
    this.selectedImage = null;

    if (this.fileInput) {
      this.fileInput.nativeElement.value = '';
    }
  }

  // Close modal
  closeModalHandler(): void {
    this.closeModal.emit();
  }

  // Mark all form fields as touched
  private markFormGroupTouched(): void {
    Object.keys(this.registrationForm.controls).forEach((key) => {
      const control = this.registrationForm.get(key);
      control?.markAsTouched();
    });
  }

  // Validation helper methods
  getFieldError(fieldName: string): string {
    const field = this.registrationForm.get(fieldName);
    if (field && field.errors && field.touched) {
      if (field.errors['required']) {
        return `${this.getFieldDisplayName(fieldName)} is required`;
      }
      if (field.errors['minlength']) {
        return `${this.getFieldDisplayName(fieldName)} must be at least ${
          field.errors['minlength'].requiredLength
        } characters`;
      }
      if (field.errors['maxlength']) {
        return `${this.getFieldDisplayName(fieldName)} must be at most ${
          field.errors['maxlength'].requiredLength
        } characters`;
      }
    }
    return '';
  }

  private getFieldDisplayName(fieldName: string): string {
    const displayNames: { [key: string]: string } = {
      teacher_name: 'Teacher Name',
      class_name: 'Class Name',
      gender: 'Gender',
    };
    return displayNames[fieldName] || fieldName;
  }

  // Check if field has error
  hasFieldError(fieldName: string): boolean {
    const field = this.registrationForm.get(fieldName);
    return !!(field && field.errors && field.touched);
  }
}
