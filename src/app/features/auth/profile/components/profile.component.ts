import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { AuthService } from '../../../../core/services/auth.service';
import { User } from '../models/user.model';
import { CardModule } from 'primeng/card';
import { InputTextModule } from 'primeng/inputtext';
import { PasswordModule } from 'primeng/password';
import { ButtonModule } from 'primeng/button';
import { MessageModule } from 'primeng/message';
import { FloatLabelModule } from 'primeng/floatlabel';
import { DividerModule } from 'primeng/divider';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.css']
})
export class ProfileComponent implements OnInit {
  profileForm: FormGroup;
  passwordForm: FormGroup;
  user: User | null = null;
  loading = false;
  success = '';
  error = '';
  activeTab = 'profile';

  constructor(
    private formBuilder: FormBuilder,
    private authService: AuthService,
    private router: Router
  ) {
    this.profileForm = this.formBuilder.group({
      firstName: ['', [Validators.required]],
      lastName: ['', [Validators.required]],
      email: ['', [Validators.required, Validators.email]],
      username: ['', [Validators.required]]
    });

    this.passwordForm = this.formBuilder.group({
      oldPassword: ['', [Validators.required]],
      newPassword: ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['', [Validators.required]]
    }, { validators: this.passwordMatchValidator });
  }

  ngOnInit(): void {
    this.loadUserProfile();
  }

  loadUserProfile(): void {
    this.authService.currentUser$.subscribe(user => {
      if (user) {
        this.user = user;
        this.profileForm.patchValue({
          firstName: user.firstName,
          lastName: user.lastName,
          email: user.email,
          username: user.username
        });
      }
    });
  }

  get pf() {
    return this.profileForm.controls;
  }

  get pwf() {
    return this.passwordForm.controls;
  }

  passwordMatchValidator(form: FormGroup) {
    const newPassword = form.get('newPassword');
    const confirmPassword = form.get('confirmPassword');
    
    if (newPassword && confirmPassword && newPassword.value !== confirmPassword.value) {
      confirmPassword.setErrors({ passwordMismatch: true });
    } else {
      if (confirmPassword?.errors?.['passwordMismatch']) {
        delete confirmPassword.errors['passwordMismatch'];
        if (Object.keys(confirmPassword.errors).length === 0) {
          confirmPassword.setErrors(null);
        }
      }
    }
    return null;
  }

  setActiveTab(tab: string): void {
    this.activeTab = tab;
    this.clearMessages();
  }

  clearMessages(): void {
    this.success = '';
    this.error = '';
  }

  onUpdateProfile(): void {
    if (this.profileForm.invalid) {
      return;
    }

    this.loading = true;
    this.clearMessages();

    this.authService.updateProfile(this.profileForm.value).subscribe({
      next: (updatedUser) => {
        this.loading = false;
        this.success = 'Profile updated successfully!';
        this.user = updatedUser;
      },
      error: (error) => {
        this.loading = false;
        this.error = error.error?.message || 'Failed to update profile. Please try again.';
      }
    });
  }

  onChangePassword(): void {
    if (this.passwordForm.invalid) {
      return;
    }

    this.loading = true;
    this.clearMessages();

    const { oldPassword, newPassword } = this.passwordForm.value;

    this.authService.changePassword(oldPassword, newPassword).subscribe({
      next: () => {
        this.loading = false;
        this.success = 'Password changed successfully!';
        this.passwordForm.reset();
      },
      error: (error) => {
        this.loading = false;
        this.error = error.error?.message || 'Failed to change password. Please try again.';
      }
    });
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/auth/login']);
  }
}
