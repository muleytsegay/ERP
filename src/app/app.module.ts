import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { RouterModule, RouterOutlet } from '@angular/router';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { AppComponent } from './app.component';

// Feature Components
import { AttendanceComponent } from './features/attendance/components/attendance.component';
import { LoginComponent } from './features/auth/login/login.component';
import { RegisterComponent } from './features/auth/register/register.component';
import { ProfileComponent } from './features/auth/profile/components/profile.component';
import { DashboardComponent } from './features/dashboard/components/dashboard.component';
import { DepartmentComponent } from './features/department/components/department.component';
import { EmployeeComponent } from './features/employee/components/employee.component';

// Shared Components
import { TableComponent } from './shared/components/ui/table/table.component';

// Routing
import { routes } from './app.routes';

// PrimeNG Modules
import { CardModule } from 'primeng/card';
import { InputTextModule } from 'primeng/inputtext';
import { PasswordModule } from 'primeng/password';
import { ButtonModule } from 'primeng/button';
import { MessageModule } from 'primeng/message';
import { FloatLabelModule } from 'primeng/floatlabel';
import { DividerModule } from 'primeng/divider';
import { TableModule } from 'primeng/table';
import { DialogModule } from 'primeng/dialog';
import { ToastModule } from 'primeng/toast';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { CheckboxModule } from 'primeng/checkbox';
import { ChartModule } from 'primeng/chart';
import { TagModule } from 'primeng/tag';
import { ProgressBarModule } from 'primeng/progressbar';
import { AvatarModule } from 'primeng/avatar';
import { TooltipModule } from 'primeng/tooltip';
import { MenubarModule } from 'primeng/menubar';

// PrimeNG Services
import { MessageService, ConfirmationService } from 'primeng/api';

@NgModule({
  declarations: [],
  imports: [
    BrowserModule,
    CommonModule,
    RouterModule.forRoot(routes),
    RouterOutlet,
    ReactiveFormsModule,
    FormsModule,
    // PrimeNG
    CardModule,
    InputTextModule,
    PasswordModule,
    ButtonModule,
    MessageModule,
    FloatLabelModule,
    DividerModule,
    TableModule,
    DialogModule,
    ToastModule,
    ConfirmDialogModule,
    CheckboxModule,
    ChartModule,
    TagModule,
    ProgressBarModule,
    AvatarModule,
    TooltipModule,
    MenubarModule,
  ],
  providers: [
    MessageService,
    ConfirmationService
  ],
  bootstrap: [],
})
export class AppModule {}
