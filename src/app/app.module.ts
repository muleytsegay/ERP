import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { RouterModule } from '@angular/router';
import { ReactiveFormsModule } from '@angular/forms';
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
import { CardModule } from 'primeng/card';
import { InputTextModule } from 'primeng/inputtext';
import { PasswordModule } from 'primeng/password';
import { ButtonModule } from 'primeng/button';
import { MessageModule } from 'primeng/message';
import { FloatLabelModule } from 'primeng/floatlabel';
import { DividerModule } from 'primeng/divider';

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
    RouterModule.forRoot(routes),
    ReactiveFormsModule,
    CardModule,
    InputTextModule,
    PasswordModule,
    ButtonModule,
    MessageModule,
    FloatLabelModule,
    DividerModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }