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

export const routes: Routes = [
  { path: '', redirectTo: '/auth/login', pathMatch: 'full' },
  
  // Authentication routes
  { path: 'auth/login', component: LoginComponent },
  { path: 'auth/register', component: RegisterComponent },
  { path: 'auth/profile', component: ProfileComponent },
  
  // Dashboard
  { path: 'dashboard', component: DashboardComponent },
  
  // Payroll routes
  // { path: 'payroll/employees', component: EmployeeManagementComponent },
  // { path: 'payroll/salary-calculation', component: SalaryCalculationComponent },
  // { path: 'payroll/payslips', component: PayslipComponent },

  //Department Routes
  {path: 'departments', component: DepartmentComponent},

  // Attendance Route
  { path: 'attendance', component: AttendanceComponent },

  // Wildcard route
  { path: '**', redirectTo: '/auth/login' }
];
