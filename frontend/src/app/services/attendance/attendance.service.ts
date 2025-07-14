import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { BASE_URL } from '../../env/env';

export interface Teacher {
  teacher_id: string;
  teacher_name: string;
  class_name: string;
  gender: string;
  created_date: string;
  created_time: string;
}

export interface Student {
  student_id: string;
  student_name: string;
  birth_date: string;
  gender: string;
  class_id: string;
}

export interface AttendanceRecord {
  id?: number;
  student_id: string;
  student_name: string;
  class_id: string;
  date: string;
  present: boolean;
  attendance_time: string | null;
  marked_by: string;
  created_at?: string;
  updated_at?: string;
}

export interface ApiResponse<T> {
  status: string;
  message: string;
  data: T;
  count?: number;
}

@Injectable({
  providedIn: 'root',
})
export class AttendanceService {
  private baseUrl = BASE_URL; // Update this to your backend URL

  private httpOptions = {
    headers: new HttpHeaders({
      'Content-Type': 'application/json',
    }),
  };

  constructor(private http: HttpClient) {}

  /**
   * Get teacher by name (username) to retrieve class information
   */
  getTeacherByName(teacherName: string): Observable<ApiResponse<Teacher>> {
    return this.http.get<ApiResponse<Teacher>>(
      `${this.baseUrl}/teacher/get_by_name/${teacherName}`,
      this.httpOptions
    );
  }

  /**
   * Get students by class name (for teachers)
   */
  getStudentsByClassName(
    className: string
  ): Observable<ApiResponse<Student[]>> {
    return this.http.get<ApiResponse<Student[]>>(
      `${this.baseUrl}/student/get_by_class_name/${className}`,
      this.httpOptions
    );
  }

  /**
   * Get all students (for admin role)
   */
  getAllStudents(): Observable<ApiResponse<Student[]>> {
    return this.http.get<ApiResponse<Student[]>>(
      `${this.baseUrl}/student/get_all`,
      this.httpOptions
    );
  }

  /**
   * Save attendance data
   */
  saveAttendance(attendanceData: any[]): Observable<ApiResponse<any>> {
    return this.http.post<ApiResponse<any>>(
      `${this.baseUrl}/attendance/save`,
      attendanceData,
      this.httpOptions
    );
  }

  /**
   * Check if attendance exists for a specific teacher and date
   */
  checkAttendanceExists(
    teacherName: string,
    date: string
  ): Observable<ApiResponse<any>> {
    return this.http.get<ApiResponse<any>>(
      `${this.baseUrl}/attendance/check_exists/${teacherName}/${date}`,
      this.httpOptions
    );
  }

  /**
   * Delete attendance for a specific teacher and date
   */
  deleteAttendance(
    teacherName: string,
    date: string
  ): Observable<ApiResponse<any>> {
    return this.http.delete<ApiResponse<any>>(
      `${this.baseUrl}/attendance/delete_by_teacher_date/${teacherName}/${date}`,
      this.httpOptions
    );
  }

  /**
   * Get attendance by teacher and date
   */
  getAttendanceByTeacherAndDate(
    teacherName: string,
    date: string
  ): Observable<ApiResponse<AttendanceRecord[]>> {
    return this.http.get<ApiResponse<AttendanceRecord[]>>(
      `${this.baseUrl}/attendance/get_by_teacher_date/${teacherName}/${date}`,
      this.httpOptions
    );
  }

  /**
   * Get attendance history for a teacher (all dates)
   */
  getAttendanceHistory(
    teacherName: string
  ): Observable<ApiResponse<AttendanceRecord[]>> {
    return this.http.get<ApiResponse<AttendanceRecord[]>>(
      `${this.baseUrl}/attendance/get_history/${teacherName}`,
      this.httpOptions
    );
  }

  /**
   * Get attendance history by date range for a teacher
   */
  getAttendanceByDateRange(
    teacherName: string,
    startDate: string,
    endDate: string
  ): Observable<ApiResponse<AttendanceRecord[]>> {
    // Convert string to Date objects
    const start = new Date(startDate);
    const end = new Date(endDate);

    // Add 1 day
    start.setDate(start.getDate() + 1);
    end.setDate(end.getDate() + 1);

    // Format back to 'YYYY-MM-DD'
    const formattedStart = start.toLocaleDateString('en-CA');
    const formattedEnd = end.toLocaleDateString('en-CA');

    console.log(
      `Fetching attendance for ${teacherName} from ${formattedStart} to ${formattedEnd}`
    );

    return this.http.get<ApiResponse<AttendanceRecord[]>>(
      `${this.baseUrl}/attendance/get_by_date_range/${teacherName}/${formattedStart}/${formattedEnd}`,
      this.httpOptions
    );
  }

  /**
   * Get all attendance by date range (for admin - all teachers)
   */
  getAllAttendanceByDateRange(
    startDate: string,
    endDate: string
  ): Observable<ApiResponse<AttendanceRecord[]>> {
    return this.http.get<ApiResponse<AttendanceRecord[]>>(
      `${this.baseUrl}/attendance/get_all_by_date_range/${startDate}/${endDate}`,
      this.httpOptions
    );
  }

  /**
   * Get attendance statistics for a teacher and date range
   */
  getAttendanceStats(
    teacherName: string,
    startDate: string,
    endDate: string
  ): Observable<ApiResponse<any[]>> {
    return this.http.get<ApiResponse<any[]>>(
      `${this.baseUrl}/attendance/get_stats/${teacherName}/${startDate}/${endDate}`,
      this.httpOptions
    );
  }

  /**
   * Get attendance by specific date (for all classes or specific class)
   */
  getAttendanceByDate(
    date: string,
    className?: string
  ): Observable<ApiResponse<AttendanceRecord[]>> {
    const url = className
      ? `${this.baseUrl}/attendance/get_by_date/${date}/${className}`
      : `${this.baseUrl}/attendance/get_by_date/${date}`;

    return this.http.get<ApiResponse<AttendanceRecord[]>>(
      url,
      this.httpOptions
    );
  }

  /**
   * Get student attendance history for a specific student
   */
  getStudentAttendanceHistory(
    studentId: string,
    startDate?: string,
    endDate?: string
  ): Observable<ApiResponse<AttendanceRecord[]>> {
    let url = `${this.baseUrl}/attendance/get_student_history/${studentId}`;

    if (startDate && endDate) {
      url += `/${startDate}/${endDate}`;
    }

    return this.http.get<ApiResponse<AttendanceRecord[]>>(
      url,
      this.httpOptions
    );
  }

  /**
   * Get attendance summary statistics for admin dashboard
   */
  getAttendanceSummary(
    startDate: string,
    endDate: string
  ): Observable<ApiResponse<any>> {
    return this.http.get<ApiResponse<any>>(
      `${this.baseUrl}/attendance/get_summary/${startDate}/${endDate}`,
      this.httpOptions
    );
  }

  /**
   * Get current user from localStorage
   */
  getCurrentUser(): any {
    const userString = localStorage.getItem('currentUser');
    if (userString) {
      try {
        return JSON.parse(userString);
      } catch (error) {
        console.error('Error parsing user data from localStorage:', error);
        return null;
      }
    }
    return null;
  }

  /**
   * Check if user is logged in
   */
  isLoggedIn(): boolean {
    return this.getCurrentUser() !== null;
  }

  /**
   * Get user role
   */
  getUserRole(): string | null {
    const user = this.getCurrentUser();
    return user ? user.role : null;
  }

  /**
   * Get username (same as teacher_name for teachers)
   */
  getUsername(): string | null {
    const user = this.getCurrentUser();
    return user ? user.username : null;
  }

  /**
   * Clear user session
   */
  logout(): void {
    localStorage.removeItem('currentUser');
  }
}
