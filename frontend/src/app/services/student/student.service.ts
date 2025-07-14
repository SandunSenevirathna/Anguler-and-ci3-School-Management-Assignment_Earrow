import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { BASE_URL } from '../../env/env';
// Interface for the backend API response
export interface ApiResponse<T> {
  status: string;
  message: string;
  data: T;
  count?: number;
}

// UPDATED Student interface matching your NEW database structure
export interface Student {
  student_id: number;
  student_name: string;
  birth_date: string; // Format: 'YYYY-MM-DD'
  gender: 'male' | 'female';
  class_id: number;
}

@Injectable({
  providedIn: 'root',
})
export class StudentService {
  // Your backend API base URL
  private BACKEND_API_URL = BASE_URL;

  // HTTP headers for requests
  private httpOptions = {
    headers: new HttpHeaders({
      'Content-Type': 'application/json',
      Accept: 'application/json',
    }),
  };

  constructor(private http: HttpClient) {}

  /**
   * Get all students from the backend
   */
  getAllStudents(): Observable<Student[]> {
    const url = `${this.BACKEND_API_URL}/student/get_all`;

    return this.http.get<ApiResponse<Student[]>>(url, this.httpOptions).pipe(
      map((response) => {
        if (response.status === 'success') {
          console.log('Students fetched successfully:', response.data);
          return response.data;
        } else {
          throw new Error(response.message || 'Failed to fetch students');
        }
      }),
      catchError(this.handleError)
    );
  }

  /**
   * Get a single student by ID
   */
  getStudentById(id: number): Observable<Student> {
    const url = `${this.BACKEND_API_URL}/student/get_by_id/${id}`;

    return this.http.get<ApiResponse<Student>>(url, this.httpOptions).pipe(
      map((response) => {
        if (response.status === 'success') {
          return response.data;
        } else {
          throw new Error(response.message || 'Student not found');
        }
      }),
      catchError(this.handleError)
    );
  }

  /**
   * Create a new student
   */
  createStudent(studentData: Partial<Student>): Observable<any> {
    const url = `${this.BACKEND_API_URL}/student/create`;

    const backendData = {
      student_name: studentData.student_name,
      birth_date: studentData.birth_date,
      gender: studentData.gender,
      class_id: studentData.class_id,
    };

    console.log('Creating student with data:', backendData);

    return this.http
      .post<ApiResponse<any>>(url, backendData, this.httpOptions)
      .pipe(
        map((response) => {
          if (response.status === 'success') {
            return response.data;
          } else {
            throw new Error(response.message || 'Failed to create student');
          }
        }),
        catchError(this.handleError)
      );
  }

  /**
   * Update an existing student
   */
  updateStudent(id: number, studentData: Partial<Student>): Observable<any> {
    const url = `${this.BACKEND_API_URL}/student/update/${id}`;

    const backendData = {
      student_name: studentData.student_name,
      birth_date: studentData.birth_date,
      gender: studentData.gender,
      class_id: studentData.class_id,
    };

    return this.http
      .put<ApiResponse<any>>(url, backendData, this.httpOptions)
      .pipe(
        map((response) => {
          if (response.status === 'success') {
            return response.data;
          } else {
            throw new Error(response.message || 'Failed to update student');
          }
        }),
        catchError(this.handleError)
      );
  }

  /**
   * Delete a student
   */
  deleteStudent(id: number): Observable<any> {
    const url = `${this.BACKEND_API_URL}/student/delete/${id}`;

    return this.http.delete<ApiResponse<any>>(url, this.httpOptions).pipe(
      map((response) => {
        if (response.status === 'success') {
          return response.data;
        } else {
          throw new Error(response.message || 'Failed to delete student');
        }
      }),
      catchError(this.handleError)
    );
  }

  /**
   * Calculate age from birth date
   */
  calculateAge(birthDate: string): number {
    if (!birthDate) return 0;

    const birth = new Date(birthDate);
    const today = new Date();
    let age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();

    if (
      monthDiff < 0 ||
      (monthDiff === 0 && today.getDate() < birth.getDate())
    ) {
      age--;
    }

    return age;
  }

  /**
   * Handle HTTP errors
   */
  private handleError(error: any): Observable<never> {
    let errorMessage = 'An unknown error occurred';

    if (error.error instanceof ErrorEvent) {
      errorMessage = `Error: ${error.error.message}`;
    } else {
      errorMessage = `Error Code: ${error.status}\nMessage: ${error.message}`;

      if (error.status === 0) {
        errorMessage =
          'Unable to connect to the server. Please check if the backend is running.';
      } else if (error.status === 404) {
        errorMessage = 'API endpoint not found. Please check the backend URL.';
      } else if (error.status === 500) {
        errorMessage = 'Internal server error. Please check the backend logs.';
      }
    }

    console.error('StudentService Error:', errorMessage);
    return throwError(() => new Error(errorMessage));
  }
}
