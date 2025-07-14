import { Component, OnInit, ViewChild, AfterViewInit } from '@angular/core';
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
  PaymentService,
  Payment,
} from '../../../services/payment/payment.service';

@Component({
  selector: 'app-payment',
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
  ],
  templateUrl: './payment.component.html',
  styleUrl: './payment.component.scss',
})
export class PaymentComponent implements OnInit, AfterViewInit {
  payments: Payment[] = [];

  // Table columns to display
  displayedColumns: string[] = [
    'payment_id',
    // 'student_id',
    'student_name',
    'service_type',
    'amount',
    'payment_date',
    'payment_time',
    // 'actions',
  ];

  dataSource = new MatTableDataSource<Payment>(this.payments);
  searchTerm: string = '';

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  constructor(private paymentService: PaymentService) {}

  ngOnInit(): void {
    this.loadPayments();
    this.setupFilter();
  }

  ngAfterViewInit(): void {
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }

  // Load payments from the backend
  loadPayments(): void {
    this.paymentService.getAllPayments().subscribe({
      next: (data) => {
        this.payments = data;
        this.dataSource.data = this.payments;
        console.log('Payments loaded:', this.payments);
      },
      error: (err) => {
        console.error('Failed to load payments:', err);
        alert(`Failed to load payments: ${err.message}`);
      },
    });
  }

  // Format date for display
  formatDate(date: string): string {
    if (!date) return 'N/A';
    const dateObj = new Date(date);
    return dateObj.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  }

  // Format time for display
  formatTime(time: string): string {
    if (!time) return 'N/A';
    return time;
  }

  // FIXED: Format amount for display - handles both string and number
  formatAmount(amount: number | string): string {
    if (!amount) return '$0.00';

    // Convert string to number if needed
    const numericAmount =
      typeof amount === 'string' ? parseFloat(amount) : amount;

    // Check if conversion was successful
    if (isNaN(numericAmount)) return '$0.00';

    return `$${numericAmount.toFixed(2)}`;
  }

  // Setup filter functionality
  setupFilter(): void {
    this.dataSource.filterPredicate = (data: Payment, filter: string) => {
      const searchStr = filter.toLowerCase();
      return (
        data.payment_id?.toString().includes(searchStr) ||
        data.student_id.toString().includes(searchStr) ||
        (data.student_name
          ? data.student_name.toLowerCase().includes(searchStr)
          : false) ||
        data.service_type.toLowerCase().includes(searchStr) ||
        data.amount.toString().includes(searchStr) ||
        (data.payment_date ? data.payment_date.includes(searchStr) : false) ||
        (data.payment_time ? data.payment_time.includes(searchStr) : false)
      );
    };
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

  // Payment action methods
  onViewPayment(payment: Payment): void {
    console.log('View payment:', payment);
    alert(
      `Payment Details:\n\nPayment ID: ${payment.payment_id}\nStudent ID: ${
        payment.student_id
      }\nStudent Name: ${payment.student_name || 'N/A'}\nService: ${
        payment.service_type
      }\nAmount: ${this.formatAmount(payment.amount)}\nDate: ${this.formatDate(
        payment.payment_date
      )}\nTime: ${this.formatTime(payment.payment_time)}`
    );
  }

  onEditPayment(payment: Payment): void {
    console.log('Edit payment:', payment);
    // You can implement edit functionality here
    alert('Edit functionality coming soon!');
  }

  onDeletePayment(payment: Payment): void {
    console.log('Delete payment:', payment);

    // Convert payment_id to number if it's a string
    const paymentId =
      typeof payment.payment_id === 'string'
        ? parseInt(payment.payment_id)
        : payment.payment_id;

    const confirmDelete = confirm(
      `Are you sure you want to delete this payment?\n\nPayment ID: ${
        payment.payment_id
      }\nAmount: ${this.formatAmount(payment.amount)}\nService: ${
        payment.service_type
      }`
    );

    if (confirmDelete && paymentId) {
      this.paymentService.deletePayment(paymentId).subscribe({
        next: () => {
          console.log('Payment deleted successfully');
          this.loadPayments(); // Reload the table
          alert('Payment deleted successfully!');
        },
        error: (error) => {
          console.error('Error deleting payment:', error);
          alert(`Error deleting payment: ${error.message}`);
        },
      });
    }
  }

  // FIXED: Calculate total amount - handles string amounts
  getTotalAmount(): number {
    return this.payments.reduce((total, payment) => {
      const amount =
        typeof payment.amount === 'string'
          ? parseFloat(payment.amount)
          : payment.amount;
      return total + (isNaN(amount) ? 0 : amount);
    }, 0);
  }

  // Get payment count
  getPaymentCount(): number {
    return this.payments.length;
  }

  // Refresh data
  refreshPayments(): void {
    this.loadPayments();
  }
}
