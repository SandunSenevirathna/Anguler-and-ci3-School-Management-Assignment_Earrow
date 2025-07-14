import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, map, tap } from 'rxjs/operators';

// Interface for the backend API response
export interface ApiResponse<T> {
  status: string;
  message: string;
  data: T;
  count?: number;
}

// Interface for privilege data
export interface Privilege {
  id: number;
  role_name: string;
  privilege: string[]; // Array of privilege names like ["Dashboard", "Student", "Teacher"]
}

@Injectable({
  providedIn: 'root',
})
export class PrivilegeService {
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

  constructor(private http: HttpClient) {
    console.log(
      '🔧 PrivilegeService initialized with backend URL:',
      this.BACKEND_API_URL
    );
  }

  /**
   * Get privileges by role name - MAIN METHOD
   * This fetches the privileges for a specific role from the backend
   */
  getPrivilegesByRole(roleName: string): Observable<string[]> {
    const url = `${this.BACKEND_API_URL}/auth_privilege/get_by_role/${roleName}`;

    console.log('🚀 Fetching privileges for role:', roleName);
    console.log('📡 Request URL:', url);

    return this.http.get<ApiResponse<Privilege>>(url, this.httpOptions).pipe(
      tap((response) => {
        console.log('📡 Raw privilege response:', response);
      }),
      map((response) => {
        console.log('🔍 Processing privilege response:', response);

        if (response.status === 'success' && response.data) {
          console.log(
            '✅ Privileges fetched successfully:',
            response.data.privilege
          );
          return response.data.privilege; // Return the privilege array
        } else {
          console.error('❌ Failed to fetch privileges:', response.message);
          throw new Error(response.message || 'Failed to fetch privileges');
        }
      }),
      catchError((error) => {
        console.error('💥 HTTP Error in getPrivilegesByRole:', error);
        return this.handleError(error);
      })
    );
  }

  /**
   * Get all privileges
   * This fetches all privilege records from the backend
   */
  getAllPrivileges(): Observable<Privilege[]> {
    const url = `${this.BACKEND_API_URL}/auth_privilege/get_all`;

    console.log('🚀 Fetching all privileges');

    return this.http.get<ApiResponse<Privilege[]>>(url, this.httpOptions).pipe(
      tap((response) => {
        console.log('📡 Raw all privileges response:', response);
      }),
      map((response) => {
        if (response.status === 'success') {
          console.log('✅ All privileges fetched successfully:', response.data);
          return response.data;
        } else {
          throw new Error(response.message || 'Failed to fetch all privileges');
        }
      }),
      catchError(this.handleError.bind(this))
    );
  }

  /**
   * Check if a role has a specific privilege
   * This checks if a role has access to a specific privilege
   */
  checkPrivilege(roleName: string, privilegeName: string): Observable<boolean> {
    const url = `${this.BACKEND_API_URL}/auth_privilege/check_privilege/${roleName}/${privilegeName}`;

    console.log(
      `🔍 Checking if role '${roleName}' has privilege '${privilegeName}'`
    );

    return this.http.get<any>(url, this.httpOptions).pipe(
      tap((response) => {
        console.log('📡 Check privilege response:', response);
      }),
      map((response) => {
        if (response.status === 'success') {
          const hasPrivilege = response.data.has_privilege;
          console.log(`✅ Privilege check result: ${hasPrivilege}`);
          return hasPrivilege;
        } else {
          throw new Error(response.message || 'Failed to check privilege');
        }
      }),
      catchError(this.handleError.bind(this))
    );
  }

  /**
   * Get available privileges (unique list)
   * This returns all unique privileges across all roles
   */
  getAvailablePrivileges(): Observable<string[]> {
    const url = `${this.BACKEND_API_URL}/auth_privilege/get_available_privileges`;

    console.log('🚀 Fetching available privileges');

    return this.http.get<ApiResponse<string[]>>(url, this.httpOptions).pipe(
      tap((response) => {
        console.log('📡 Available privileges response:', response);
      }),
      map((response) => {
        if (response.status === 'success') {
          console.log('✅ Available privileges fetched:', response.data);
          return response.data;
        } else {
          throw new Error(
            response.message || 'Failed to fetch available privileges'
          );
        }
      }),
      catchError(this.handleError.bind(this))
    );
  }

  /**
   * Test privilege service connection
   */
  testConnection(): Observable<any> {
    const url = `${this.BACKEND_API_URL}/auth_privilege/get_all`;
    console.log('🧪 Testing privilege service connection to:', url);

    return this.http.get<ApiResponse<Privilege[]>>(url, this.httpOptions).pipe(
      tap((response) => {
        console.log(
          '✅ Privilege service connection test successful:',
          response
        );
      }),
      map((response) => {
        return {
          success: true,
          message: 'Privilege service connection successful',
          data: response,
        };
      }),
      catchError((error) => {
        console.error('❌ Privilege service connection test failed:', error);
        return this.handleError(error);
      })
    );
  }

  /**
   * Handle HTTP errors with enhanced debugging
   */
  private handleError(error: any): Observable<never> {
    let errorMessage = 'An unknown error occurred';

    console.error('🔍 Full privilege service error object:', error);

    if (error.error instanceof ErrorEvent) {
      // Client-side error
      errorMessage = `Client Error: ${error.error.message}`;
      console.error('🖥️ Client-side error detected in privilege service');
    } else {
      // Server-side error
      console.error('🔌 Server-side error detected in privilege service');

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
          'Unable to connect to the privilege service. Please check if the backend is running.';
        console.error(
          '🚫 Status 0: Network error or CORS issue in privilege service'
        );
      } else if (error.status === 404) {
        errorMessage =
          'Privilege API endpoint not found. Please check the backend URL.';
        console.error('🔍 Status 404: Privilege endpoint not found');
      } else if (error.status === 500) {
        errorMessage =
          'Internal server error in privilege service. Please check the backend logs.';
        console.error('💥 Status 500: Privilege server error');
      } else if (error.status === 401) {
        errorMessage = 'Unauthorized access to privilege service.';
        console.error('🔐 Status 401: Unauthorized privilege access');
      } else if (error.status === 400) {
        errorMessage =
          error.error?.message || 'Bad request to privilege service.';
        console.error('📝 Status 400: Bad privilege request');
      }
    }

    console.error('🚨 Final privilege service error message:', errorMessage);
    return throwError(() => new Error(errorMessage));
  }
}
