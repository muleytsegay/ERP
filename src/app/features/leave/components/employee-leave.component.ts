import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  ReactiveFormsModule,
  FormBuilder,
  FormGroup,
  Validators,
} from '@angular/forms';
import { LeaveRequest, LeaveApplication } from '../models/leave.model';
import { LeaveService } from '../services/leave.service';
import { AuthService } from '../../../core/services/auth.service';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { InputTextModule } from 'primeng/inputtext';
import { CalendarModule } from 'primeng/calendar';
import { CardModule } from 'primeng/card';
import { ToastModule } from 'primeng/toast';
import { MessageModule } from 'primeng/message';
import { TagModule } from 'primeng/tag';
import { TextareaModule } from 'primeng/textarea';
import { PanelModule } from 'primeng/panel';
import { MessageService } from 'primeng/api';

@Component({
  selector: 'app-employee-leave',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    TableModule,
    ButtonModule,
    DialogModule,
    InputTextModule,
    CalendarModule,
    CardModule,
    ToastModule,
    MessageModule,
    TagModule,
    TextareaModule,
    PanelModule,
  ],
  providers: [MessageService],
  templateUrl: './employee-leave.component.html',
  styleUrls: ['./employee-leave.component.css'],
})
export class EmployeeLeaveComponent implements OnInit {
  // Data properties
  myLeaves: LeaveRequest[] = [];
  today = new Date();

  // Form properties
  leaveForm!: FormGroup;

  // UI state
  showLeaveModal = false;
  loading = false;
  error = '';
  currentUser: any;

  // Stats
  totalPendingLeaves = 0;
  totalApprovedLeaves = 0;
  totalRejectedLeaves = 0;

  constructor(
    private formBuilder: FormBuilder,
    private messageService: MessageService,
    private leaveService: LeaveService,
    private authService: AuthService
  ) {
    this.initializeForm();
  }

  ngOnInit(): void {
    this.authService.currentUser$.subscribe((user) => {
      this.currentUser = user;
      if (this.currentUser?.id) {
        this.loadMyLeaves();
      } else if (this.currentUser === null) {
        // User is not logged in - don't show error message on initial load
        console.log('EmployeeLeaveComponent: User not authenticated');
      } else {
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'User authentication required',
        });
      }
    });
  }

  private initializeForm(): void {
    this.leaveForm = this.formBuilder.group({
      startDate: [new Date(), Validators.required],
      endDate: [new Date(), Validators.required],
      reason: ['', [Validators.required, Validators.minLength(3)]],
    });

    // Watch for date changes to calculate days
    this.leaveForm
      .get('startDate')
      ?.valueChanges.subscribe(() => this.updateLeaveDays());
    this.leaveForm
      .get('endDate')
      ?.valueChanges.subscribe(() => this.updateLeaveDays());
  }

  loadMyLeaves(): void {
    console.log('EmployeeLeaveComponent: Loading my leaves');
    this.loading = true;

    this.leaveService.getMyLeaves().subscribe({
      next: (leaves) => {
        console.log('EmployeeLeaveComponent: My leaves loaded:', leaves);
        this.myLeaves = leaves;
        this.calculateStats();
        this.loading = false;
      },
      error: (error) => {
        console.error(
          'EmployeeLeaveComponent: Failed to load my leaves:',
          error
        );
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: error.userMessage || 'Failed to load your leave records',
        });
        this.loading = false;
      },
    });
  }

  openLeaveModal(): void {
    this.resetForm();
    this.showLeaveModal = true;
  }

  closeLeaveModal(): void {
    this.showLeaveModal = false;
    this.resetForm();
  }

  onLeaveSubmit(): void {
    console.log('EmployeeLeaveComponent: onLeaveSubmit called');
    console.log('Form valid:', this.leaveForm.valid);
    console.log('Current user:', this.currentUser);
    console.log('User ID:', this.currentUser?.id);
    console.log('Form errors:', this.leaveForm.errors);
    console.log('Form value:', this.leaveForm.value);

    if (!this.currentUser) {
      console.log('EmployeeLeaveComponent: No current user');
      this.messageService.add({
        severity: 'error',
        summary: 'Authentication Error',
        detail: 'Please login to submit leave request',
      });
      return;
    }

    if (!this.currentUser.id) {
      console.log('EmployeeLeaveComponent: No user ID found');
      this.messageService.add({
        severity: 'error',
        summary: 'Authentication Error',
        detail: 'User ID not found. Please contact administrator.',
      });
      return;
    }

    if (!this.leaveForm.valid) {
      console.log('EmployeeLeaveComponent: Form is invalid');
      this.messageService.add({
        severity: 'warn',
        summary: 'Validation Error',
        detail: 'Please fill all required fields correctly',
      });
      return;
    }

    this.loading = true;
    const formValue = this.leaveForm.value;

    const application: LeaveApplication = {
      employeeId: this.currentUser.id,
      startDate: formValue.startDate,
      endDate: formValue.endDate,
      reason: formValue.reason,
    };

    this.leaveService.applyLeave(application).subscribe({
      next: (leave) => {
        console.log(
          'EmployeeLeaveComponent: Leave application submitted:',
          leave
        );
        this.messageService.add({
          severity: 'success',
          summary: 'Success',
          detail: 'Leave application submitted successfully',
        });
        this.closeLeaveModal();
        this.loadMyLeaves();
        this.loading = false;
      },
      error: (error) => {
        console.error(
          'EmployeeLeaveComponent: Failed to submit leave application:',
          error
        );
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: error.userMessage || 'Failed to submit leave application',
        });
        this.loading = false;
      },
    });
  }

  cancelLeave(leave: LeaveRequest): void {
    if (leave.status !== 'pending') {
      this.messageService.add({
        severity: 'warn',
        summary: 'Cannot Cancel',
        detail: 'Only pending leave requests can be cancelled',
      });
      return;
    }

    this.leaveService.cancelLeave(leave.id).subscribe({
      next: (cancelledLeave) => {
        console.log('EmployeeLeaveComponent: Leave cancelled:', cancelledLeave);
        this.messageService.add({
          severity: 'success',
          summary: 'Success',
          detail: 'Leave request cancelled successfully',
        });
        this.loadMyLeaves();
      },
      error: (error) => {
        console.error('EmployeeLeaveComponent: Failed to cancel leave:', error);
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: error.userMessage || 'Failed to cancel leave request',
        });
      },
    });
  }

  // Utility methods
  calculateLeaveDays(): number {
    const startDate = this.leaveForm.get('startDate')?.value;
    const endDate = this.leaveForm.get('endDate')?.value;

    if (startDate && endDate) {
      return this.leaveService.calculateLeaveDays(startDate, endDate);
    }
    return 0;
  }

  updateLeaveDays(): void {
    // This method is called when dates change to update the display
    // The actual calculation is done in the template
  }

  getStatusSeverity(status: string): string {
    switch (status.toLowerCase()) {
      case 'approved':
        return 'success';
      case 'pending':
        return 'warning';
      case 'rejected':
        return 'danger';
      case 'cancelled':
        return 'secondary';
      default:
        return 'info';
    }
  }
  canCancelLeave(leave: LeaveRequest): boolean {
    return leave.status === 'pending';
  }

  private calculateStats(): void {
    this.totalPendingLeaves = this.myLeaves.filter(
      (leave) => leave.status === 'pending'
    ).length;
    this.totalApprovedLeaves = this.myLeaves.filter(
      (leave) => leave.status === 'approved'
    ).length;
    this.totalRejectedLeaves = this.myLeaves.filter(
      (leave) => leave.status === 'rejected'
    ).length;
  }

  private resetForm(): void {
    this.leaveForm.reset({
      startDate: new Date(),
      endDate: new Date(),
      reason: '',
    });
  }
}
