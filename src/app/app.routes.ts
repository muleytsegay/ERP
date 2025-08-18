import { Routes } from '@angular/router';
import { LoginComponent } from './components/auth/login/login.component';
import { RegisterComponent } from './components/auth/register/register.component';
import { ProfileComponent } from './components/auth/profile/profile.component';
import { DashboardComponent } from './components/dashboard/dashboard.component';
// import { EmployeeManagementComponent } from './components/payroll/employee-management/employee-management.component';
// import { SalaryCalculationComponent } from './components/payroll/salary-calculation/salary-calculation.component';
// import { PayslipComponent } from './components/payroll/payslip/payslip.component';

import { DepartmentComponent } from './components/department/department.component';
import { AttendanceComponent } from './components/attendance/attendance.component';
import { EmployeeComponent } from './components/employee/employee.component';
import { AuthGuard } from './shared/guards/auth.guard';
import { LoginRedirectGuard } from './shared/guards/login-redirect.guard';

export const routes: Routes = [
  { path: '', redirectTo: '/auth/login', pathMatch: 'full' },
  
  // Authentication routes
  { path: 'auth/login', component: LoginComponent, canActivate: [LoginRedirectGuard] },
  { path: 'auth/register', component: RegisterComponent, canActivate: [LoginRedirectGuard] },
  { path: 'auth/profile', component: ProfileComponent, canActivate: [AuthGuard] },
  
  // Dashboard
  { path: 'dashboard', component: DashboardComponent, canActivate: [AuthGuard] },
  
  // Payroll routes
  // { path: 'payroll/employees', component: EmployeeManagementComponent, canActivate: [AuthGuard] },
  // { path: 'payroll/salary-calculation', component: SalaryCalculationComponent, canActivate: [AuthGuard] },
  // { path: 'payroll/payslips', component: PayslipComponent, canActivate: [AuthGuard] },

  //Department Routes
  {path: 'departments', component: DepartmentComponent, canActivate: [AuthGuard]},

  // Attendance Route
  { path: 'attendance', component: AttendanceComponent, canActivate: [AuthGuard] },

  // Employee Management Route
  { path: 'employees', component: EmployeeComponent, canActivate: [AuthGuard] },

  // Wildcard route
  { path: '**', redirectTo: '/auth/login' }
];
