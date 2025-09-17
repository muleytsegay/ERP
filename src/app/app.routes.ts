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

export const routes: Routes = [
  { path: '', redirectTo: '/auth/login', pathMatch: 'full' },

  // Authentication routes
  {
    path: 'auth/login',
    component: LoginComponent,
    canActivate: [LoginRedirectGuard],
  },

  {
    path: 'auth/profile',
    component: ProfileComponent,
    canActivate: [AuthGuard],
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
