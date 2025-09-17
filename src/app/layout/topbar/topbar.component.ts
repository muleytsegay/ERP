import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
// import { MenubarModule } from 'primeng/menubar';
import { ButtonModule } from 'primeng/button';
import { TooltipModule } from 'primeng/tooltip';
import { ToolbarModule } from 'primeng/toolbar';
import { MenuItem } from 'primeng/api';
import { Router } from '@angular/router';
import { User } from '../../features/auth/profile/models/user.model';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-topbar',
  standalone: true,
  imports: [CommonModule, ToolbarModule, ButtonModule, TooltipModule],
  templateUrl: './topbar.component.html',
  styleUrls: ['./topbar.component.css'],
})
export class TopbarComponent {
  @Input() currentUser: User | null = null;
  @Input() menuItems: MenuItem[] = [];

  constructor(
    private router: Router,
    private authService: AuthService
  ) {}

  navigateToProfile(): void {
    this.router.navigate(['/auth/profile']);
  }

  logout(): void {
    console.log('TopbarComponent: User clicked logout button');
    console.log('TopbarComponent: Current user:', this.currentUser);
    
    this.authService.logout().subscribe({
      next: () => {
        console.log('TopbarComponent: Logout successful, navigating to login');
        this.router.navigate(['/auth/login']);
      },
      error: (error) => {
        console.error('TopbarComponent: Logout failed, but navigating to login anyway:', error);
        // Navigate to login even if logout fails (user still logged out locally)
        this.router.navigate(['/auth/login']);
      }
    });
  }
}
