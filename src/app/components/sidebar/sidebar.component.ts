import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterLinkActive } from '@angular/router'; // Import for routing

interface MenuItem {
  label: string;
  route: string;
  icon: string;
  badge?: string;
}

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive],
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.css'],
})
export class SidebarComponent {
  menuItems: MenuItem[] = [
    { label: 'Dashboard', route: '/dashboard', icon: 'fas fa-tachometer-alt' },
    { label: 'Employees', route: '/employees', icon: 'fas fa-users' },
    {
      label: 'Attendance',
      route: '/attendance',
      icon: 'fas fa-calendar-check',
    },
    { label: 'Payroll', route: '/payroll', icon: 'fas fa-money-check' },
    { label: 'Departments', route: '/departments', icon: 'fas fa-building' },

    // { label: 'Recruitment', route: '/recruitment', icon: 'fas fa-briefcase' },
    // {
    //   label: 'Leave Management',
    //   route: '/leave',
    //   icon: 'fas fa-calendar-minus',
    // },
    // { label: 'Performance', route: '/performance', icon: 'fas fa-chart-line' },
    // { label: 'Compliance', route: '/compliance', icon: 'fas fa-file-contract' },
  ];
}
