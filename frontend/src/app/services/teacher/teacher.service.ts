import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';

// Interface for the backend API response
export interface ApiResponse<T> {
  status: string;
  message: string;
  data: T;
  count?: number;
}

// Teacher interface matching your database structure
export interface Teacher {
  teacher_id: number;
  teacher_name: string;
  class_name: string;
  gender: 'Male' | 'Female';
  created_date?: string;
  created_time?: string;
}

@Injectable({
  providedIn: 'root',
})
export class TeacherService {
  // Your backend API base URL
  private BACKEND_API_URL =
    'http://localhost/earrow/assessment/students-crud/backend';

  // HTTP headers for requests
  private httpOptions = {
    headers: new HttpHeaders({
      'Content-Type': 'application/json',
      Accept: 'application/json',
    }),
  };

  constructor(private http: HttpClient) {}

  /**
   * Get all teachers from the backend
   */
  getAllTeachers(): Observable<Teacher[]> {
    const url = `${this.BACKEND_API_URL}/teacher/get_all`;
    console.log('Fetching all teachers from:', url);

    return this.http
      .get<ApiResponse<Teacher[]>>(url, {
        ...this.httpOptions,
        responseType: 'json', // explicitly tell Angular to expect JSON
      })
      .pipe(
        map((response) => {
          if (response && response.status === 'success') {
            console.log('Fetched teachers data from backend:', response.data);
            return response.data;
          } else {
            throw new Error(response?.message || 'Failed to fetch teachers');
          }
        }),
        catchError((error) => {
          console.error('Error while fetching teachers:', error);
          return throwError(
            () => new Error('Error parsing teacher data: ' + error.message)
          );
        })
      );
  }

  /**
   * Get a single teacher by ID
   */
  getTeacherById(id: number): Observable<Teacher> {
    const url = `${this.BACKEND_API_URL}/teacher/get_by_id/${id}`;

    return this.http.get<ApiResponse<Teacher>>(url, this.httpOptions).pipe(
      map((response) => {
        if (response.status === 'success') {
          return response.data;
        } else {
          throw new Error(response.message || 'Teacher not found');
        }
      }),
      catchError(this.handleError)
    );
  }

  /**
   * Create a new teacher
   */
  createTeacher(teacherData: Partial<Teacher>): Observable<any> {
    const url = `${this.BACKEND_API_URL}/teacher/create`;

    const backendData = {
      teacher_name: teacherData.teacher_name,
      class_name: teacherData.class_name,
      gender: teacherData.gender,
    };

    console.log('Creating teacher with data:', backendData);

    return this.http
      .post<ApiResponse<any>>(url, backendData, this.httpOptions)
      .pipe(
        map((response) => {
          if (response.status === 'success') {
            return response.data;
          } else {
            throw new Error(response.message || 'Failed to create teacher');
          }
        }),
        catchError(this.handleError)
      );
  }

  /**
   * Update an existing teacher
   */
  updateTeacher(id: number, teacherData: Partial<Teacher>): Observable<any> {
    const url = `${this.BACKEND_API_URL}/teacher/update/${id}`;

    const backendData = {
      teacher_name: teacherData.teacher_name,
      class_name: teacherData.class_name,
      gender: teacherData.gender,
    };

    return this.http
      .put<ApiResponse<any>>(url, backendData, this.httpOptions)
      .pipe(
        map((response) => {
          if (response.status === 'success') {
            return response.data;
          } else {
            throw new Error(response.message || 'Failed to update teacher');
          }
        }),
        catchError(this.handleError)
      );
  }

  /**
   * Delete a teacher
   */
  deleteTeacher(id: number): Observable<any> {
    const url = `${this.BACKEND_API_URL}/teacher/delete/${id}`;

    return this.http.delete<ApiResponse<any>>(url, this.httpOptions).pipe(
      map((response) => {
        if (response.status === 'success') {
          return response.data;
        } else {
          throw new Error(response.message || 'Failed to delete teacher');
        }
      }),
      catchError(this.handleError)
    );
  }

  /**
   * Get teachers by class name
   */
  getTeachersByClass(className: string): Observable<Teacher[]> {
    const url = `${this.BACKEND_API_URL}/teacher/get_by_class/${className}`;

    return this.http.get<ApiResponse<Teacher[]>>(url, this.httpOptions).pipe(
      map((response) => {
        if (response.status === 'success') {
          return response.data;
        } else {
          throw new Error(
            response.message || 'Failed to fetch teachers by class'
          );
        }
      }),
      catchError(this.handleError)
    );
  }

  /**
   * Format date for display
   */
  formatCreatedDate(createdDate: string): string {
    if (!createdDate) return 'N/A';

    const date = new Date(createdDate);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  }

  /**
   * Format gender for display
   */
  formatGender(gender: string): string {
    if (!gender) return 'N/A';
    return gender.charAt(0).toUpperCase() + gender.slice(1).toLowerCase();
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

    console.error('TeacherService Error:', errorMessage);
    return throwError(() => new Error(errorMessage));
  }
}
