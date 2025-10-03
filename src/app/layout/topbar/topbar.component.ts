import { Component, Input, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
// import { MenubarModule } from 'primeng/menubar';
import { ButtonModule } from 'primeng/button';
import { TooltipModule } from 'primeng/tooltip';
import { ToolbarModule } from 'primeng/toolbar';
import { MenuItem } from 'primeng/api';
import { Router } from '@angular/router';
import { User } from '../../features/auth/profile/models/user.model';
import { AuthService } from '../../core/services/auth.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-topbar',
  standalone: true,
  imports: [CommonModule, ToolbarModule, ButtonModule, TooltipModule],
  templateUrl: './topbar.component.html',
  styleUrls: ['./topbar.component.css'],
})
export class TopbarComponent implements OnInit, OnDestroy {
  user: User | null = null;
  @Input() menuItems: MenuItem[] = [];
  private userSubscription?: Subscription;

  constructor(private router: Router, private authService: AuthService) {}

  ngOnInit(): void {
    // Subscribe to current user changes
    this.userSubscription = this.authService.currentUser$.subscribe((user) => {
      console.log('TopbarComponent: User changed:', user);
      this.user = user;
    });
  }

  ngOnDestroy(): void {
    if (this.userSubscription) {
      this.userSubscription.unsubscribe();
    }
  }

  get userDisplayName(): string {
    if (!this.user) return 'Guest';
    return (
      `${this.user.firstName} ${this.user.lastName}`.trim() ||
      this.user.username ||
      this.user.email
    );
  }

  navigateToProfile(): void {
    console.log('TopbarComponent: Attempting to navigate to profile');
    console.log('TopbarComponent: Current user:', this.user);
    if (this.user) {
      console.log('TopbarComponent: Current user role:', this.user.role);
    }
    this.router.navigate(['/auth/profile']);
  }

  logout(): void {
    console.log('TopbarComponent: User clicked logout button');
    console.log('TopbarComponent: Current user:', this.user);

    this.authService.logout();
    console.log('TopbarComponent: Logout completed, navigating to login');
    this.router.navigate(['/auth/login']);
  }
}
