import { Component, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatPaginatorModule, MatPaginator } from '@angular/material/paginator';
import { MatSortModule, MatSort } from '@angular/material/sort';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBarModule, MatSnackBar } from '@angular/material/snack-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { AttendanceService } from '../../../services/attendance/attendance.service';

export interface AttendanceRecord {
  id?: number;
  student_id: string;
  student_name: string;
  class_id: string;
  date: string;
  present: boolean | number | string;
  attendance_time: string | null;
  marked_by: string;
  created_at?: string;
  updated_at?: string;
}

@Component({
  selector: 'app-show-attendance-history',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    HttpClientModule,
    MatTableModule,
    MatPaginatorModule,
    MatSortModule,
    MatInputModule,
    MatFormFieldModule,
    MatButtonModule,
    MatIconModule,
    MatSnackBarModule,
    MatProgressSpinnerModule,
    MatDatepickerModule,
    MatNativeDateModule,
  ],
  templateUrl: './show-attendance-history.component.html',
  styleUrls: ['./show-attendance-history.component.scss'],
})
export class ShowAttendanceHistoryComponent implements OnInit {
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  displayedColumns: string[] = [
    'date',
    'student_name',
    'student_id',
    'class_id',
    'present',
    'attendance_time',
    'marked_by',
  ];

  dataSource = new MatTableDataSource<AttendanceRecord>();
  filteredData: AttendanceRecord[] = [];
  allData: AttendanceRecord[] = [];
  searchValue: string = '';
  totalRecords: number = 0;

  // Date range filters
  startDate: Date | null = null;
  endDate: Date | null = null;

  // User and class information
  currentUser: any = null;
  userRole: string = '';
  username: string = '';
  teacherClass: string = '';

  // Loading and state
  isLoading: boolean = false;
  hasSearched: boolean = false;

  constructor(
    private attendanceService: AttendanceService,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.initializeComponent();
  }

  ngAfterViewInit(): void {
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }

  /**
   * Initialize component by getting user data
   */
  initializeComponent(): void {
    // Get current user from localStorage
    this.currentUser = this.attendanceService.getCurrentUser();

    if (!this.currentUser) {
      this.showMessage('No user data found. Please login again.', 'error');
      return;
    }

    this.userRole = this.currentUser.role;
    this.username = this.currentUser.username;
  }

  /**
   * Load teacher class information
   */
  loadTeacherClass(): void {
    const teacherName = this.username;

    this.attendanceService.getTeacherByName(teacherName).subscribe({
      next: (response) => {
        if (response.status === 'success' && response.data) {
          this.teacherClass = response.data.class_name;
        }
      },
      error: (error) => {
        console.error('Error fetching teacher data:', error);
      },
    });
  }

  /**
   * Clear date filters
   */
  clearFilters(): void {
    this.startDate = null;
    this.endDate = null;
    this.searchValue = '';
    this.dataSource.data = [];
    this.filteredData = [];
    this.allData = [];
    this.totalRecords = 0;
    this.hasSearched = false;
  }

  /**
   * Handle date range change
   */
  onDateRangeChange(): void {
    // Optional: Auto-load when both dates are selected
    if (this.startDate && this.endDate) {
      // You can uncomment this to auto-load on date change
      // this.loadAttendanceData();
    }
  }

  /**
   * Load attendance data based on date range and user role
   */
  loadAttendanceData(): void {
    if (!this.startDate || !this.endDate) {
      this.showMessage('Please select both start and end dates.', 'error');
      return;
    }

    if (this.startDate > this.endDate) {
      this.showMessage('Start date cannot be later than end date.', 'error');
      return;
    }

    this.isLoading = true;
    this.hasSearched = true;

    const startDateStr = this.formatDateForAPI(this.startDate);
    const endDateStr = this.formatDateForAPI(this.endDate);

    if (this.userRole.toLowerCase() === 'teacher') {
      this.loadTeacherAttendanceHistory(startDateStr, endDateStr);
    } else if (this.userRole.toLowerCase() === 'admin') {
      this.loadAllAttendanceHistory(startDateStr, endDateStr);
    } else {
      this.showMessage('Unauthorized access. Invalid user role.', 'error');
      this.isLoading = false;
    }
  }

  /**
   * Load attendance history for teacher
   */
  loadTeacherAttendanceHistory(startDate: string, endDate: string): void {
    this.attendanceService
      .getAttendanceByDateRange(this.username, startDate, endDate)
      .subscribe({
        next: (response) => {
          this.handleAttendanceDataResponse(response);
        },
        error: (error) => {
          console.error('Error fetching teacher attendance history:', error);
          this.showMessage('Error loading attendance history.', 'error');
          this.isLoading = false;
        },
      });
  }

  /**
   * Load attendance history for admin (all teachers)
   */
  loadAllAttendanceHistory(startDate: string, endDate: string): void {
    this.attendanceService
      .getAllAttendanceByDateRange(startDate, endDate)
      .subscribe({
        next: (response) => {
          this.handleAttendanceDataResponse(response);
        },
        error: (error) => {
          console.error('Error fetching all attendance history:', error);
          this.showMessage('Error loading attendance history.', 'error');
          this.isLoading = false;
        },
      });
  }

  /**
   * Handle attendance data response
   */
  handleAttendanceDataResponse(response: any): void {
    if (response.status === 'success' && response.data) {
      // Sort data by date ascending, then by student name
      const sortedData = response.data.sort(
        (a: AttendanceRecord, b: AttendanceRecord) => {
          const dateCompare =
            new Date(a.date).getTime() - new Date(b.date).getTime();
          if (dateCompare === 0) {
            return a.student_name.localeCompare(b.student_name);
          }
          return dateCompare;
        }
      );

      this.allData = sortedData;
      this.filteredData = [...sortedData];
      this.dataSource.data = this.filteredData;
      this.totalRecords = sortedData.length;

      if (sortedData.length > 0) {
        this.showMessage(
          `Loaded ${sortedData.length} attendance records.`,
          'success'
        );
      } else {
        this.showMessage(
          'No attendance records found for the selected date range.',
          'info'
        );
      }
    } else {
      this.showMessage('No attendance data found.', 'info');
      this.dataSource.data = [];
      this.filteredData = [];
      this.allData = [];
      this.totalRecords = 0;
    }
    this.isLoading = false;
  }

  /**
   * Search functionality
   */
  onSearch(): void {
    if (!this.searchValue.trim()) {
      this.filteredData = [...this.allData];
    } else {
      const searchTerm = this.searchValue.toLowerCase();
      this.filteredData = this.allData.filter(
        (record) =>
          record.student_name.toLowerCase().includes(searchTerm) ||
          record.student_id.toLowerCase().includes(searchTerm) ||
          record.class_id.toLowerCase().includes(searchTerm) ||
          record.date.includes(searchTerm) ||
          record.marked_by.toLowerCase().includes(searchTerm)
      );
    }

    this.dataSource.data = this.filteredData;
  }

  /**
   * Get total records count
   */
  getTotalRecords(): number {
    return this.filteredData.length;
  }

  /**
   * Get present count
   */
  getPresentCount(): number {
    return this.filteredData.filter(
      (record) => record.present == 1 || record.present === true
    ).length;
  }

  /**
   * Get absent count
   */
  getAbsentCount(): number {
    return this.filteredData.filter(
      (record) => record.present == 0 || record.present === false
    ).length;
  }

  /**
   * Get attendance percentage
   */
  getAttendancePercentage(): number {
    if (this.filteredData.length === 0) return 0;
    return (this.getPresentCount() / this.filteredData.length) * 100;
  }

  /**
   * Get unique students count
   */
  getUniqueStudentsCount(): number {
    const uniqueStudents = new Set(
      this.filteredData.map((record) => record.student_id)
    );
    return uniqueStudents.size;
  }

  /**
   * Get date range text for display
   */
  getDateRangeText(): string {
    if (!this.startDate || !this.endDate) return 'Not set';

    const options: Intl.DateTimeFormatOptions = {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    };

    const start = this.startDate.toLocaleDateString('en-US', options);
    const end = this.endDate.toLocaleDateString('en-US', options);

    return `${start} - ${end}`;
  }

  /**
   * Format date for API (YYYY-MM-DD)
   */
  private formatDateForAPI(date: Date): string {
    // Fix timezone issue by using local date components
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  /**
   * Get current time for display
   */
  getCurrentTime(): string {
    return new Date().toLocaleTimeString();
  }

  /**
   * Get current date for display
   */
  getCurrentDate(): string {
    const today = new Date();
    const options: Intl.DateTimeFormatOptions = {
      weekday: 'long',
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    };
    return today.toLocaleDateString('en-US', options);
  }

  /**
   * Show message using snackbar
   */
  private showMessage(
    message: string,
    type: 'success' | 'error' | 'info' = 'info'
  ): void {
    this.snackBar.open(message, 'Close', {
      duration: 5000,
      panelClass: [`snackbar-${type}`],
    });
  }
}
