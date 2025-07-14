import { Component, OnInit, ViewChild, AfterViewInit } from '@angular/core';
import { Router } from '@angular/router';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatSortModule, MatSort } from '@angular/material/sort';
import { MatPaginatorModule, MatPaginator } from '@angular/material/paginator';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { CreateUserComponent } from '../create-user/create-user.component';
import { UserService, User } from '../../../services/user/user.service';

@Component({
  selector: 'app-show-all-user',
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
    MatProgressSpinnerModule,
    FormsModule,
    CreateUserComponent,
  ],
  templateUrl: './show-all-user.component.html',
  styleUrl: './show-all-user.component.scss',
})
export class ShowAllUserComponent implements OnInit, AfterViewInit {
  users: User[] = [];
  isLoading = false;
  error: string | null = null;

  // Table columns (removed password for security)
  displayedColumns: string[] = ['user_id', 'username', 'role', 'actions'];

  dataSource = new MatTableDataSource<User>(this.users);
  searchTerm: string = '';

  // Modal state properties
  showModal = false;
  selectedUserForEdit: User | null = null;

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  constructor(
    private router: Router,
    private userService: UserService // Inject UserService
  ) {}

  ngOnInit(): void {
    console.log('ShowAllUserComponent initialized');
    this.loadUsers();
    this.setupFilter();
  }

  ngAfterViewInit(): void {
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }

  // Check if any modal is open for blur effect
  get isAnyModalOpen(): boolean {
    return this.showModal;
  }

  // Open modal for new registration
  openModal(): void {
    this.selectedUserForEdit = null;
    this.showModal = true;
    console.log('Opening create user modal for new registration');
  }

  // Open modal for editing existing user
  openEditModal(user: User): void {
    this.selectedUserForEdit = user;
    this.showModal = true;
    console.log('Opening edit modal for user:', user);
  }

  // Close registration modal
  closeModal(): void {
    this.showModal = false;
    this.selectedUserForEdit = null;
    console.log('User modal closed');
  }

  // Handle successful user registration/update
  onUserRegistered(user: User): void {
    console.log('User operation completed successfully:', user);

    // Always reload from backend to get the most current data
    this.loadUsers();

    this.showModal = false;
    this.selectedUserForEdit = null;
  }

  // Handle successful user deletion from modal
  onUserDeleted(user: User): void {
    console.log('User deleted successfully from modal:', user);

    // Reload users from backend
    this.loadUsers();

    this.showModal = false;
    this.selectedUserForEdit = null;
  }

  // UPDATED: Load users from the backend using UserService
  loadUsers(): void {
    this.isLoading = true;
    this.error = null;

    console.log('Loading users from backend...');

    this.userService.getAllUsers().subscribe({
      next: (data: User[]) => {
        console.log('Users loaded successfully from backend:', data);
        this.users = data;
        this.dataSource.data = this.users;
        this.isLoading = false;

        // Apply current filter if any
        if (this.searchTerm) {
          this.applyFilter();
        }
      },
      error: (error) => {
        console.error('Failed to load users from backend:', error);
        this.error = error.message || 'Failed to load users';
        this.isLoading = false;
        this.users = [];
        this.dataSource.data = this.users;

        // Show user-friendly error message
        alert(`Failed to load users: ${this.error}`);
      },
    });
  }

  // Reload users (for refresh functionality)
  refreshUsers(): void {
    console.log('Refreshing users data...');
    this.loadUsers();
  }

  // REMOVED: maskPassword method (no longer needed since we don't show passwords)

  // Format role for display
  formatRole(role: string): string {
    if (!role) return 'N/A';
    return role.charAt(0).toUpperCase() + role.slice(1).toLowerCase();
  }

  // UPDATED: Setup filter to work with user fields (removed password)
  setupFilter(): void {
    this.dataSource.filterPredicate = (data: User, filter: string) => {
      const searchStr = filter.toLowerCase();
      return (
        data.username.toLowerCase().includes(searchStr) ||
        data.user_id.toString().includes(searchStr) ||
        data.role.toLowerCase().includes(searchStr)
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

    console.log('Filter applied:', filterValue);
  }

  // Clear search
  clearSearch(): void {
    this.searchTerm = '';
    this.applyFilter();
    console.log('Search cleared');
  }

  // User action methods
  onEditUser(user: User): void {
    console.log('Edit user:', user);
    this.openEditModal(user);
  }

  // UPDATED: Delete user using UserService
  onDeleteUser(user: User): void {
    console.log('Delete user requested:', user);

    const confirmDelete = confirm(
      `Are you sure you want to delete user "${user.username}"?\n\nThis action cannot be undone.`
    );

    if (confirmDelete) {
      console.log('User confirmed deletion, proceeding...');

      this.userService.deleteUser(user.user_id).subscribe({
        next: () => {
          console.log('User deleted successfully from backend');
          alert('User deleted successfully!');

          // Reload users to refresh the list
          this.loadUsers();
        },
        error: (error) => {
          console.error('Error deleting user from backend:', error);
          alert(`Error deleting user: ${error.message}`);
        },
      });
    } else {
      console.log('User cancelled deletion');
    }
  }

  onViewUser(user: User): void {
    console.log('View user:', user);

    // Create a detailed view modal or navigate to user details
    const userDetails = `
User Details:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
👤 User ID: ${user.user_id}
📧 Username: ${user.username}
🎭 Role: ${this.formatRole(user.role)}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    `;

    alert(userDetails);

    // TODO: Implement proper user details modal or navigation
    // this.router.navigate(['/user-details', user.user_id]);
  }
}
