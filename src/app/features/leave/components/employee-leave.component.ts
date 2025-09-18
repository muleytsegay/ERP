import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Leave, LeaveBalance, LeaveType, LeaveApplication } from '../models/leave.model';
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
import { DropdownModule } from 'primeng/dropdown';
import { TextareaModule } from 'primeng/textarea';
import { CheckboxModule } from 'primeng/checkbox';
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
    DropdownModule,
    TextareaModule,
    CheckboxModule,
    PanelModule
  ],
  providers: [MessageService],
  templateUrl: './employee-leave.component.html',
  styleUrls: ['./employee-leave.component.css']
})
export class EmployeeLeaveComponent implements OnInit {
  // Data properties
  myLeaves: Leave[] = [];
  leaveBalances: LeaveBalance[] = [];
  leaveTypes: LeaveType[] = [];
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
    this.authService.currentUser$.subscribe(user => {
      this.currentUser = user;
      if (this.currentUser?.employeeId) {
        this.loadMyLeaves();
        this.loadMyLeaveBalances();
        this.loadActiveLeaveTypes();
      } else {
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'User authentication required'
        });
      }
    });
  }

  private initializeForm(): void {
    this.leaveForm = this.formBuilder.group({
      leaveTypeId: ['', Validators.required],
      startDate: [new Date(), Validators.required],
      endDate: [new Date(), Validators.required],
      reason: ['', [Validators.required, Validators.minLength(10)]],
      isEmergency: [false]
    });

    // Watch for date changes to calculate days
    this.leaveForm.get('startDate')?.valueChanges.subscribe(() => this.updateLeaveDays());
    this.leaveForm.get('endDate')?.valueChanges.subscribe(() => this.updateLeaveDays());
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
        console.error('EmployeeLeaveComponent: Failed to load my leaves:', error);
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: error.userMessage || 'Failed to load your leave records'
        });
        this.loading = false;
      }
    });
  }

  loadMyLeaveBalances(): void {
    console.log('EmployeeLeaveComponent: Loading my leave balances');
    
    this.leaveService.getMyLeaveBalance().subscribe({
      next: (balances) => {
        console.log('EmployeeLeaveComponent: My leave balances loaded:', balances);
        this.leaveBalances = balances;
      },
      error: (error) => {
        console.error('EmployeeLeaveComponent: Failed to load my leave balances:', error);
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: error.userMessage || 'Failed to load your leave balance'
        });
      }
    });
  }

  loadActiveLeaveTypes(): void {
    console.log('EmployeeLeaveComponent: Loading active leave types');
    
    this.leaveService.getActiveLeaveTypes().subscribe({
      next: (types) => {
        console.log('EmployeeLeaveComponent: Active leave types loaded:', types);
        this.leaveTypes = types.filter(type => type.allowedForEmployees);
      },
      error: (error) => {
        console.error('EmployeeLeaveComponent: Failed to load leave types:', error);
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: error.userMessage || 'Failed to load leave types'
        });
      }
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
    if (this.leaveForm.valid && this.currentUser?.employeeId) {
      this.loading = true;
      const formValue = this.leaveForm.value;
      
      // Check leave balance before applying
      const selectedLeaveType = this.leaveTypes.find(type => type.id === formValue.leaveTypeId);
      const leaveBalance = this.leaveBalances.find(balance => balance.leaveTypeId === formValue.leaveTypeId);
      const requestedDays = this.calculateLeaveDays();
      
      if (leaveBalance && requestedDays > leaveBalance.totalRemaining && !formValue.isEmergency) {
        this.messageService.add({
          severity: 'warn',
          summary: 'Insufficient Balance',
          detail: `You only have ${leaveBalance.totalRemaining} days remaining for ${selectedLeaveType?.name}`
        });
        this.loading = false;
        return;
      }
      
      const application: LeaveApplication = {
        employeeId: this.currentUser.employeeId,
        leaveTypeId: formValue.leaveTypeId,
        startDate: formValue.startDate,
        endDate: formValue.endDate,
        reason: formValue.reason,
        isEmergency: formValue.isEmergency
      };

      this.leaveService.applyLeave(application).subscribe({
        next: (leave) => {
          console.log('EmployeeLeaveComponent: Leave application submitted:', leave);
          this.messageService.add({
            severity: 'success',
            summary: 'Success',
            detail: 'Leave application submitted successfully'
          });
          this.closeLeaveModal();
          this.loadMyLeaves();
          this.loadMyLeaveBalances();
          this.loading = false;
        },
        error: (error) => {
          console.error('EmployeeLeaveComponent: Failed to submit leave application:', error);
          this.messageService.add({
            severity: 'error',
            summary: 'Error',
            detail: error.userMessage || 'Failed to submit leave application'
          });
          this.loading = false;
        }
      });
    } else {
      this.messageService.add({
        severity: 'warn',
        summary: 'Warning',
        detail: 'Please fill all required fields correctly'
      });
    }
  }

  cancelLeave(leave: Leave): void {
    if (leave.status !== 'pending') {
      this.messageService.add({
        severity: 'warn',
        summary: 'Cannot Cancel',
        detail: 'Only pending leave requests can be cancelled'
      });
      return;
    }

    this.leaveService.cancelLeave(leave.id).subscribe({
      next: (cancelledLeave) => {
        console.log('EmployeeLeaveComponent: Leave cancelled:', cancelledLeave);
        this.messageService.add({
          severity: 'success',
          summary: 'Success',
          detail: 'Leave request cancelled successfully'
        });
        this.loadMyLeaves();
        this.loadMyLeaveBalances();
      },
      error: (error) => {
        console.error('EmployeeLeaveComponent: Failed to cancel leave:', error);
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: error.userMessage || 'Failed to cancel leave request'
        });
      }
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
      case 'approved': return 'success';
      case 'pending': return 'warning';
      case 'rejected': return 'danger';
      case 'cancelled': return 'secondary';
      default: return 'info';
    }
  }

  getLeaveTypeName(leaveTypeId: string): string {
    const leaveType = this.leaveTypes.find(type => type.id === leaveTypeId);
    return leaveType?.name || 'Unknown';
  }

  getRemainingBalance(leaveTypeId: string): number {
    const balance = this.leaveBalances.find(b => b.leaveTypeId === leaveTypeId);
    return balance?.totalRemaining || 0;
  }

  canCancelLeave(leave: Leave): boolean {
    return leave.status === 'pending';
  }

  private calculateStats(): void {
    this.totalPendingLeaves = this.myLeaves.filter(leave => leave.status === 'pending').length;
    this.totalApprovedLeaves = this.myLeaves.filter(leave => leave.status === 'approved').length;
    this.totalRejectedLeaves = this.myLeaves.filter(leave => leave.status === 'rejected').length;
  }

  private resetForm(): void {
    this.leaveForm.reset({
      leaveTypeId: '',
      startDate: new Date(),
      endDate: new Date(),
      reason: '',
      isEmergency: false
    });
  }
}
