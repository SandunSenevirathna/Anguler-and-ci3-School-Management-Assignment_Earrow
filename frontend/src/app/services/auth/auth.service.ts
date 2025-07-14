import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { Router } from '@angular/router';
import { User } from '../user/user.service';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private isLoggedInSubject = new BehaviorSubject<boolean>(false);
  private currentUserSubject = new BehaviorSubject<User | null>(null);

  public isLoggedIn$ = this.isLoggedInSubject.asObservable();
  public currentUser$ = this.currentUserSubject.asObservable();

  constructor(private router: Router) {
    // Check if user was already logged in
    this.checkExistingLogin();
  }

  /**
   * Login with user data and navigate to dashboard
   */
  login(user: User): void {
    // Store user data and login state
    this.currentUserSubject.next(user);
    this.isLoggedInSubject.next(true);

    // Persist to localStorage
    localStorage.setItem('isLoggedIn', 'true');
    localStorage.setItem('currentUser', JSON.stringify(user));

    //console.log('😌 User logged in with data:', user);

    // Navigate to dashboard/welcome component
    this.router.navigate(['/dashboard']).then(() => {
      //console.log('🏠 Navigated to dashboard');
    });
  }

  /**
   * Logout, clear all data, and navigate to home
   */
  logout(): void {
    // Clear user data and login state
    this.currentUserSubject.next(null);
    this.isLoggedInSubject.next(false);

    // Clear localStorage
    localStorage.removeItem('isLoggedIn');
    localStorage.removeItem('currentUser');

    // console.log('🚪 User logged out');

    // Navigate to home page (which will show login)
    this.router.navigate(['/']).then(() => {
      // console.log('🔙 Navigated to login page');
    });
  }

  /**
   * Check if user is logged in
   */
  isLoggedIn(): boolean {
    return this.isLoggedInSubject.value;
  }

  /**
   * Get current user data
   */
  getCurrentUser(): User | null {
    return this.currentUserSubject.value;
  }

  /**
   * Get current user's role
   */
  getCurrentUserRole(): string | null {
    const user = this.getCurrentUser();
    return user ? user.role : null;
  }

  /**
   * Get current user's username
   */
  getCurrentUsername(): string | null {
    const user = this.getCurrentUser();
    return user ? user.username : null;
  }

  /**
   * Check if current user has specific role
   */
  hasRole(role: string): boolean {
    const userRole = this.getCurrentUserRole();
    return userRole === role;
  }

  /**
   * Check if current user is admin
   */
  isAdmin(): boolean {
    return this.hasRole('Admin');
  }

  /**
   * Check if current user is teacher
   */
  isTeacher(): boolean {
    return this.hasRole('Teacher');
  }

  /**
   * Check if current user is student
   */
  isStudent(): boolean {
    return this.hasRole('Student');
  }

  /**
   * Navigate to dashboard programmatically
   */
  navigateToDashboard(): void {
    this.router.navigate(['/dashboard']);
  }

  /**
   * Check for existing login on app startup
   */
  private checkExistingLogin(): void {
    const savedLoginState = localStorage.getItem('isLoggedIn');
    const savedUserData = localStorage.getItem('currentUser');

    if (savedLoginState === 'true' && savedUserData) {
      try {
        const user = JSON.parse(savedUserData);
        this.currentUserSubject.next(user);
        this.isLoggedInSubject.next(true);
        // console.log('🔄 Restored existing login for user:', user);

        // If user is already logged in and on login page, redirect to dashboard
        if (this.router.url === '/' || this.router.url === '') {
          this.navigateToDashboard();
        }
      } catch (error) {
        console.error('❌ Error parsing saved user data:', error);
        // Clear invalid data
        this.logout();
      }
    }
  }
}
