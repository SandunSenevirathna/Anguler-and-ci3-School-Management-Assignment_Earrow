import { Component, signal, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { Subscription } from 'rxjs';

import { AuthService } from '../services/auth/auth.service';
import { PrivilegeService } from '../services/privilege/privilege.service';
import { User } from '../services/user/user.service';

interface NavItem {
  name: string;
  route: string;
  privilegeKey: string; // Key to match with backend privileges
}

@Component({
  selector: 'app-side-navigation',
  imports: [CommonModule, RouterModule],
  templateUrl: './side-navigation.component.html',
  styleUrl: './side-navigation.component.scss',
})
export class SideNavigationComponent implements OnInit, OnDestroy {
  isExpanded = signal(true);

  // Current user data
  currentUser: User | null = null;

  // Navigation items with privilege keys
  allNavItems: NavItem[] = [
    {
      name: 'Dashboard',
      route: '/',
      privilegeKey: 'Dashboard',
    },
    {
      name: 'Students',
      route: '/students-management',
      privilegeKey: 'Student',
    },
    {
      name: 'Teacher',
      route: '/teachers-management',
      privilegeKey: 'Teacher',
    },
    {
      name: 'Attendance',
      route: '/attendance',
      privilegeKey: 'Attendance',
    },
    {
      name: 'Payments',
      route: '/payments',
      privilegeKey: 'Payments',
    },
    {
      name: 'Setting',
      route: '/settings',
      privilegeKey: 'Setting',
    },
    {
      name: 'Attendanc History',
      route: '/attendanc-history',
      privilegeKey: 'Attendance',
    },
  ];

  // Filtered navigation items based on user privileges
  visibleNavItems: NavItem[] = [];

  // User privileges from backend
  userPrivileges: string[] = [];

  // Loading state
  isLoadingPrivileges = true;

  private subscriptions: Subscription[] = [];

  constructor(
    private authService: AuthService,
    private privilegeService: PrivilegeService
  ) {}

  ngOnInit(): void {
    // Subscribe to current user changes
    const userSubscription = this.authService.currentUser$.subscribe((user) => {
      this.currentUser = user;
      console.log('👤 Current user in side nav:', user);

      if (user && user.role) {
        this.loadUserPrivileges(user.role);
      } else {
        this.visibleNavItems = [];
        this.userPrivileges = [];
        this.isLoadingPrivileges = false;
      }
    });

    this.subscriptions.push(userSubscription);
  }

  ngOnDestroy(): void {
    // Clean up subscriptions
    this.subscriptions.forEach((sub) => sub.unsubscribe());
  }

  /**
   * Load user privileges from backend based on role
   */
  private loadUserPrivileges(role: string): void {
    this.isLoadingPrivileges = true;
    //console.log('🔍 Loading privileges for role:', role);

    this.privilegeService.getPrivilegesByRole(role).subscribe({
      next: (privileges) => {
        this.userPrivileges = privileges;
        this.filterNavigationItems();
        this.isLoadingPrivileges = false;
        // console.log('✅ User privileges loaded:', privileges);
        //console.log('📋 Visible nav items:', this.visibleNavItems);
      },
      error: (error) => {
        console.error('❌ Error loading user privileges:', error);
        this.isLoadingPrivileges = false;

        // Fallback: show only Dashboard if privilege loading fails
        this.userPrivileges = ['Dashboard'];
        this.filterNavigationItems();

        // Optional: Show user-friendly error message
        // alert(`Error loading navigation privileges: ${error.message}`);
      },
    });
  }

  /**
   * Filter navigation items based on user privileges
   */
  private filterNavigationItems(): void {
    this.visibleNavItems = this.allNavItems.filter((item) => {
      const hasPrivilege = this.userPrivileges.includes(item.privilegeKey);
      // console.log(
      //   `🔐 Checking privilege for ${item.name} (${item.privilegeKey}): ${hasPrivilege}`
      // );
      return hasPrivilege;
    });

    // console.log('📋 Filtered navigation items:', this.visibleNavItems);
  }

  /**
   * Check if user has specific privilege
   */
  hasPrivilege(privilegeKey: string): boolean {
    return this.userPrivileges.includes(privilegeKey);
  }

  /**
   * Get display name for current user
   */
  getUserDisplayName(): string {
    if (!this.currentUser) return 'Unknown User';
    return this.currentUser.username.toUpperCase();
  }

  /**
   * Get user role for display
   */
  getUserRole(): string {
    if (!this.currentUser) return 'Unknown';
    return this.currentUser.role;
  }

  /**
   * Toggle sidebar expansion
   */
  toggleSidenav(): void {
    this.isExpanded.set(!this.isExpanded());
  }

  /**
   * Handle user logout
   */
  logout(): void {
    //console.log('🚪 Logging out...');

    // Use AuthService to logout - this will show login form again
    this.authService.logout();

    // Clear local data
    this.currentUser = null;
    this.visibleNavItems = [];
    this.userPrivileges = [];
  }

  /**
   * Test privilege service connection (for debugging)
   */
  testPrivilegeConnection(): void {
    // console.log('🧪 Testing privilege service connection...');
    this.privilegeService.testConnection().subscribe({
      next: (response) => {
        // console.log('✅ Privilege service connection successful:', response);
        alert('Privilege service connection successful!');
      },
      error: (error) => {
        console.error('❌ Privilege service connection failed:', error);
        alert(`Privilege service connection failed: ${error.message}`);
      },
    });
  }
}
