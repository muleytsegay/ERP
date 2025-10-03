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
    console.log('Sidebar: Component initialized');

    // Get current user value immediately
    const currentUser = this.authService.getCurrentUserValue();
    console.log('Sidebar: Current user on init:', currentUser);
    if (currentUser) {
      this.buildMenu(currentUser);
    }

    // Subscribe to user changes to update menu dynamically
    this.userSubscription = this.authService.currentUser$.subscribe((user) => {
      console.log('Sidebar: User changed via observable, updating menu:', user);
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
      console.log('Sidebar: No user, clearing menu');
      this.menuItems = [];
      return;
    }

    console.log('Sidebar: Building menu for user:', {
      user: user,
      role: user.role,
      roleType: typeof user.role,
      userKeys: Object.keys(user),
    });

    // Common items for all authenticated users
    this.menuItems = [
      { label: 'Dashboard', icon: 'pi pi-th-large', routerLink: '/dashboard' },
    ];

    // Normalize role to lowercase string for comparison
    const userRole = user.role ? String(user.role).toLowerCase().trim() : '';
    console.log('Sidebar: Normalized role:', `"${userRole}"`);

    // Add debugging for role matching
    console.log('Sidebar: Role matching check:');
    console.log('- userRole === "admin":', userRole === 'admin');
    console.log('- userRole === "hr":', userRole === 'hr');
    console.log('- userRole === "finance":', userRole === 'finance');
    console.log('- userRole === "employee":', userRole === 'employee');

    // Role-based items
    if (userRole === 'admin') {
      console.log('Sidebar: Adding admin menu items');
      this.menuItems.push(
        { label: 'Employees', icon: 'pi pi-users', routerLink: '/employees' },
        {
          label: 'Departments',
          icon: 'pi pi-building',
          routerLink: '/departments',
        },
        {
          label: 'Attendance',
          icon: 'pi pi-calendar',
          routerLink: '/attendance',
        },
        {
          label: 'Leave Management',
          icon: 'pi pi-calendar',
          routerLink: '/hr-leave-management',
        },
        { label: 'Payroll', icon: 'pi pi-money-bill', routerLink: '/payroll' }
      );
    } else if (userRole === 'hr') {
      console.log('Sidebar: Adding HR menu items');
      this.menuItems.push(
        { label: 'Employees', icon: 'pi pi-users', routerLink: '/employees' },
        {
          label: 'Departments',
          icon: 'pi pi-building',
          routerLink: '/departments',
        },
        {
          label: 'Attendance',
          icon: 'pi pi-calendar',
          routerLink: '/attendance',
        },
        {
          label: 'Leave Management',
          icon: 'pi pi-calendar',
          routerLink: '/hr-leave-management',
        }
      );
    } else if (userRole === 'finance') {
      console.log('Sidebar: Adding Finance menu items');
      this.menuItems.push({
        label: 'Payroll',
        icon: 'pi pi-money-bill',
        routerLink: '/payroll',
      });
    } else if (userRole === 'employee') {
      console.log('Sidebar: Adding Employee menu items');
      this.menuItems.push({
        label: 'Leave',
        icon: 'pi pi-calendar',
        routerLink: '/leave',
      });
    } else {
      console.log('Sidebar: Unknown role, adding default employee menu items');
      this.menuItems.push({
        label: 'Leave',
        icon: 'pi pi-calendar',
        routerLink: '/leave',
      });
    }

    console.log('Sidebar: Final menu items:', this.menuItems);
  }
}
