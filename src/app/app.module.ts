import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { RouterModule } from '@angular/router';
import { AppComponent } from './app.component';
import { AttendanceComponent } from './features/attendance/components/attendance.component';
import { LoginComponent } from './features/auth/login/login.component';
import { RegisterComponent } from './features/auth/register/register.component';
import { ProfileComponent } from './features/auth/profile/components/profile.component';
import { DashboardComponent } from './features/dashboard/components/dashboard.component';
import { DepartmentComponent } from './features/department/components/department.component';
import { EmployeeComponent } from './features/employee/components/employee.component';
import { routes } from './app.routes';
import { TableComponent } from './shared/components/ui/table/table.component';

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
