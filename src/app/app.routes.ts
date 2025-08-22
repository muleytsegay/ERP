import { Routes } from '@angular/router';
import { LoginComponent } from './features/auth/login/login.component';
import { RegisterComponent } from './features/auth/register/register.component';
import { ProfileComponent } from './features/auth/profile/components/profile.component';
import { DashboardComponent } from './features/dashboard/components/dashboard.component';
// import { EmployeeManagementComponent } from './components/payroll/employee-management/employee-management.component';
// import { SalaryCalculationComponent } from './components/payroll/salary-calculation/salary-calculation.component';
// import { PayslipComponent } from './components/payroll/payslip/payslip.component';

import { DepartmentComponent } from './features/department/components/department.component';
import { AttendanceComponent } from './features/attendance/components/attendance.component';
import { EmployeeComponent } from './features/employee/components/employee.component';
import { AuthGuard } from './core/guards/auth.guard';
import { LoginRedirectGuard } from './core/guards/login-redirect.guard';

export const routes: Routes = [
  { path: '', redirectTo: '/auth/login', pathMatch: 'full' },

  // Authentication routes
  {
    path: 'auth/login',
    component: LoginComponent,
    canActivate: [LoginRedirectGuard],
  },
  {
    path: 'auth/register',
    component: RegisterComponent,
    canActivate: [LoginRedirectGuard],
  },
  // { path: 'auth/profile', component: ProfileComponent, canActivate: [AuthGuard] },
  { path: 'profile', component: ProfileComponent },
  // Dashboard
  {
    path: 'dashboard',
    component: DashboardComponent,
    canActivate: [AuthGuard],
  },

  // Payroll routes
  // { path: 'payroll/employees', component: EmployeeManagementComponent, canActivate: [AuthGuard] },
  // { path: 'payroll/salary-calculation', component: SalaryCalculationComponent, canActivate: [AuthGuard] },
  // { path: 'payroll/payslips', component: PayslipComponent, canActivate: [AuthGuard] },

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
