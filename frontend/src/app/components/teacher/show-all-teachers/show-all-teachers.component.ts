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
import { MatChipsModule } from '@angular/material/chips';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import {
  TeacherService,
  Teacher,
} from '../../../services/teacher/teacher.service';
import { TeacherRegistrationComponent } from '../teacher-registration/teacher-registration.component';

@Component({
  selector: 'app-show-all-teachers',
  standalone: true,
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
    MatChipsModule,
    FormsModule,
    TeacherRegistrationComponent,
  ],
  templateUrl: './show-all-teachers.component.html',
  styleUrl: './show-all-teachers.component.scss',
})
export class ShowAllTeachersComponent implements OnInit, AfterViewInit {
  teachers: Teacher[] = [];

  // UPDATED columns to match new database structure
  displayedColumns: string[] = [
    'teacher_id',
    'teacher_name',
    'class_name',
    'gender',
    'created_date',
    'actions',
  ];

  dataSource = new MatTableDataSource<Teacher>(this.teachers);
  searchTerm: string = '';

  // Modal state properties
  showModal = false;
  selectedTeacherForEdit: Teacher | null = null;

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  constructor(private router: Router, private teacherService: TeacherService) {}

  ngOnInit(): void {
    this.loadTeachers();
    this.setupFilter();
  }

  ngAfterViewInit(): void {
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }

  // Open modal for new registration
  openModal(): void {
    this.selectedTeacherForEdit = null;
    this.showModal = true;
  }

  // Open modal for editing existing teacher
  openEditModal(teacher: Teacher): void {
    this.selectedTeacherForEdit = teacher;
    this.showModal = true;
  }

  // Close modal
  closeModal(): void {
    this.showModal = false;
    this.selectedTeacherForEdit = null;
    this.loadTeachers();
  }

  // Handle successful teacher registration/update
  onTeacherRegistered(teacher: Teacher): void {
    console.log('Teacher operation completed successfully:', teacher);
    this.loadTeachers();
    this.showModal = false;
    this.selectedTeacherForEdit = null;
  }

  // Handle successful teacher deletion from modal
  onTeacherDeleted(teacher: Teacher): void {
    console.log('Teacher deleted successfully from modal:', teacher);
    this.loadTeachers();
    this.showModal = false;
    this.selectedTeacherForEdit = null;
  }

  // // Load teachers from the backend
  // loadTeachers(): void {
  //   this.teacherService.getAllTeachers().subscribe({
  //     next: (data) => {
  //       this.teachers = data;
  //       this.dataSource.data = this.teachers;
  //       console.log('Teachers loaded:', this.teachers);
  //     },
  //     error: (err) => {
  //       console.error('Failed to load teachers:', err);
  //       alert(`Failed to load teachers: ${err.message}`);
  //     },
  //   });
  // }

  loadTeachers(): void {
    this.teacherService.getAllTeachers().subscribe({
      next: (data) => {
        this.teachers = data;
        this.dataSource.data = this.teachers;
        console.log('Students loaded:', this.teachers);
      },
      error: (err) => {
        console.error('Failed to load students:', err);
        alert(`Failed to load students: ${err.message}`);
      },
    });
  }

  // Format created date for display
  formatCreatedDate(createdDate: string): string {
    return this.teacherService.formatCreatedDate(createdDate);
  }

  // Format gender for display
  formatGender(gender: string): string {
    return this.teacherService.formatGender(gender);
  }

  // UPDATED filter to work with new field names
  setupFilter(): void {
    this.dataSource.filterPredicate = (data: Teacher, filter: string) => {
      const searchStr = filter.toLowerCase();
      return (
        data.teacher_name.toLowerCase().includes(searchStr) ||
        data.teacher_id.toString().includes(searchStr) ||
        data.class_name.toLowerCase().includes(searchStr) ||
        (data.gender ? data.gender.toLowerCase().includes(searchStr) : false) ||
        (data.created_date ? data.created_date.includes(searchStr) : false)
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
  }

  // Clear search
  clearSearch(): void {
    this.searchTerm = '';
    this.applyFilter();
  }

  // UPDATED Teacher action methods
  onEditTeacher(teacher: Teacher): void {
    console.log('Edit teacher:', teacher);
    this.openEditModal(teacher);
  }

  onDeleteTeacher(teacher: Teacher): void {
    console.log('Delete teacher:', teacher);
    const confirmDelete = confirm(
      `Are you sure you want to delete ${teacher.teacher_name}?`
    );

    if (confirmDelete) {
      // UPDATED to use teacher_id instead of id
      this.teacherService.deleteTeacher(teacher.teacher_id).subscribe({
        next: () => {
          console.log('Teacher deleted successfully');
          this.loadTeachers();
          alert('Teacher deleted successfully!');
        },
        error: (error) => {
          console.error('Error deleting teacher:', error);
          alert(`Error deleting teacher: ${error.message}`);
        },
      });
    }
  }

  onViewTeacher(teacher: Teacher): void {
    console.log('View teacher:', teacher);
    // You can implement a view modal here if needed
  }

  // Utility methods for stats
  getTotalTeachersCount(): number {
    return this.teachers.length;
  }

  getMaleTeachersCount(): number {
    return this.teachers.filter((teacher) => teacher.gender === 'Male').length;
  }

  getFemaleTeachersCount(): number {
    return this.teachers.filter((teacher) => teacher.gender === 'Female')
      .length;
  }

  // Get unique class names
  getUniqueClasses(): string[] {
    const classes = this.teachers.map((teacher) => teacher.class_name);
    return [...new Set(classes)].sort();
  }
}
