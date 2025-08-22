import { Component, HostListener, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { User } from '../../features/auth/profile/models/user.model';

@Component({
  selector: 'app-topbar',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './topbar.component.html',
  styleUrls: ['./topbar.component.css'],
})
export class TopbarComponent implements OnInit {
  isMenuOpen = false;
  currentUser: User | null = null;
  isAuthenticated = true;

  constructor(private authService: AuthService, private router: Router) {}

  ngOnInit(): void {
    // For now, using dummy data. Uncomment later for real implementation:
    // this.authService.currentUser$.subscribe((user) => {
    //   this.currentUser = user;
    //   this.isAuthenticated = !!user;
    // });
    // this.isAuthenticated = this.authService.isAuthenticated();
  }

  toggleMenu(event?: Event): void {
    if (event) {
      event.stopPropagation(); // Prevent the click from immediately closing the menu
    }
    this.isMenuOpen = !this.isMenuOpen;
  }

  closeMenu(): void {
    this.isMenuOpen = false;
  }

  onProfile(): void {
    this.router.navigate(['/profile']);
    this.closeMenu();
  }
  // Add this method to your TopbarComponent
  onSettings(): void {
    this.router.navigate(['/settings']);
    this.closeMenu();
  }

  onLogin(): void {
    this.router.navigate(['/auth/login']);
    this.closeMenu();
  }

  onLogout(): void {
    this.authService.logout();
    this.router.navigate(['/auth/login']);
    this.closeMenu();
  }

  getUserInitials(): string {
    if (!this.currentUser) return 'MY'; // Default initials if no user is logged in
    return (
      this.currentUser.firstName[0] + this.currentUser.lastName[0]
    ).toUpperCase();
  }

  getUserName(): string {
    if (!this.currentUser) return 'Muruts Yifter';
    return `${this.currentUser.firstName} ${this.currentUser.lastName}`;
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: Event): void {
    if (this.isMenuOpen) {
      this.closeMenu();
    }
  }
}
