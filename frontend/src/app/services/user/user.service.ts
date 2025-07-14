import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, map, tap } from 'rxjs/operators';
import { BASE_URL } from '../../env/env';

// Interface for the backend API response
export interface ApiResponse<T> {
  status: string;
  message: string;
  data: T;
  count?: number;
}

// User interface matching your database structure
export interface User {
  user_id: number;
  username: string;
  role: 'Admin' | 'Teacher' | 'Student';
}

// Interface for creating new users
export interface CreateUserData {
  username: string;
  password: string;
  role: 'Admin' | 'Teacher' | 'Student';
}

// Interface for updating existing users
export interface UpdateUserData {
  username?: string;
  password?: string;
  role?: 'Admin' | 'Teacher' | 'Student';
}

// Interface for login
export interface LoginData {
  username: string;
  password: string;
}

// Interface for password change
export interface PasswordChangeData {
  current_password: string;
  new_password: string;
}

@Injectable({
  providedIn: 'root',
})
export class UserService {
  // Your backend API base URL - UPDATE THIS TO MATCH YOUR BACKEND
  private BACKEND_API_URL = BASE_URL;

  // HTTP headers for requests
  private httpOptions = {
    headers: new HttpHeaders({
      'Content-Type': 'application/json',
      Accept: 'application/json',
    }),
  };

  constructor(private http: HttpClient) {
    console.log(
      '🔧 UserService initialized with backend URL:',
      this.BACKEND_API_URL
    );
  }

  /**
   * User login authentication - MAIN LOGIN METHOD
   */
  login(loginData: LoginData): Observable<User> {
    const url = `${this.BACKEND_API_URL}/user/login`;

    console.log('🚀 Making login request to:', url);
    console.log('📝 Login data:', { username: loginData.username }); // Don't log password

    return this.http
      .post<ApiResponse<User>>(url, loginData, this.httpOptions)
      .pipe(
        tap((response) => {
          console.log('📡 Raw API response:', response);
        }),
        map((response) => {
          console.log('🔍 Processing response:', response);

          if (response.status === 'success') {
            console.log('✅ Login successful:', response.data);
            return response.data;
          } else {
            console.error(
              '❌ Login failed - API returned error:',
              response.message
            );
            throw new Error(response.message || 'Login failed');
          }
        }),
        catchError((error) => {
          console.error('💥 HTTP Error caught in login:', error);
          return this.handleError(error);
        })
      );
  }

  /**
   * Test backend connectivity
   */
  testConnection(): Observable<any> {
    const url = `${this.BACKEND_API_URL}/user/get_all`;
    console.log('🧪 Testing connection to:', url);

    return this.http.get<ApiResponse<User[]>>(url, this.httpOptions).pipe(
      tap((response) => {
        console.log('✅ Connection test successful:', response);
      }),
      map((response) => {
        return {
          success: true,
          message: 'Backend connection successful',
          data: response,
        };
      }),
      catchError((error) => {
        console.error('❌ Connection test failed:', error);
        return this.handleError(error);
      })
    );
  }

  /**
   * Get all users from the backend
   */
  getAllUsers(): Observable<User[]> {
    const url = `${this.BACKEND_API_URL}/user/get_all`;

    return this.http.get<ApiResponse<User[]>>(url, this.httpOptions).pipe(
      map((response) => {
        if (response.status === 'success') {
          console.log('Users fetched successfully:', response.data);
          return response.data;
        } else {
          throw new Error(response.message || 'Failed to fetch users');
        }
      }),
      catchError(this.handleError)
    );
  }

  /**
   * Get a single user by ID
   */
  getUserById(id: number): Observable<User> {
    const url = `${this.BACKEND_API_URL}/user/get_by_id/${id}`;

    return this.http.get<ApiResponse<User>>(url, this.httpOptions).pipe(
      map((response) => {
        if (response.status === 'success') {
          return response.data;
        } else {
          throw new Error(response.message || 'User not found');
        }
      }),
      catchError(this.handleError)
    );
  }

  /**
   * Create a new user
   */
  createUser(userData: CreateUserData): Observable<any> {
    const url = `${this.BACKEND_API_URL}/user/create`;

    console.log('Creating user with data:', userData);

    return this.http
      .post<ApiResponse<any>>(url, userData, this.httpOptions)
      .pipe(
        map((response) => {
          if (response.status === 'success') {
            return response.data;
          } else {
            throw new Error(response.message || 'Failed to create user');
          }
        }),
        catchError(this.handleError)
      );
  }

  /**
   * Update an existing user
   */
  updateUser(id: number, userData: UpdateUserData): Observable<any> {
    const url = `${this.BACKEND_API_URL}/user/update/${id}`;

    console.log('Updating user with data:', userData);

    return this.http
      .put<ApiResponse<any>>(url, userData, this.httpOptions)
      .pipe(
        map((response) => {
          if (response.status === 'success') {
            return response.data;
          } else {
            throw new Error(response.message || 'Failed to update user');
          }
        }),
        catchError(this.handleError)
      );
  }

  /**
   * Delete a user
   */
  deleteUser(id: number): Observable<any> {
    const url = `${this.BACKEND_API_URL}/user/delete/${id}`;

    return this.http.delete<ApiResponse<any>>(url, this.httpOptions).pipe(
      map((response) => {
        if (response.status === 'success') {
          return response.data;
        } else {
          throw new Error(response.message || 'Failed to delete user');
        }
      }),
      catchError(this.handleError)
    );
  }

  /**
   * Get users by role
   */
  getUsersByRole(role: string): Observable<User[]> {
    const url = `${this.BACKEND_API_URL}/user/get_by_role/${role}`;

    return this.http.get<ApiResponse<User[]>>(url, this.httpOptions).pipe(
      map((response) => {
        if (response.status === 'success') {
          return response.data;
        } else {
          throw new Error(response.message || 'Failed to fetch users by role');
        }
      }),
      catchError(this.handleError)
    );
  }

  /**
   * Change user password
   */
  changePassword(
    userId: number,
    passwordData: PasswordChangeData
  ): Observable<any> {
    const url = `${this.BACKEND_API_URL}/user/change_password/${userId}`;

    return this.http
      .put<ApiResponse<any>>(url, passwordData, this.httpOptions)
      .pipe(
        map((response) => {
          if (response.status === 'success') {
            return response.data;
          } else {
            throw new Error(response.message || 'Failed to change password');
          }
        }),
        catchError(this.handleError)
      );
  }

  /**
   * Validate username format
   */
  validateUsername(username: string): boolean {
    if (!username || username.length < 3 || username.length > 50) {
      return false;
    }
    // Check format (letters, numbers, and underscores only)
    const usernamePattern = /^[a-zA-Z0-9_]+$/;
    return usernamePattern.test(username);
  }

  /**
   * Validate password strength
   */
  validatePassword(password: string): boolean {
    if (!password || password.length < 8) {
      return false;
    }
    // At least one uppercase, one lowercase, and one number
    const hasUppercase = /[A-Z]/.test(password);
    const hasLowercase = /[a-z]/.test(password);
    const hasNumber = /[0-9]/.test(password);

    return hasUppercase && hasLowercase && hasNumber;
  }

  /**
   * Validate role
   */
  validateRole(role: string): boolean {
    const allowedRoles = ['Admin', 'Teacher', 'Student'];
    return allowedRoles.includes(role);
  }

  /**
   * Handle HTTP errors with enhanced debugging
   */
  private handleError(error: any): Observable<never> {
    let errorMessage = 'An unknown error occurred';

    console.error('🔍 Full error object:', error);

    if (error.error instanceof ErrorEvent) {
      // Client-side error
      errorMessage = `Client Error: ${error.error.message}`;
      console.error('🖥️ Client-side error detected');
    } else {
      // Server-side error
      console.error('🔌 Server-side error detected');

      if (error.error && error.error.message) {
        errorMessage = error.error.message;
      } else if (error.message) {
        errorMessage = error.message;
      } else {
        errorMessage = `Error Code: ${error.status}\nMessage: ${error.message}`;
      }

      // Handle specific HTTP error codes
      if (error.status === 0) {
        errorMessage =
          'Unable to connect to the server. Please check if the backend is running and CORS is properly configured.';
        console.error('🚫 Status 0: Network error or CORS issue');
      } else if (error.status === 404) {
        errorMessage = 'API endpoint not found. Please check the backend URL.';
        console.error('🔍 Status 404: Endpoint not found');
      } else if (error.status === 500) {
        errorMessage = 'Internal server error. Please check the backend logs.';
        console.error('💥 Status 500: Server error');
      } else if (error.status === 401) {
        errorMessage = 'Unauthorized access. Please check your credentials.';
        console.error('🔐 Status 401: Unauthorized');
      } else if (error.status === 400) {
        errorMessage =
          error.error?.message || 'Bad request. Please check your input.';
        console.error('📝 Status 400: Bad request');
      }
    }

    console.error('🚨 Final error message:', errorMessage);
    return throwError(() => new Error(errorMessage));
  }
}
