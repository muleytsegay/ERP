import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
// import { MenubarModule } from 'primeng/menubar';
import { ButtonModule } from 'primeng/button';
import { TooltipModule } from 'primeng/tooltip';
import { ToolbarModule } from 'primeng/toolbar';
import { MenuItem } from 'primeng/api';
import { Router } from '@angular/router';
import { User } from '../../features/auth/profile/models/user.model';

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

  constructor(private router: Router) {}

  navigateToProfile(): void {
    this.router.navigate(['/auth/profile']);
  }

  logout(): void {
    this.router.navigate(['/auth/login']);
  }
}
