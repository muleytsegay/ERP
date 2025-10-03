import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  ReactiveFormsModule,
  FormBuilder,
  FormGroup,
  Validators,
} from '@angular/forms';
import {
  LeaveRequest,
  LeaveApproval,
  LeaveStats,
  EmployeeLeaveStats,
} from '../models/leave.model';
import { LeaveService } from '../services/leave.service';
import { AuthService } from '../../../core/services/auth.service';
import { EmployeeService } from '../../employee/services/employee.service';
import { Employee } from '../../employee/models/employee.model';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { InputTextModule } from 'primeng/inputtext';
import { CalendarModule } from 'primeng/calendar';
import { CardModule } from 'primeng/card';
import { ToastModule } from 'primeng/toast';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { MessageModule } from 'primeng/message';
import { TagModule } from 'primeng/tag';
import { DropdownModule } from 'primeng/dropdown';
import { TextareaModule } from 'primeng/textarea';
import { RadioButtonModule } from 'primeng/radiobutton';
import { CheckboxModule } from 'primeng/checkbox';
import { PanelModule } from 'primeng/panel';
import { TabViewModule } from 'primeng/tabview';
import { ChartModule } from 'primeng/chart';
import { TooltipModule } from 'primeng/tooltip';
import { MessageService, ConfirmationService } from 'primeng/api';

@Component({
  selector: 'app-hr-leave-management',
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
    ConfirmDialogModule,
    MessageModule,
    TagModule,
    DropdownModule,
    TextareaModule,
    CheckboxModule,
    PanelModule,
    TabViewModule,
    ChartModule,
    TooltipModule,
  ],
  providers: [MessageService, ConfirmationService],
  templateUrl: './hr-leave-management.component.html',
  styleUrls: ['./hr-leave-management.component.css'],
})
export class HrLeaveManagementComponent implements OnInit {
  // Data properties
  allLeaves: LeaveRequest[] = [];
  pendingLeaves: LeaveRequest[] = [];
  employees: Employee[] = [];
  leaveStats: LeaveStats | null = null;
  employeeLeaveStats: EmployeeLeaveStats[] = [];

  // Form properties
  approvalForm!: FormGroup;
  leaveTypeForm!: FormGroup;
  filterForm!: FormGroup;

  // UI state
  showApprovalModal = false;
  showLeaveTypeModal = false;
  showViewModal = false;
  selectedLeave: LeaveRequest | null = null;
  isEditingLeaveType = false;
  editingLeaveTypeId = '';
  loading = false;
  activeTab = 0;

  // Filter options
  statusOptions = [
    { label: 'All', value: null },
    { label: 'Pending', value: 'pending' },
    { label: 'Approved', value: 'approved' },
    { label: 'Rejected', value: 'rejected' },
    { label: 'Cancelled', value: 'cancelled' },
  ];

  employeeOptions: { label: string; value: string }[] = [];
  leaveTypeOptions: { label: string; value: string }[] = [];

  // Chart data
  leaveChartData: any;
  leaveChartOptions: any;

  constructor(
    private readonly formBuilder: FormBuilder,
    private readonly messageService: MessageService,
    private readonly confirmationService: ConfirmationService,
    private readonly leaveService: LeaveService,
    private readonly authService: AuthService,
    private readonly employeeService: EmployeeService
  ) {
    this.initializeForms();
    this.setupChartOptions();
  }

  ngOnInit(): void {
    // Initialize current user
    this.currentUser = this.authService.getCurrentUser();
    console.log('HrLeaveManagementComponent: Current user:', this.currentUser);

    // Check if user has HR permissions
    if (!this.leaveService.canManageLeaves()) {
      this.messageService.add({
        severity: 'error',
        summary: 'Access Denied',
        detail: 'You do not have permission to access this page',
      });
      return;
    }

    this.loadInitialData();
  }

  private initializeForms(): void {
    this.approvalForm = this.formBuilder.group({
      action: ['', Validators.required],
      comments: [''],
    });

    // Add dynamic validation for comments based on action
    this.approvalForm.get('action')?.valueChanges.subscribe((action) => {
      const commentsControl = this.approvalForm.get('comments');
      if (action === 'reject') {
        commentsControl?.setValidators([Validators.required]);
      } else {
        commentsControl?.clearValidators();
      }
      commentsControl?.updateValueAndValidity();
    });

    this.leaveTypeForm = this.formBuilder.group({
      name: ['', Validators.required],
      description: [''],
      maxDaysPerYear: [0, [Validators.required, Validators.min(1)]],
      carryForwardAllowed: [false],
      maxCarryForward: [0],
      requiresApproval: [true],
      allowedForEmployees: [true],
      minimumNoticeRays: [1, [Validators.required, Validators.min(0)]],
      isActive: [true],
    });

    this.filterForm = this.formBuilder.group({
      employeeId: [null],
      leaveTypeId: [null],
      status: [null],
      startDate: [null],
      endDate: [null],
    });
  }

  private setupChartOptions(): void {
    this.leaveChartOptions = {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          position: 'bottom',
        },
      },
    };
  }

  private loadInitialData(): void {
    this.loadAllLeaves();
    this.loadPendingLeaves();
    this.loadEmployees();
    this.loadLeaveStats();
    this.loadEmployeeLeaveStats();
  }

  loadAllLeaves(): void {
    console.log('HrLeaveManagementComponent: Loading all leaves');
    this.loading = true;

    this.leaveService.getLeaves().subscribe({
      next: (leaves) => {
        console.log('HrLeaveManagementComponent: All leaves loaded:', leaves);
        this.allLeaves = leaves;
        this.updateChartData();
        this.loading = false;
      },
      error: (error) => {
        console.error(
          'HrLeaveManagementComponent: Failed to load leaves:',
          error
        );
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: error.userMessage || 'Failed to load leave records',
        });
        this.loading = false;
      },
    });
  }

  loadPendingLeaves(): void {
    console.log('HrLeaveManagementComponent: Loading pending leaves');

    this.leaveService.getPendingLeaves().subscribe({
      next: (leaves) => {
        console.log(
          'HrLeaveManagementComponent: Pending leaves loaded:',
          leaves
        );
        console.log(
          'HrLeaveManagementComponent: Number of pending leaves:',
          leaves.length
        );
        leaves.forEach((leave, index) => {
          console.log(`Leave ${index + 1}:`, {
            id: leave.id,
            employeeId: leave.employeeId,
            status: leave.status,
            startDate: leave.startDate,
            endDate: leave.endDate,
            reason: leave.reason,
          });
        });
        this.pendingLeaves = leaves;
      },
      error: (error) => {
        console.error(
          'HrLeaveManagementComponent: Failed to load pending leaves:',
          error
        );
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: error.userMessage || 'Failed to load pending leaves',
        });
      },
    });
  }

  loadEmployees(): void {
    console.log('HrLeaveManagementComponent: Loading employees');

    this.employeeService.getEmployees().subscribe({
      next: (employees) => {
        console.log('HrLeaveManagementComponent: Employees loaded:', employees);
        this.employees = employees;
        this.employeeOptions = employees.map((emp) => ({
          label: `${emp.firstName} ${emp.lastName} - ${emp.department}`,
          value: emp.id,
        }));
      },
      error: (error) => {
        console.error(
          'HrLeaveManagementComponent: Failed to load employees:',
          error
        );
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: error.userMessage || 'Failed to load employees',
        });
      },
    });
  }

  loadLeaveStats(): void {
    console.log('HrLeaveManagementComponent: Loading leave statistics');

    this.leaveService.getLeaveStats().subscribe({
      next: (stats) => {
        console.log(
          'HrLeaveManagementComponent: Leave statistics loaded:',
          stats
        );
        this.leaveStats = stats;
      },
      error: (error) => {
        console.error(
          'HrLeaveManagementComponent: Failed to load leave statistics:',
          error
        );
        // Don't show error for stats as it's not critical
      },
    });
  }

  loadEmployeeLeaveStats(): void {
    console.log(
      'HrLeaveManagementComponent: Loading employee leave statistics'
    );

    this.leaveService.getEmployeeLeaveStats().subscribe({
      next: (stats) => {
        console.log(
          'HrLeaveManagementComponent: Employee leave statistics loaded:',
          stats
        );
        this.employeeLeaveStats = stats;
      },
      error: (error) => {
        console.error(
          'HrLeaveManagementComponent: Failed to load employee leave statistics:',
          error
        );
        // Don't show error for stats as it's not critical
      },
    });
  }

  // Leave Approval Methods
  openApprovalModal(leave: LeaveRequest, action: 'approve' | 'reject'): void {
    this.selectedLeave = leave;
    this.approvalForm.patchValue({
      action: action,
      comments: '',
    });
    this.showApprovalModal = true;
  }

  closeApprovalModal(): void {
    this.showApprovalModal = false;
    this.selectedLeave = null;
    this.approvalForm.reset();
  }

  currentUser: any;

  onApprovalSubmit(): void {
    if (this.approvalForm.valid && this.selectedLeave && this.currentUser) {
      this.loading = true;
      const formValue = this.approvalForm.value;
      const approval: LeaveApproval = {
        leaveId: this.selectedLeave.id,
        action: formValue.action,
        comments: formValue.comments,
        approvedBy: this.currentUser?.employeeId || this.currentUser?.id || '',
      };

      const actionMethod =
        formValue.action === 'approve'
          ? this.leaveService.approveLeave(approval)
          : this.leaveService.rejectLeave(approval);

      actionMethod.subscribe({
        next: (leave) => {
          console.log(
            'HrLeaveManagementComponent: Leave action completed:',
            leave
          );
          this.messageService.add({
            severity: 'success',
            summary: 'Success',
            detail: `Leave request ${formValue.action}d successfully`,
          });
          this.closeApprovalModal();
          this.loadAllLeaves();
          this.loadPendingLeaves();
          this.loadLeaveStats();
          this.loading = false;
        },
        error: (error) => {
          console.error(
            'HrLeaveManagementComponent: Failed to process leave action:',
            error
          );
          this.messageService.add({
            severity: 'error',
            summary: 'Error',
            detail:
              error.userMessage ||
              `Failed to ${formValue.action} leave request`,
          });
          this.loading = false;
        },
      });
    }
  }

  // View Methods
  viewLeaveDetails(leave: LeaveRequest): void {
    this.selectedLeave = leave;
    this.showViewModal = true;
  }

  closeViewModal(): void {
    this.showViewModal = false;
    this.selectedLeave = null;
  }

  // Utility Methods
  getEmployeeName(employeeId: string): string {
    const employee = this.employees.find((emp) => emp.id === employeeId);
    return employee
      ? `${employee.firstName} ${employee.lastName}`
      : 'Unknown Employee';
  }

  getEmployeeDepartment(employeeId: string): string {
    const employee = this.employees.find((emp) => emp.id === employeeId);
    return employee?.department || 'Unknown Department';
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

  canApprove(leave: LeaveRequest): boolean {
    const result =
      leave.status === 'pending' && this.leaveService.canApproveLeaves();
    console.log('HR Component: canApprove check:', {
      leaveId: leave.id,
      leaveStatus: leave.status,
      isPending: leave.status === 'pending',
      canApproveLeaves: this.leaveService.canApproveLeaves(),
      result: result,
    });
    return result;
  }

  private updateChartData(): void {
    const statusCounts = {
      pending: this.allLeaves.filter((l) => l.status === 'pending').length,
      approved: this.allLeaves.filter((l) => l.status === 'approved').length,
      rejected: this.allLeaves.filter((l) => l.status === 'rejected').length,
      cancelled: this.allLeaves.filter((l) => l.status === 'cancelled').length,
    };

    this.leaveChartData = {
      labels: ['Pending', 'Approved', 'Rejected', 'Cancelled'],
      datasets: [
        {
          data: [
            statusCounts.pending,
            statusCounts.approved,
            statusCounts.rejected,
            statusCounts.cancelled,
          ],
          backgroundColor: ['#FFA726', '#66BB6A', '#EF5350', '#78909C'],
          hoverBackgroundColor: ['#FF9800', '#4CAF50', '#F44336', '#607D8B'],
        },
      ],
    };
  }

  // Filter Methods
  applyFilters(): void {
    // Implementation for filtering leaves based on form values
    // This would filter the allLeaves array based on the filter form values
    console.log('Applying filters:', this.filterForm.value);
  }

  clearFilters(): void {
    this.filterForm.reset();
    this.applyFilters();
  }

  exportReport(): void {
    // Implementation for exporting leave report
    console.log('Exporting leave report');
    this.messageService.add({
      severity: 'info',
      summary: 'Export',
      detail: 'Report export functionality to be implemented',
    });
  }
}
