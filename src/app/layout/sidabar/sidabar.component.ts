
import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MenuModule } from 'primeng/menu';
import { MenuItem } from 'primeng/api';

@Component({
  selector: 'app-sidabar',
  standalone: true,
  imports: [CommonModule, RouterModule, MenuModule],
  templateUrl: './sidabar.component.html',
  styleUrls: ['./sidabar.component.css']
})
export class SidabarComponent {
  menuItems: MenuItem[] = [
    { label: 'Dashboard', icon: 'pi pi-home', routerLink: '/dashboard' },
    { label: 'Employees', icon: 'pi pi-users', routerLink: '/employees' },
    { label: 'Departments', icon: 'pi pi-building', routerLink: '/departments' },
    { label: 'Attendance', icon: 'pi pi-calendar', routerLink: '/attendance' },
    { label: 'Profile', icon: 'pi pi-user', routerLink: '/auth/profile' },
    // Add more as needed
  ];
}
