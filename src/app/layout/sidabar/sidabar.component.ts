import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MenuModule } from 'primeng/menu';
import { MenuItem } from 'primeng/api';
import { AuthService } from '../../core/services/auth.service';
import { UserRole } from '../../features/auth/profile/models/user.model';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-sidabar',
  standalone: true,
  imports: [CommonModule, RouterModule, MenuModule],
  templateUrl: './sidabar.component.html',
  styleUrls: ['./sidabar.component.css'],
})
export class SidabarComponent implements OnInit, OnDestroy {
  menuItems: MenuItem[] = [];
  private userSubscription?: Subscription;

  constructor(private authService: AuthService) {}

  ngOnInit(): void {
    // Subscribe to user changes to update menu dynamically
    this.userSubscription = this.authService.currentUser$.subscribe(user => {
      console.log('Sidebar: User changed, updating menu:', user);
      this.buildMenu(user);
    });
  }

  ngOnDestroy(): void {
    if (this.userSubscription) {
      this.userSubscription.unsubscribe();
    }
  }

  private buildMenu(user: any): void {
    if (!user) {
      this.menuItems = [];
      return;
    }

    console.log('Sidebar: Building menu for user role:', user.role);

    // Common items for all authenticated users
    this.menuItems = [
      { label: 'Dashboard', icon: 'pi pi-th-large', routerLink: '/dashboard' },
    ];

    // Role-based items using UserRole enum values
    if (user.role === UserRole.ADMIN || user.role === 'admin') {
      this.menuItems.push(
        { label: 'Employees', icon: 'pi pi-users', routerLink: '/employees' },
        { label: 'Departments', icon: 'pi pi-building', routerLink: '/departments' },
        { label: 'Attendance', icon: 'pi pi-calendar', routerLink: '/attendance' },
        { label: 'Leave Management', icon: 'pi pi-calendar', routerLink: '/hr-leave-management' },
        { label: 'Payroll', icon: 'pi pi-money-bill', routerLink: '/payroll' }
      );
    } else if (user.role === UserRole.HR || user.role === 'hr') {
      this.menuItems.push(
        { label: 'Employees', icon: 'pi pi-users', routerLink: '/employees' },
        { label: 'Departments', icon: 'pi pi-building', routerLink: '/departments' },
        { label: 'Attendance', icon: 'pi pi-calendar', routerLink: '/attendance' },
        { label: 'Leave Management', icon: 'pi pi-calendar', routerLink: '/hr-leave-management' },
        { label: 'Payroll', icon: 'pi pi-money-bill', routerLink: '/payroll' },
      );
    } else if (user.role === UserRole.FINANCE || user.role === 'finance') {
      this.menuItems.push(
        { label: 'Payroll', icon: 'pi pi-money-bill', routerLink: '/payroll' }
      );
    } else if (user.role === UserRole.EMPLOYEE || user.role === 'employee') {
      this.menuItems.push(
        { label: 'Leave', icon: 'pi pi-calendar', routerLink: '/leave' }
      );
    }

    console.log('Sidebar: Final menu items:', this.menuItems);
  }
}
