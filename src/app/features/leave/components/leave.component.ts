import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators, FormsModule } from '@angular/forms';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { InputTextModule } from 'primeng/inputtext';
import { CardModule } from 'primeng/card';
import { ToastModule } from 'primeng/toast';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { MessageModule } from 'primeng/message';
import { TagModule } from 'primeng/tag';
import { CalendarModule } from 'primeng/calendar';
import { DropdownModule } from 'primeng/dropdown';
import { TextareaModule } from 'primeng/textarea';
import { MessageService, ConfirmationService } from 'primeng/api';

interface LeaveRequest {
  id: string;
  employeeId: string;
  employeeName: string;
  leaveType: 'Annual' | 'Sick' | 'Maternity' | 'Paternity' | 'Emergency';
  startDate: Date;
  endDate: Date;
  days: number;
  reason: string;
  status: 'Pending' | 'Approved' | 'Rejected';
  appliedDate: Date;
  approvedBy?: string;
}

@Component({
  selector: 'app-leave',
  standalone: true,
  imports: [
    CommonModule, 
    ReactiveFormsModule, 
    FormsModule,
    TableModule, 
    ButtonModule, 
    DialogModule, 
    InputTextModule, 
    CardModule, 
    ToastModule, 
    ConfirmDialogModule, 
    MessageModule, 
    TagModule,
    CalendarModule,
    DropdownModule,
    TextareaModule
  ],
  providers: [MessageService, ConfirmationService],
  templateUrl: './leave.component.html',
  // styleUrls: ['./leave.component.css']
})
export class LeaveComponent implements OnInit {
  leaveRequests: LeaveRequest[] = [];
  filteredRequests: LeaveRequest[] = [];
  leaveForm: FormGroup;
  showAddModal = false;
  loading = false;
  
  leaveTypes = [
    { label: 'Annual Leave', value: 'Annual' },
    { label: 'Sick Leave', value: 'Sick' },
    { label: 'Maternity Leave', value: 'Maternity' },
    { label: 'Paternity Leave', value: 'Paternity' },
    { label: 'Emergency Leave', value: 'Emergency' }
  ];

  constructor(
    private fb: FormBuilder,
    private messageService: MessageService,
    private confirmationService: ConfirmationService
  ) {
    this.leaveForm = this.fb.group({
      leaveType: ['', Validators.required],
      startDate: ['', Validators.required],
      endDate: ['', Validators.required],
      reason: ['', [Validators.required, Validators.minLength(10)]]
    });
  }

  ngOnInit(): void {
    this.loadLeaveRequests();
  }

  loadLeaveRequests(): void {
    this.loading = true;
    // Simulate API call with mock data
    setTimeout(() => {
      this.leaveRequests = [
        {
          id: '1',
          employeeId: 'EMP001',
          employeeName: 'John Doe',
          leaveType: 'Annual',
          startDate: new Date('2024-03-15'),
          endDate: new Date('2024-03-20'),
          days: 5,
          reason: 'Family vacation',
          status: 'Approved',
          appliedDate: new Date('2024-03-01'),
          approvedBy: 'HR Manager'
        },
        {
          id: '2',
          employeeId: 'EMP002',
          employeeName: 'Jane Smith',
          leaveType: 'Sick',
          startDate: new Date('2024-03-22'),
          endDate: new Date('2024-03-23'),
          days: 2,
          reason: 'Medical treatment',
          status: 'Pending',
          appliedDate: new Date('2024-03-20')
        }
      ];
      this.filteredRequests = [...this.leaveRequests];
      this.loading = false;
    }, 1000);
  }

  openAddModal(): void {
    this.showAddModal = true;
    this.leaveForm.reset();
  }

  closeAddModal(): void {
    this.showAddModal = false;
    this.leaveForm.reset();
  }

  onSubmit(): void {
    if (this.leaveForm.valid) {
      const formValue = this.leaveForm.value;
      const startDate = new Date(formValue.startDate);
      const endDate = new Date(formValue.endDate);
      const days = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 3600 * 24)) + 1;

      const newRequest: LeaveRequest = {
        id: (this.leaveRequests.length + 1).toString(),
        employeeId: 'EMP' + String(this.leaveRequests.length + 1).padStart(3, '0'),
        employeeName: 'Current User',
        leaveType: formValue.leaveType,
        startDate: startDate,
        endDate: endDate,
        days: days,
        reason: formValue.reason,
        status: 'Pending',
        appliedDate: new Date()
      };

      this.leaveRequests.push(newRequest);
      this.filteredRequests = [...this.leaveRequests];
      this.closeAddModal();
      
      this.messageService.add({
        severity: 'success',
        summary: 'Success',
        detail: 'Leave request submitted successfully'
      });
    } else {
      this.messageService.add({
        severity: 'error',
        summary: 'Error',
        detail: 'Please fill all required fields'
      });
    }
  }

  getStatusSeverity(status: string): string {
    switch (status) {
      case 'Approved': return 'success';
      case 'Rejected': return 'danger';
      case 'Pending': return 'warning';
      default: return 'info';
    }
  }

  getLeaveTypeSeverity(type: string): string {
    switch (type) {
      case 'Annual': return 'info';
      case 'Sick': return 'danger';
      case 'Maternity': 
      case 'Paternity': return 'success';
      case 'Emergency': return 'warning';
      default: return 'info';
    }
  }

}
