import { Component, OnInit, Output, EventEmitter, Input } from '@angular/core';
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
import { MatSelectModule } from '@angular/material/select';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { CommonModule } from '@angular/common';
import {
  PaymentService,
  Payment,
} from '../../../services/payment/payment.service';

@Component({
  selector: 'app-make-payment',
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
  templateUrl: './make-payment.component.html',
  styleUrl: './make-payment.component.scss',
})
export class MakePaymentComponent implements OnInit {
  // Input for student information
  @Input() studentData: { student_id: number; student_name: string } | null =
    null;
  @Input() prefilledData: Partial<Payment> | null = null;

  // Output events
  @Output() closeModal = new EventEmitter<void>();
  @Output() paymentCompleted = new EventEmitter<Payment>();

  paymentForm!: FormGroup;
  isSubmitting = false;

  // Service type options
  serviceTypes = [
    'Tuition Fee',
    'Admission Fee',
    'Examination Fee',
    'Library Fee',
    'Laboratory Fee',
    'Sports Fee',
    'Transportation Fee',
    'Hostel Fee',
    'Other',
  ];

  constructor(
    private formBuilder: FormBuilder,
    private paymentService: PaymentService
  ) {}

  ngOnInit(): void {
    this.initializeForm();

    // If prefilled data is provided, populate the form
    if (this.prefilledData || this.studentData) {
      this.populateForm();
    }
  }

  initializeForm(): void {
    this.paymentForm = this.formBuilder.group({
      full_name: ['', [Validators.required, Validators.minLength(2)]],
      service_type: ['', [Validators.required]],
      amount: [
        '',
        [
          Validators.required,
          Validators.min(0.01),
          Validators.pattern(/^\d+(\.\d{1,2})?$/),
        ],
      ],
    });
  }

  populateForm(): void {
    setTimeout(() => {
      const formData: any = {};

      // Use student data if available
      if (this.studentData) {
        formData.full_name = this.studentData.student_name;
      }

      // Use prefilled data if available
      if (this.prefilledData) {
        if (this.prefilledData.student_name) {
          formData.full_name = this.prefilledData.student_name;
        }
        if (this.prefilledData.service_type) {
          formData.service_type = this.prefilledData.service_type;
        }
        if (this.prefilledData.amount) {
          formData.amount = this.prefilledData.amount.toString();
        }
      }

      this.paymentForm.patchValue(formData);
      console.log('Form populated with:', formData);
    }, 0);
  }

  // THIS IS THE FIXED METHOD - SAVES TO DATABASE
  onMakePayment(): void {
    if (this.paymentForm.valid) {
      this.isSubmitting = true;

      const formData = this.paymentForm.value;
      const currentDate = new Date();

      const paymentData: Partial<Payment> = {
        student_id:
          this.studentData?.student_id || this.prefilledData?.student_id || 0,
        service_type: formData.service_type,
        amount: parseFloat(formData.amount),
        payment_date: currentDate.toISOString().split('T')[0], // YYYY-MM-DD
        payment_time: currentDate.toTimeString().split(' ')[0], // HH:MM:SS
      };

      // Validate student_id
      const studentIdNum = Number(paymentData.student_id);
      if (!studentIdNum || studentIdNum <= 0) {
        alert(
          'Invalid student information. Please provide valid student data.'
        );
        this.isSubmitting = false;
        return;
      }

      console.log('Saving payment to database:', paymentData);

      // SAVE TO DATABASE
      this.paymentService.createPayment(paymentData).subscribe({
        next: (response) => {
          console.log('Payment saved successfully:', response);
          this.isSubmitting = false;
          alert('Payment completed successfully!');
          this.paymentCompleted.emit(response);
          this.closeModalHandler();
        },
        error: (error) => {
          console.error('Error saving payment:', error);
          this.isSubmitting = false;
          alert(`Error processing payment: ${error.message}`);
        },
      });
    } else {
      this.markFormGroupTouched();
    }
  }

  // Close modal
  closeModalHandler(): void {
    this.closeModal.emit();
  }

  // Reset form
  resetForm(): void {
    this.paymentForm.reset();
    this.populateForm(); // Repopulate with initial data
  }

  // Format amount input
  onAmountInput(event: Event): void {
    const input = event.target as HTMLInputElement;
    let value = input.value.replace(/[^0-9.]/g, ''); // Remove non-numeric characters except decimal

    // Ensure only one decimal point
    const parts = value.split('.');
    if (parts.length > 2) {
      value = parts[0] + '.' + parts.slice(1).join('');
    }

    // Limit to 2 decimal places
    if (parts[1] && parts[1].length > 2) {
      value = parts[0] + '.' + parts[1].substring(0, 2);
    }

    input.value = value;
    this.paymentForm.patchValue({ amount: value });
  }

  // Get formatted amount for display
  getFormattedAmount(): string {
    const amount = this.paymentForm.get('amount')?.value;
    if (amount && !isNaN(parseFloat(amount))) {
      return parseFloat(amount).toFixed(2);
    }
    return '';
  }

  // Mark all form fields as touched for validation display
  private markFormGroupTouched(): void {
    Object.keys(this.paymentForm.controls).forEach((key) => {
      const control = this.paymentForm.get(key);
      control?.markAsTouched();
    });
  }
}
