import { Component, OnInit, ViewChild, AfterViewInit } from '@angular/core';
import { Router } from '@angular/router';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatSortModule, MatSort } from '@angular/material/sort';
import { MatPaginatorModule, MatPaginator } from '@angular/material/paginator';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import {
  StudentService,
  Student,
} from '../../../services/student/student.service';
import { StudentsRegistrationComponent } from '../students-registration/students-registration.component';
import { MakePaymentComponent } from '../../payment/make-payment/make-payment.component';

@Component({
  selector: 'app-show-all-students',
  imports: [
    CommonModule,
    MatTableModule,
    MatButtonModule,
    MatIconModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatTooltipModule,
    MatSortModule,
    MatPaginatorModule,
    FormsModule,
    StudentsRegistrationComponent,
    MakePaymentComponent, // Added MakePaymentComponent
  ],
  templateUrl: './show-all-students.component.html',
  styleUrl: './show-all-students.component.scss',
})
export class ShowAllStudentsComponent implements OnInit, AfterViewInit {
  students: Student[] = [];

  // UPDATED columns to match new database structure
  displayedColumns: string[] = [
    'student_id',
    'student_name',
    'birth_date',
    'age',
    'gender',
    'class_id',
    'actions',
  ];

  dataSource = new MatTableDataSource<Student>(this.students);
  searchTerm: string = '';

  // Modal state properties
  showModal = false;
  selectedStudentForEdit: Student | null = null;

  // Payment modal state properties
  showPaymentModal = false;
  selectedStudentForPayment: {
    student_id: number;
    student_name: string;
  } | null = null;

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  constructor(private router: Router, private studentService: StudentService) {}

  ngOnInit(): void {
    this.loadStudents();
    //this.setupFilter();
  }

  ngAfterViewInit(): void {
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }

  // Check if any modal is open for blur effect
  get isAnyModalOpen(): boolean {
    return this.showModal || this.showPaymentModal;
  }

  // Open modal for new registration
  openModal(): void {
    this.selectedStudentForEdit = null;
    this.showModal = true;
  }

  // Open modal for editing existing student
  openEditModal(student: Student): void {
    this.selectedStudentForEdit = student;
    this.showModal = true;
  }

  // Close registration modal
  closeModal(): void {
    this.showModal = false;
    this.selectedStudentForEdit = null;
    this.loadStudents();
  }

  // Open payment modal
  openPaymentModal(student: Student): void {
    this.selectedStudentForPayment = {
      student_id: student.student_id,
      student_name: student.student_name,
    };
    this.showPaymentModal = true;
  }

  // Close payment modal
  closePaymentModal(): void {
    this.showPaymentModal = false;
    this.selectedStudentForPayment = null;
  }

  // Handle successful student registration/update
  onStudentRegistered(student: Student): void {
    console.log('Student operation completed successfully:', student);
    this.loadStudents();
    this.showModal = false;
    this.selectedStudentForEdit = null;
  }

  // Handle successful student deletion from modal
  onStudentDeleted(student: Student): void {
    console.log('Student deleted successfully from modal:', student);
    this.loadStudents();
    this.showModal = false;
    this.selectedStudentForEdit = null;
  }

  // Handle successful payment completion
  // onPaymentCompleted(payment: Payment): void {
  //   console.log('Payment completed successfully:', payment);
  //   // You can add additional logic here such as:
  //   // - Refresh student data if needed
  //   // - Show success message
  //   // - Update payment history
  //   this.showPaymentModal = false;
  //   this.selectedStudentForPayment = null;
  // }

  // Load students from the backend
  loadStudents(): void {
    this.studentService.getAllStudents().subscribe({
      next: (data) => {
        this.students = data;
        this.dataSource.data = this.students;
        // console.log('Students loaded:', this.students);
      },
      error: (err) => {
        console.error('Failed to load students:', err);
        alert(`Failed to load students: ${err.message}`);
      },
    });
  }

  // Calculate age from birth date
  calculateAge(birthDate: string): number {
    return this.studentService.calculateAge(birthDate);
  }

  // Format birth date for display
  formatBirthDate(birthDate: string): string {
    if (!birthDate) return 'N/A';
    const date = new Date(birthDate);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  }

  // Format gender for display
  formatGender(gender: string): string {
    if (!gender) return 'N/A';
    return gender.charAt(0).toUpperCase() + gender.slice(1).toLowerCase();
  }

  // Filter functionality
  applyFilter(): void {
    const filterValue = this.searchTerm.trim().toLowerCase();
    this.dataSource.filter = filterValue;

    if (this.dataSource.paginator) {
      this.dataSource.paginator.firstPage();
    }
  }

  // Clear search
  clearSearch(): void {
    this.searchTerm = '';
    this.applyFilter();
  }

  // UPDATED Student action methods
  onEditStudent(student: Student): void {
    console.log('Edit student:', student);
    this.openEditModal(student);
  }

  onDeleteStudent(student: Student): void {
    console.log('Delete student:', student);
    const confirmDelete = confirm(
      `Are you sure you want to delete ${student.student_name}?`
    );

    if (confirmDelete) {
      // UPDATED to use student_id instead of id
      this.studentService.deleteStudent(student.student_id).subscribe({
        next: () => {
          console.log('Student deleted successfully');
          this.loadStudents();
          alert('Student deleted successfully!');
        },
        error: (error) => {
          console.error('Error deleting student:', error);
          alert(`Error deleting student: ${error.message}`);
        },
      });
    }
  }

  // UPDATED: Open payment modal instead of viewing student details
  onMakePayment(student: Student): void {
    console.log('Opening payment modal for student:', student);
    this.openPaymentModal(student);
  }
}
