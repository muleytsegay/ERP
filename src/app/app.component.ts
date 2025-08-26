import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet, RouterModule, Router } from '@angular/router';
import { AuthService } from './shared/services/auth.service';
import { User } from './features/auth/profile/models/user.model';

// Import your new standalone components
import { TopbarComponent } from './components/topbar/topbar.component';
import { SidebarComponent } from './components/sidebar/sidebar.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    CommonModule,
    RouterOutlet,
    RouterModule,
    TopbarComponent,
    SidebarComponent,
  ],
  templateUrl: './app.component.html',

  styleUrl: './app.component.css',
})
export class AppComponent implements OnInit {
  title = 'ERP System';
  currentUser: User | null = null;

  constructor(private authService: AuthService, private router: Router) {}

  ngOnInit(): void {
    this.authService.currentUser$.subscribe((user) => {
      this.currentUser = user;
      if (user) {
        this.initializeMenu();
      }
    });
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
