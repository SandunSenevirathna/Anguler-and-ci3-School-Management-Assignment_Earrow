// FIXED students-registration.component.ts
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
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { CommonModule } from '@angular/common';
import {
  StudentService,
  Student,
} from '../../../services/student/student.service';

@Component({
  selector: 'app-students-registration',
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
    MatDatepickerModule,
    MatNativeDateModule,
  ],
  templateUrl: './students-registration.component.html',
  styleUrl: './students-registration.component.scss',
})
export class StudentsRegistrationComponent implements OnInit {
  @ViewChild('fileInput') fileInput!: ElementRef<HTMLInputElement>;

  // Input for editing existing student
  @Input() studentToEdit: Student | null = null;

  // Output events
  @Output() closeModal = new EventEmitter<void>();
  @Output() studentRegistered = new EventEmitter<Student>();
  @Output() studentDeleted = new EventEmitter<Student>();

  registrationForm!: FormGroup;
  selectedImage: string | null = null;
  isSubmitting = false;

  // Check if we're in edit mode
  get isEditMode(): boolean {
    return this.studentToEdit !== null;
  }

  constructor(
    private formBuilder: FormBuilder,
    private studentService: StudentService
  ) {}

  ngOnInit(): void {
    this.initializeForm();

    // If editing, populate the form with existing data
    if (this.isEditMode && this.studentToEdit) {
      this.populateFormForEdit();
    }
  }

  // UPDATED form fields to match new database structure
  initializeForm(): void {
    this.registrationForm = this.formBuilder.group({
      student_name: ['', [Validators.required, Validators.minLength(2)]],
      birth_date: ['', [Validators.required]],
      gender: ['male', [Validators.required]],
      class_id: ['', [Validators.required, Validators.min(1)]],
    });
  }

  // FIXED to populate form with proper gender selection
  // COMPLETE FIXED VERSION - Replace your populateFormForEdit method

  // FINAL FIX - Handle gender case mismatch
  populateFormForEdit(): void {
    if (this.studentToEdit) {
      // Use setTimeout to ensure the form is fully initialized
      setTimeout(() => {
        this.registrationForm.patchValue({
          student_name: this.studentToEdit!.student_name,
          birth_date: this.studentToEdit!.birth_date,
          gender: this.studentToEdit!.gender.toLowerCase(), // FIXED: Convert to lowercase
          class_id: this.studentToEdit!.class_id,
        });

        console.log('Populating form for edit with:', this.studentToEdit);
        console.log('Original gender from DB:', this.studentToEdit!.gender);
        console.log(
          'Normalized gender for form:',
          this.studentToEdit!.gender.toLowerCase()
        );
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

  // FIXED form submission to work with new fields
  onRegister(): void {
    if (this.registrationForm.valid) {
      this.isSubmitting = true;

      const formData = this.registrationForm.value;

      // FIXED: Ensure class_id is sent as a NUMBER, not string
      const studentData: Partial<Student> = {
        student_name: formData.student_name,
        birth_date: this.formatDateForBackend(formData.birth_date),
        gender: formData.gender,
        class_id: parseInt(formData.class_id, 10), // FIXED: Convert to integer
      };

      console.log('Submitting student data:', studentData);
      // Validate class_id is a valid number
      if (isNaN(studentData.class_id!) || studentData.class_id! <= 0) {
        alert('Please enter a valid class ID (positive number)');
        this.isSubmitting = false;
        return;
      }

      if (this.isEditMode && this.studentToEdit) {
        // Update existing student
        console.log('Updating student data:', studentData);

        this.studentService
          .updateStudent(this.studentToEdit.student_id, studentData)
          .subscribe({
            next: (response) => {
              console.log('Student updated successfully:', response);
              this.isSubmitting = false;
              alert('Student updated successfully!');
              this.studentRegistered.emit(response);
              this.closeModalHandler();
            },
            error: (error) => {
              console.error('Error updating student:', error);
              this.isSubmitting = false;
              alert(`Error updating student: ${error.message}`);
            },
          });
      } else {
        // Create new student
        console.log('Creating new student:', studentData);

        this.studentService.createStudent(studentData).subscribe({
          next: (response) => {
            console.log('Student registered successfully:', response);
            this.isSubmitting = false;
            alert('Student registered successfully!');
            this.studentRegistered.emit(response);
            this.closeModalHandler();
          },
          error: (error) => {
            console.error('Error registering student:', error);
            this.isSubmitting = false;
            alert(`Error registering student: ${error.message}`);
          },
        });
      }
    } else {
      this.markFormGroupTouched();
    }
  }

  // Format date for backend (YYYY-MM-DD)
  formatDateForBackend(date: any): string {
    if (!date) return '';

    if (typeof date === 'string') {
      return date;
    }

    if (date instanceof Date) {
      return date.toISOString().split('T')[0];
    }

    return '';
  }

  // Handle form reset or delete (depending on mode)
  onReset(): void {
    if (this.isEditMode && this.studentToEdit) {
      this.onDeleteStudent();
    } else {
      this.resetForm();
    }
  }

  // UPDATED delete method to use new field structure
  onDeleteStudent(): void {
    if (!this.studentToEdit) return;

    const confirmDelete = confirm(
      `Are you sure you want to delete ${this.studentToEdit.student_name}?\n\nThis action cannot be undone.`
    );

    if (confirmDelete) {
      this.isSubmitting = true;

      this.studentService
        .deleteStudent(this.studentToEdit.student_id)
        .subscribe({
          next: () => {
            console.log('Student deleted successfully');
            this.isSubmitting = false;
            alert('Student deleted successfully!');
            this.studentDeleted.emit(this.studentToEdit!);
            this.closeModalHandler();
          },
          error: (error) => {
            console.error('Error deleting student:', error);
            this.isSubmitting = false;
            alert(`Error deleting student: ${error.message}`);
          },
        });
    }
  }

  // Reset form to empty state
  resetForm(): void {
    this.registrationForm.reset();
    this.registrationForm.patchValue({ gender: 'male' });
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
}
