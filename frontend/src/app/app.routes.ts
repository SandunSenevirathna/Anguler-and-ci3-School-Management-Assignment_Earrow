import { Routes } from '@angular/router';
import { WelcomeComponent } from './components/welcome/welcome.component';
import { StudentsRegistrationComponent } from './components/student/students-registration/students-registration.component';
import { ShowAllStudentsComponent } from './components/student/show-all-students/show-all-students.component';
import { ShowAllTeachersComponent } from './components/teacher/show-all-teachers/show-all-teachers.component';
import { PaymentComponent } from './components/payment/payment/payment.component';
import { ShowAllUserComponent } from './components/user/show-all-user/show-all-user.component';
import { ShowAllAttendanceComponent } from './components/attendance/show-all-attendance/show-all-attendance.component';
import { ShowAttendanceHistoryComponent } from './components/attendance/show-attendance-history/show-attendance-history.component';

export const routes: Routes = [
  { path: '', component: WelcomeComponent },
  { path: 'dashboard', component: WelcomeComponent },
  { path: 'students-registration', component: StudentsRegistrationComponent },
  { path: 'students-management', component: ShowAllStudentsComponent },
  { path: 'teachers-management', component: ShowAllTeachersComponent },
  { path: 'payments', component: PaymentComponent },
  { path: 'settings', component: ShowAllUserComponent },
  { path: 'attendance', component: ShowAllAttendanceComponent },
  { path: 'attendanc-history', component: ShowAttendanceHistoryComponent },

  { path: '**', redirectTo: '' },
];
