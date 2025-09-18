import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Leave, LeaveType, LeaveApproval, LeaveStats, EmployeeLeaveStats } from '../models/leave.model';
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
import { CheckboxModule } from 'primeng/checkbox';
import { PanelModule } from 'primeng/panel';
import { TabViewModule } from 'primeng/tabview';
import { ChartModule } from 'primeng/chart';
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
    ChartModule
  ],
  providers: [MessageService, ConfirmationService],
  templateUrl: './hr-leave-management.component.html',
  styleUrls: ['./hr-leave-management.component.css']
})
export class HrLeaveManagementComponent implements OnInit {
  // Data properties
  allLeaves: Leave[] = [];
  pendingLeaves: Leave[] = [];
  leaveTypes: LeaveType[] = [];
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
  selectedLeave: Leave | null = null;
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
    { label: 'Cancelled', value: 'cancelled' }
  ];

  employeeOptions: { label: string; value: string }[] = [];
  leaveTypeOptions: { label: string; value: string }[] = [];

  // Chart data
  leaveChartData: any;
  leaveChartOptions: any;

  constructor(
    private formBuilder: FormBuilder,
    private messageService: MessageService,
    private confirmationService: ConfirmationService,
    private leaveService: LeaveService,
    private authService: AuthService,
    private employeeService: EmployeeService
  ) {
    this.initializeForms();
    this.setupChartOptions();
  }

  ngOnInit(): void {
    // Check if user has HR permissions
    if (!this.leaveService.canManageLeaves()) {
      this.messageService.add({
        severity: 'error',
        summary: 'Access Denied',
        detail: 'You do not have permission to access this page'
      });
      return;
    }

    this.loadInitialData();
  }

  private initializeForms(): void {
    this.approvalForm = this.formBuilder.group({
      action: ['', Validators.required],
      comments: ['', Validators.required]
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
      isActive: [true]
    });

    this.filterForm = this.formBuilder.group({
      employeeId: [null],
      leaveTypeId: [null],
      status: [null],
      startDate: [null],
      endDate: [null]
    });
  }

  private setupChartOptions(): void {
    this.leaveChartOptions = {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          position: 'bottom'
        }
      }
    };
  }

  private loadInitialData(): void {
    this.loadAllLeaves();
    this.loadPendingLeaves();
    this.loadLeaveTypes();
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
        console.error('HrLeaveManagementComponent: Failed to load leaves:', error);
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: error.userMessage || 'Failed to load leave records'
        });
        this.loading = false;
      }
    });
  }

  loadPendingLeaves(): void {
    console.log('HrLeaveManagementComponent: Loading pending leaves');
    
    this.leaveService.getPendingLeaves().subscribe({
      next: (leaves) => {
        console.log('HrLeaveManagementComponent: Pending leaves loaded:', leaves);
        this.pendingLeaves = leaves;
      },
      error: (error) => {
        console.error('HrLeaveManagementComponent: Failed to load pending leaves:', error);
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: error.userMessage || 'Failed to load pending leaves'
        });
      }
    });
  }

  loadLeaveTypes(): void {
    console.log('HrLeaveManagementComponent: Loading leave types');
    
    this.leaveService.getLeaveTypes().subscribe({
      next: (types) => {
        console.log('HrLeaveManagementComponent: Leave types loaded:', types);
        this.leaveTypes = types;
        this.leaveTypeOptions = types.map(type => ({
          label: type.name,
          value: type.id
        }));
      },
      error: (error) => {
        console.error('HrLeaveManagementComponent: Failed to load leave types:', error);
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: error.userMessage || 'Failed to load leave types'
        });
      }
    });
  }

  loadEmployees(): void {
    console.log('HrLeaveManagementComponent: Loading employees');
    
    this.employeeService.getEmployees().subscribe({
      next: (employees) => {
        console.log('HrLeaveManagementComponent: Employees loaded:', employees);
        this.employees = employees;
        this.employeeOptions = employees.map(emp => ({
          label: `${emp.firstName} ${emp.lastName} - ${emp.department}`,
          value: emp.id
        }));
      },
      error: (error) => {
        console.error('HrLeaveManagementComponent: Failed to load employees:', error);
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: error.userMessage || 'Failed to load employees'
        });
      }
    });
  }

  loadLeaveStats(): void {
    console.log('HrLeaveManagementComponent: Loading leave statistics');
    
    this.leaveService.getLeaveStats().subscribe({
      next: (stats) => {
        console.log('HrLeaveManagementComponent: Leave statistics loaded:', stats);
        this.leaveStats = stats;
      },
      error: (error) => {
        console.error('HrLeaveManagementComponent: Failed to load leave statistics:', error);
        // Don't show error for stats as it's not critical
      }
    });
  }

  loadEmployeeLeaveStats(): void {
    console.log('HrLeaveManagementComponent: Loading employee leave statistics');
    
    this.leaveService.getEmployeeLeaveStats().subscribe({
      next: (stats) => {
        console.log('HrLeaveManagementComponent: Employee leave statistics loaded:', stats);
        this.employeeLeaveStats = stats;
      },
      error: (error) => {
        console.error('HrLeaveManagementComponent: Failed to load employee leave statistics:', error);
        // Don't show error for stats as it's not critical
      }
    });
  }

  // Leave Approval Methods
  openApprovalModal(leave: Leave, action: 'approve' | 'reject'): void {
    this.selectedLeave = leave;
    this.approvalForm.patchValue({
      action: action,
      comments: ''
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
        approvedBy: this.currentUser?.employeeId || this.currentUser?.id || ''
      };

      const actionMethod = formValue.action === 'approve' 
        ? this.leaveService.approveLeave(approval)
        : this.leaveService.rejectLeave(approval);

      actionMethod.subscribe({
        next: (leave) => {
          console.log('HrLeaveManagementComponent: Leave action completed:', leave);
          this.messageService.add({
            severity: 'success',
            summary: 'Success',
            detail: `Leave request ${formValue.action}d successfully`
          });
          this.closeApprovalModal();
          this.loadAllLeaves();
          this.loadPendingLeaves();
          this.loadLeaveStats();
          this.loading = false;
        },
        error: (error) => {
          console.error('HrLeaveManagementComponent: Failed to process leave action:', error);
          this.messageService.add({
            severity: 'error',
            summary: 'Error',
            detail: error.userMessage || `Failed to ${formValue.action} leave request`
          });
          this.loading = false;
        }
      });
    }
  }

  // Leave Type Management
  openLeaveTypeModal(leaveType?: LeaveType): void {
    this.isEditingLeaveType = !!leaveType;
    this.editingLeaveTypeId = leaveType?.id || '';
    
    if (leaveType) {
      this.leaveTypeForm.patchValue(leaveType);
    } else {
      this.leaveTypeForm.reset({
        name: '',
        description: '',
        maxDaysPerYear: 0,
        carryForwardAllowed: false,
        maxCarryForward: 0,
        requiresApproval: true,
        allowedForEmployees: true,
        minimumNoticeRays: 1,
        isActive: true
      });
    }
    
    this.showLeaveTypeModal = true;
  }

  closeLeaveTypeModal(): void {
    this.showLeaveTypeModal = false;
    this.isEditingLeaveType = false;
    this.editingLeaveTypeId = '';
    this.leaveTypeForm.reset();
  }

  onLeaveTypeSubmit(): void {
    if (this.leaveTypeForm.valid) {
      this.loading = true;
      const formValue = this.leaveTypeForm.value;
      
      const operation = this.isEditingLeaveType
        ? this.leaveService.updateLeaveType(this.editingLeaveTypeId, formValue)
        : this.leaveService.createLeaveType(formValue);

      operation.subscribe({
        next: (leaveType) => {
          console.log('HrLeaveManagementComponent: Leave type operation completed:', leaveType);
          this.messageService.add({
            severity: 'success',
            summary: 'Success',
            detail: `Leave type ${this.isEditingLeaveType ? 'updated' : 'created'} successfully`
          });
          this.closeLeaveTypeModal();
          this.loadLeaveTypes();
          this.loading = false;
        },
        error: (error) => {
          console.error('HrLeaveManagementComponent: Failed to save leave type:', error);
          this.messageService.add({
            severity: 'error',
            summary: 'Error',
            detail: error.userMessage || `Failed to ${this.isEditingLeaveType ? 'update' : 'create'} leave type`
          });
          this.loading = false;
        }
      });
    }
  }

  deleteLeaveType(leaveType: LeaveType): void {
    this.confirmationService.confirm({
      message: `Are you sure you want to delete the leave type "${leaveType.name}"?`,
      header: 'Confirm Delete',
      icon: 'pi pi-exclamation-triangle',
      accept: () => {
        this.leaveService.deleteLeaveType(leaveType.id).subscribe({
          next: () => {
            console.log('HrLeaveManagementComponent: Leave type deleted');
            this.messageService.add({
              severity: 'success',
              summary: 'Success',
              detail: 'Leave type deleted successfully'
            });
            this.loadLeaveTypes();
          },
          error: (error) => {
            console.error('HrLeaveManagementComponent: Failed to delete leave type:', error);
            this.messageService.add({
              severity: 'error',
              summary: 'Error',
              detail: error.userMessage || 'Failed to delete leave type'
            });
          }
        });
      }
    });
  }

  // View Methods
  viewLeaveDetails(leave: Leave): void {
    this.selectedLeave = leave;
    this.showViewModal = true;
  }

  closeViewModal(): void {
    this.showViewModal = false;
    this.selectedLeave = null;
  }

  // Utility Methods
  getEmployeeName(employeeId: string): string {
    const employee = this.employees.find(emp => emp.id === employeeId);
    return employee ? `${employee.firstName} ${employee.lastName}` : 'Unknown Employee';
  }

  getEmployeeDepartment(employeeId: string): string {
    const employee = this.employees.find(emp => emp.id === employeeId);
    return employee?.department || 'Unknown Department';
  }

  getLeaveTypeName(leaveTypeId: string): string {
    const leaveType = this.leaveTypes.find(type => type.id === leaveTypeId);
    return leaveType?.name || 'Unknown Type';
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

  canApprove(leave: Leave): boolean {
    return leave.status === 'pending' && this.leaveService.canApproveLeaves();
  }

  private updateChartData(): void {
    const statusCounts = {
      pending: this.allLeaves.filter(l => l.status === 'pending').length,
      approved: this.allLeaves.filter(l => l.status === 'approved').length,
      rejected: this.allLeaves.filter(l => l.status === 'rejected').length,
      cancelled: this.allLeaves.filter(l => l.status === 'cancelled').length
    };

    this.leaveChartData = {
      labels: ['Pending', 'Approved', 'Rejected', 'Cancelled'],
      datasets: [{
        data: [statusCounts.pending, statusCounts.approved, statusCounts.rejected, statusCounts.cancelled],
        backgroundColor: ['#FFA726', '#66BB6A', '#EF5350', '#78909C'],
        hoverBackgroundColor: ['#FF9800', '#4CAF50', '#F44336', '#607D8B']
      }]
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
      detail: 'Report export functionality to be implemented'
    });
  }
}
