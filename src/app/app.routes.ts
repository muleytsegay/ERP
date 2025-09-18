import { Routes } from '@angular/router';
import { LoginComponent } from './features/auth/login/login.component';
import { ProfileComponent } from './features/auth/profile/components/profile.component';
import { DashboardComponent } from './features/dashboard/components/dashboard.component';
import { DepartmentComponent } from './features/department/components/department.component';
import { AttendanceComponent } from './features/attendance/components/attendance.component';
import { EmployeeComponent } from './features/employee/components/employee.component';
import { AuthGuard } from './core/guards/auth.guard';
import { LoginRedirectGuard } from './core/guards/login-redirect.guard';
import { PayrollRootComponent } from './features/payroll/components/payroll-root.component';
import { EmployeeLeaveComponent } from './features/leave/components/employee-leave.component';
import { HrLeaveManagementComponent } from './features/leave/components/hr-leave-management.component';

export const routes: Routes = [
  { path: '', redirectTo: '/auth/login', pathMatch: 'full' },

  // Authentication routes
  {
    path: 'auth/login',
    component: LoginComponent,
    canActivate: [LoginRedirectGuard],
  },

  // Employee profile (employee only)
  {
    path: 'auth/profile',
    component: ProfileComponent,
    canActivate: [AuthGuard],
    data: { roles: ['EMPLOYEE'] }
  },

  // Employee leave page (employee only)
  {
    path: 'leave',
    component: EmployeeLeaveComponent,
    canActivate: [AuthGuard],
    data: { roles: ['EMPLOYEE'] }
  },

  // HR leave management (HR/admin only)
  {
    path: 'hr-leave-management',
    component: HrLeaveManagementComponent,
    canActivate: [AuthGuard],
    data: { roles: ['HR', 'ADMIN'] }
  },

  // Dashboard
  {
    path: 'dashboard',
    component: DashboardComponent,
    canActivate: [AuthGuard],
  },

  // Payroll route
  {
    path: 'payroll',
    component: PayrollRootComponent,
    canActivate: [AuthGuard],
  },

  //Department Routes
  {
    path: 'departments',
    component: DepartmentComponent,
    canActivate: [AuthGuard],
  },

  // Attendance Route
  {
    path: 'attendance',
    component: AttendanceComponent,
    canActivate: [AuthGuard],
  },

  // Employee Management Route
  { path: 'employees', component: EmployeeComponent, canActivate: [AuthGuard] },

  // Wildcard route
  { path: '**', redirectTo: '/auth/login' },
];
