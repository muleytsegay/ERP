// import { Component, OnInit } from '@angular/core';
// import { CommonModule } from '@angular/common';
// import { RouterOutlet, RouterModule, Router } from '@angular/router';
// import { AuthService } from './shared/services/auth.service';
// import { User } from './features/auth/profile/models/user.model';
// import { MenubarModule } from 'primeng/menubar';
// import { ButtonModule } from 'primeng/button';
// import { TooltipModule } from 'primeng/tooltip';
// import { MenuItem } from 'primeng/api';
// import { SidabarComponent } from './layout/sidabar/sidabar.component';

// @Component({
//   selector: 'app-root',
//   standalone: true,
//   imports: [CommonModule, RouterOutlet, RouterModule, MenubarModule, ButtonModule, TooltipModule, SidabarComponent],
//   templateUrl: './app.component.html',
//   styleUrls: ['./app.component.css']
// })
// export class AppComponent implements OnInit {
//   title = 'ERP System';
//   currentUser: User | null = null;
//   menuItems: MenuItem[] = [];

//   constructor(
//     private authService: AuthService,
//     private router: Router
//   ) {}

//   ngOnInit(): void {
//     this.authService.currentUser$.subscribe(user => {
//       this.currentUser = user;
//       if (user) {
//         this.initializeMenu();
//       }
//     });
//   }

//   initializeMenu(): void {
//     this.menuItems = [
//       {
//         label: 'Dashboard',
//         icon: 'pi pi-home',
//         command: () => this.router.navigate(['/dashboard'])
//       },
//       {
//         label: 'Attendance',
//         icon: 'pi pi-calendar',
//         command: () => this.router.navigate(['/attendance'])
//       },
//       {
//         label: 'Employees',
//         icon: 'pi pi-users',
//         command: () => this.router.navigate(['/employees'])
//       },
//       {
//         label: 'Departments',
//         icon: 'pi pi-building',
//         command: () => this.router.navigate(['/departments'])
//       },
//       {
//         label: 'Payroll',
//         icon: 'pi pi-money-bill',
//         items: [
//           {
//             label: 'Employee Management',
//             icon: 'pi pi-user',
//             command: () => this.router.navigate(['/payroll/employees'])
//           },
//           {
//             label: 'Salary Calculation',
//             icon: 'pi pi-calculator',
//             command: () => this.router.navigate(['/payroll/salary-calculation'])
//           },
//           {
//             label: 'Payslips',
//             icon: 'pi pi-file',
//             command: () => this.router.navigate(['/payroll/payslips'])
//           }
//         ]
//       }
//     ];
//   }

//   logout(): void {
//     this.authService.logout();
//     this.router.navigate(['/auth/login']);
//   }

//   navigateToProfile(): void {
//     this.router.navigate(['/auth/profile']);
//   }

//   isAuthenticated(): boolean {
//     return this.authService.isAuthenticated();
//   }
// }
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router, RouterOutlet } from '@angular/router';
import { AuthService } from './core/services/auth.service';
import { TopbarComponent } from './layout/topbar/topbar.component';
import { SidabarComponent } from './layout/sidabar/sidabar.component';
import { User } from './features/auth/profile/models/user.model';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterOutlet, RouterModule, TopbarComponent, SidabarComponent],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
})
export class AppComponent implements OnInit {
  isCollapsed = false;
  isLoading = true;
  currentUser: User | null = null;

  constructor(private authService: AuthService, private router: Router) {}

  ngOnInit(): void {
    console.log('AppComponent initializing...');
    
    // Subscribe to current user changes
    this.authService.currentUser$.subscribe(user => {
      console.log('AppComponent: User changed:', user);
      this.currentUser = user;
      this.isLoading = false;
      
      if (!user) {
        // No user, redirect to login if not already on auth page
        const currentUrl = this.router.url;
        if (!currentUrl.startsWith('/auth/')) {
          this.router.navigate(['/auth/login']);
        }
      }
    });

    // The AuthService already loads user from storage in its constructor
    // So we just need to wait for the subscription to trigger
  }

  toggleSidebar() {
    this.isCollapsed = !this.isCollapsed;
  }

  isAuthenticated(): boolean {
    const hasToken = this.authService.isAuthenticated();
    const hasUser = !!this.currentUser;
    console.log('AppComponent isAuthenticated: token=', hasToken, 'user=', hasUser);
    return hasToken && hasUser;
  }
}
