import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { RouterModule } from '@angular/router';
import { AppComponent } from './app.component';
import { AttendanceComponent } from './components/attendance/attendance.component';
import { LoginComponent } from './components/auth/login/login.component';
import { RegisterComponent } from './components/auth/register/register.component';
import { ProfileComponent } from './components/auth/profile/profile.component';
import { DashboardComponent } from './components/dashboard/dashboard.component';
import { DepartmentComponent } from './components/department/department.component';
import { EmployeeComponent } from './components/employee/employee.component';
import { routes } from './app.routes';
import { TableComponent } from './components/ui/table/table.component';

@NgModule({
		declarations: [
			AppComponent,
			AttendanceComponent,
			LoginComponent,
			RegisterComponent,
			ProfileComponent,
			DashboardComponent,
			DepartmentComponent,
			EmployeeComponent,
			TableComponent
		],
	imports: [
		BrowserModule,
		RouterModule.forRoot(routes)
	],
	providers: [],
	bootstrap: [AppComponent]
})
export class AppModule { }
