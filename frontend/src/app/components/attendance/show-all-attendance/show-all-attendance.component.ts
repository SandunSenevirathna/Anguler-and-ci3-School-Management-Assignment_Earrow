import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { SelectionModel } from '@angular/cdk/collections';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBarModule, MatSnackBar } from '@angular/material/snack-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { AttendanceService } from '../../../services/attendance/attendance.service';

export interface Student {
  student_id: string;
  student_name: string;
  birth_date: string;
  gender: string;
  class_id: string;
}

export interface Teacher {
  teacher_id: string;
  teacher_name: string;
  class_name: string;
  gender: string;
  created_date: string;
  created_time: string;
}

@Component({
  selector: 'app-show-all-attendance',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    HttpClientModule,
    MatTableModule,
    MatPaginatorModule,
    MatCheckboxModule,
    MatInputModule,
    MatFormFieldModule,
    MatButtonModule,
    MatIconModule,
    MatSnackBarModule,
    MatProgressSpinnerModule,
  ],
  templateUrl: './show-all-attendance.component.html',
  styleUrls: ['./show-all-attendance.component.scss'],
})
export class ShowAllAttendanceComponent implements OnInit {
  displayedColumns: string[] = [
    'select',
    'student_name',
    'student_id',
    'gender',
    'birth_date',
    'class_id',
  ];

  dataSource = new MatTableDataSource<Student>();
  selection = new SelectionModel<Student>(true, []);
  searchValue: string = '';
  totalRecords: number = 0;

  // User and class information
  currentUser: any = null;
  userRole: string = '';
  username: string = '';
  teacherClass: string = '';

  // Loading states
  isLoading: boolean = false;
  isAttendanceActive: boolean = true;
  isRefreshEnabled: boolean = false;

  // Attendance status
  attendanceAlreadyTaken: boolean = false;
  attendanceMessage: string = '';

  constructor(
    private attendanceService: AttendanceService,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.initializeComponent();
  }

  /**
   * Initialize component by getting user data and loading attendance
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

    // Load attendance data based on user role
    this.loadAttendanceData();
  }

  /**
   * Load attendance data based on user role
   */
  loadAttendanceData(): void {
    this.isLoading = true;

    if (this.userRole.toLowerCase() === 'teacher') {
      this.loadTeacherAttendance();
    } else if (this.userRole.toLowerCase() === 'admin') {
      this.loadAllStudentsAttendance();
    } else {
      this.showMessage('Unauthorized access. Invalid user role.', 'error');
      this.isLoading = false;
    }
  }

  /**
   * Load attendance for teacher - get their class using teacher name (username)
   */
  loadTeacherAttendance(): void {
    const teacherName = this.username; // username is same as teacher_name

    this.attendanceService.getTeacherByName(teacherName).subscribe({
      next: (response) => {
        if (response.status === 'success' && response.data) {
          this.teacherClass = response.data.class_name;
          console.log(
            `Teacher ${teacherName} teaches class: ${this.teacherClass}`
          );
          this.loadStudentsByClass(response.data.class_name);
        } else {
          this.showMessage(
            'Teacher data not found. Please check if your username matches teacher name in database.',
            'error'
          );
          this.isLoading = false;
        }
      },
      error: (error) => {
        console.error('Error fetching teacher data:', error);
        this.showMessage(
          'Error loading teacher information. Please verify your username.',
          'error'
        );
        this.isLoading = false;
      },
    });
  }

  /**
   * Load students by class name and check if attendance already taken
   */
  loadStudentsByClass(className: string): void {
    this.attendanceService.getStudentsByClassName(className).subscribe({
      next: (response) => {
        if (response.status === 'success' && response.data) {
          this.dataSource.data = response.data;
          this.totalRecords = response.data.length;
          this.showMessage(
            `Loaded ${response.data.length} students for attendance.`,
            'success'
          );

          // Check if attendance already taken for today
          this.checkTodayAttendance();
        } else {
          this.showMessage('No students found in this class.', 'error');
          this.isLoading = false;
        }
      },
      error: (error) => {
        console.error('Error fetching students by class:', error);
        this.showMessage('Error loading students for this class.', 'error');
        this.isLoading = false;
      },
    });
  }

  /**
   * Load all students attendance (for admin)
   */
  loadAllStudentsAttendance(): void {
    this.attendanceService.getAllStudents().subscribe({
      next: (response) => {
        if (response.status === 'success' && response.data) {
          this.dataSource.data = response.data;
          this.totalRecords = response.data.length;
          this.showMessage(
            `Loaded ${response.data.length} students for attendance.`,
            'success'
          );

          // Check if attendance already taken for today
          this.checkTodayAttendance();
        } else {
          this.showMessage('No students found.', 'error');
          this.isLoading = false;
        }
      },
      error: (error) => {
        console.error('Error fetching students:', error);
        this.showMessage('Error loading students.', 'error');
        this.isLoading = false;
      },
    });
  }

  /**
   * Check if attendance is already taken for today
   */
  checkTodayAttendance(): void {
    const today = new Date().toISOString().split('T')[0];

    this.attendanceService
      .checkAttendanceExists(this.username, today)
      .subscribe({
        next: (response) => {
          if (
            response.status === 'success' &&
            response.data &&
            response.data.exists
          ) {
            this.attendanceAlreadyTaken = true;
            this.isAttendanceActive = false;
            this.isRefreshEnabled = true;
            this.attendanceMessage = `Attendance already taken for today (${today}). Click "DELETE & RETAKE" to take attendance again.`;
            this.showMessage(this.attendanceMessage, 'info');
          } else {
            this.attendanceAlreadyTaken = false;
            this.isAttendanceActive = true;
            this.isRefreshEnabled = false;
            this.attendanceMessage = '';
          }
          this.isLoading = false;
        },
        error: (error) => {
          console.error('Error checking attendance:', error);
          this.isLoading = false;
          // If error, assume no attendance exists and proceed normally
          this.attendanceAlreadyTaken = false;
          this.isAttendanceActive = true;
          this.isRefreshEnabled = false;
        },
      });
  }

  /** Whether the number of selected elements matches the total number of rows. */
  isAllSelected(): boolean {
    const numSelected = this.selection.selected.length;
    const numRows = this.dataSource.data.length;
    return numSelected === numRows;
  }

  /** Selects all rows if they are not all selected; otherwise clear selection. */
  masterToggle(): void {
    if (this.isAllSelected()) {
      this.selection.clear();
      return;
    }
    this.selection.select(...this.dataSource.data);
  }

  /** The label for the checkbox on the passed row */
  checkboxLabel(row?: Student): string {
    if (!row) {
      return `${this.isAllSelected() ? 'deselect' : 'select'} all`;
    }
    return `${this.selection.isSelected(row) ? 'deselect' : 'select'} row ${
      row.student_name
    }`;
  }

  /**
   * Search functionality
   */
  onSearch(): void {
    if (this.searchValue.trim()) {
      const filteredData = this.dataSource.data.filter(
        (student) =>
          student.student_name
            .toLowerCase()
            .includes(this.searchValue.toLowerCase()) ||
          student.student_id.includes(this.searchValue) ||
          student.class_id.includes(this.searchValue)
      );
      this.dataSource.data = filteredData;
    } else {
      this.loadAttendanceData(); // Reload all data
    }
  }

  /**
   * Stop attendance session and save data
   * Selected students = Present, Non-selected = Absent
   */
  onStopAttendance(): void {
    this.isAttendanceActive = false;

    const selectedStudents = this.selection.selected;
    const presentCount = selectedStudents.length;
    const totalCount = this.dataSource.data.length;

    this.showMessage(
      `Attendance stopped. Present: ${presentCount}/${totalCount}`,
      'success'
    );

    // Save the attendance data
    this.saveAttendanceData();
  }

  /**
   * Delete today's attendance and allow retaking
   */
  onDeleteAndRetake(): void {
    const today = new Date().toISOString().split('T')[0];

    this.isLoading = true;
    this.showMessage('Deleting previous attendance data...', 'info');

    this.attendanceService.deleteAttendance(this.username, today).subscribe({
      next: (response) => {
        if (response.status === 'success') {
          this.showMessage(
            'Previous attendance deleted successfully. You can now take attendance again.',
            'success'
          );

          // Reset states to allow new attendance
          this.attendanceAlreadyTaken = false;
          this.isAttendanceActive = true;
          this.isRefreshEnabled = false;
          this.attendanceMessage = '';
          this.selection.clear();

          this.isLoading = false;
        } else {
          this.showMessage('Failed to delete previous attendance.', 'error');
          this.isLoading = false;
        }
      },
      error: (error) => {
        console.error('Error deleting attendance:', error);
        this.showMessage('Error deleting previous attendance.', 'error');
        this.isLoading = false;
      },
    });
  }

  /**
   * Emergency update functionality - refresh data
   */
  onEmergencyUpdate(): void {
    this.showMessage('Refreshing data...', 'info');
    this.selection.clear(); // Clear selections
    this.loadAttendanceData();
  }

  /**
   * Save attendance data to backend
   * Selected students = Present, Others = Absent
   */
  saveAttendanceData(): void {
    const selectedStudentIds = this.selection.selected.map((s) => s.student_id);
    const currentTime = new Date().toTimeString().slice(0, 8);
    const currentDate = new Date().toISOString().split('T')[0];

    const attendanceData = this.dataSource.data.map((student) => ({
      student_id: student.student_id,
      present: selectedStudentIds.includes(student.student_id), // Present if selected
      attendance_time: selectedStudentIds.includes(student.student_id)
        ? currentTime
        : currentTime,
      date: currentDate,
      marked_by: this.username,
    }));

    console.log('Saving attendance data:', attendanceData);

    this.attendanceService.saveAttendance(attendanceData).subscribe({
      next: (response) => {
        if (response.status === 'success') {
          this.showMessage('Attendance saved successfully!', 'success');
          this.selection.clear(); // Clear selections after saving

          // Update states after successful save
          this.attendanceAlreadyTaken = true;
          this.isRefreshEnabled = true;
          this.attendanceMessage = `Attendance saved for today (${currentDate}). Click "DELETE & RETAKE" if you need to change it.`;
        } else {
          this.showMessage('Failed to save attendance data.', 'error');
          this.isAttendanceActive = true; // Re-enable if save failed
        }
      },
      error: (error) => {
        console.error('Error saving attendance:', error);
        this.showMessage('Error saving attendance data.', 'error');
        this.isAttendanceActive = true; // Re-enable if save failed
      },
    });
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
   * Get present students count (selected students)
   */
  getPresentCount(): number {
    return this.selection.selected.length;
  }

  /**
   * Get absent students count (non-selected students)
   */
  getAbsentCount(): number {
    return this.dataSource.data.length - this.selection.selected.length;
  }

  /**
   * Get attendance percentage based on selections
   */
  getAttendancePercentage(): number {
    if (this.dataSource.data.length === 0) return 0;
    return (this.selection.selected.length / this.dataSource.data.length) * 100;
  }
}
