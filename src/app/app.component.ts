import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet, RouterModule, Router } from '@angular/router';
import { AuthService } from './shared/services/auth.service';
import { User } from './features/auth/profile/models/user.model';
import { MenubarModule } from 'primeng/menubar';
import { ButtonModule } from 'primeng/button';
import { TooltipModule } from 'primeng/tooltip';
import { MenuItem } from 'primeng/api';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterOutlet, RouterModule, MenubarModule, ButtonModule, TooltipModule],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {
  title = 'ERP System';
  currentUser: User | null = null;
  menuItems: MenuItem[] = [];

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.authService.currentUser$.subscribe(user => {
      this.currentUser = user;
      if (user) {
        this.initializeMenu();
      }
    });
  }

  initializeMenu(): void {
    this.menuItems = [
      {
        label: 'Dashboard',
        icon: 'pi pi-home',
        command: () => this.router.navigate(['/dashboard'])
      },
      {
        label: 'Attendance',
        icon: 'pi pi-calendar',
        command: () => this.router.navigate(['/attendance'])
      },
      {
        label: 'Employees',
        icon: 'pi pi-users',
        command: () => this.router.navigate(['/employees'])
      },
      {
        label: 'Departments',
        icon: 'pi pi-building',
        command: () => this.router.navigate(['/departments'])
      },
      {
        label: 'Payroll',
        icon: 'pi pi-money-bill',
        items: [
          {
            label: 'Employee Management',
            icon: 'pi pi-user',
            command: () => this.router.navigate(['/payroll/employees'])
          },
          {
            label: 'Salary Calculation',
            icon: 'pi pi-calculator',
            command: () => this.router.navigate(['/payroll/salary-calculation'])
          },
          {
            label: 'Payslips',
            icon: 'pi pi-file',
            command: () => this.router.navigate(['/payroll/payslips'])
          }
        ]
      }
    ];
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/auth/login']);
  }

  navigateToProfile(): void {
    this.router.navigate(['/auth/profile']);
  }

  isAuthenticated(): boolean {
    return this.authService.isAuthenticated();
  }
}
