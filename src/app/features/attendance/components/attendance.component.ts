import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators, FormsModule } from '@angular/forms';
import { AttendanceRecord, CreateAttendanceRequest, BulkAttendanceRequest, AttendanceStats } from '../models/attendance.model';
import { AttendanceService } from '../services/attendance.service';
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
import { CheckboxModule } from 'primeng/checkbox';
import { PanelModule } from 'primeng/panel';
import { MessageService, ConfirmationService } from 'primeng/api';

@Component({
  selector: 'app-attendance',
  standalone: true,
  imports: [
    CommonModule, 
    ReactiveFormsModule, 
    FormsModule,
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
    CheckboxModule,
    PanelModule
  ],
  providers: [MessageService, ConfirmationService],
  templateUrl: './attendance.component.html',
  styleUrls: ['./attendance.component.css']
})
export class AttendanceComponent implements OnInit {
  // Data properties
  attendanceRecords: AttendanceRecord[] = [];
  filteredRecords: AttendanceRecord[] = [];
  employees: Employee[] = [];
  attendanceStats: AttendanceStats | null = null;
  
  // Form properties
  attendanceForm!: FormGroup;
  bulkAttendanceForm!: FormGroup;
  
  // UI state
  selectedDate: Date = new Date();
  dateRange: Date[] = [new Date(), new Date()];
  showAttendanceModal = false;
  showBulkAttendanceModal = false;
  isEditMode = false;
  editingRecordId = '';
  loading = false;
  error = '';
  
  // Options for dropdowns
  statusOptions = [
    { label: 'Present', value: 'Present' },
    { label: 'Absent', value: 'Absent' },
    { label: 'Late', value: 'Late' },
    { label: 'Half Day', value: 'Half Day' },
    { label: 'On Leave', value: 'On Leave' }
  ];

  employeeOptions: { label: string; value: string }[] = [];
  
  // Bulk attendance data
  bulkAttendanceList: { 
    employee: Employee; 
    checkInTime: string; 
    checkOutTime: string; 
    notes: string;
    selected: boolean;
  }[] = [];

  constructor(
    private formBuilder: FormBuilder,
    private messageService: MessageService,
    private confirmationService: ConfirmationService,
    private attendanceService: AttendanceService,
    private employeeService: EmployeeService
  ) {
    this.initializeForms();
  }

  ngOnInit(): void {
    this.loadEmployees();
    this.loadTodayAttendanceStats();
    this.loadAttendanceRecords();
  }

  private initializeForms(): void {
    this.attendanceForm = this.formBuilder.group({
      employeeId: ['', Validators.required],
      checkInDate: [new Date(), Validators.required],
      checkInTime: ['09:00', Validators.required],
      checkOutDate: [new Date()],
      checkOutTime: ['17:00'],
      notes: ['']
    });

    this.bulkAttendanceForm = this.formBuilder.group({
      date: [new Date(), Validators.required],
      defaultCheckInTime: ['09:00', Validators.required],
      defaultCheckOutTime: ['17:00']
    });
  }

  loadEmployees(): void {
    console.log('AttendanceComponent: Loading employees');
    this.loading = true;
    
    this.employeeService.getEmployees().subscribe({
      next: (employees) => {
        console.log('AttendanceComponent: Employees loaded:', employees);
        this.employees = employees;
        this.employeeOptions = employees.map(emp => ({
          label: `${emp.firstName} ${emp.lastName} - ${emp.department}`,
          value: emp.id
        }));
        
        // Initialize bulk attendance list
        this.initializeBulkAttendanceList();
        this.loading = false;
      },
      error: (error) => {
        console.error('AttendanceComponent: Failed to load employees:', error);
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: error.userMessage || 'Failed to load employees'
        });
        this.loading = false;
      }
    });
  }

  loadAttendanceRecords(): void {
    console.log('AttendanceComponent: Loading attendance records for date:', this.selectedDate);
    this.loading = true;
    
    this.attendanceService.getAttendanceRecords().subscribe({
      next: (records) => {
        console.log('AttendanceComponent: Attendance records loaded:', records);
        this.attendanceRecords = records;
        this.filteredRecords = records;
        this.loading = false;
      },
      error: (error) => {
        console.error('AttendanceComponent: Failed to load attendance records:', error);
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: error.userMessage || 'Failed to load attendance records'
        });
        this.loading = false;
      }
    });
  }

  loadTodayAttendanceStats(): void {
    console.log('AttendanceComponent: Loading today attendance stats');
    
    this.attendanceService.getTodayAttendanceStats().subscribe({
      next: (stats) => {
        console.log('AttendanceComponent: Attendance stats loaded:', stats);
        this.attendanceStats = stats;
      },
      error: (error) => {
        console.error('AttendanceComponent: Failed to load attendance stats:', error);
        // Don't show error for stats as it's not critical
      }
    });
  }

  onDateChange(): void {
    console.log('AttendanceComponent: Date changed to:', this.selectedDate);
    this.loadAttendanceRecords();
  }

  openAttendanceModal(record?: AttendanceRecord): void {
    this.isEditMode = !!record;
    this.editingRecordId = record?.id || '';
    
    if (record) {
      const checkInDate = record.checkIn ? new Date(record.checkIn) : new Date();
      const checkOutDate = record.checkOut ? new Date(record.checkOut) : null;
      
      this.attendanceForm.patchValue({
        employeeId: record.employeeId,
        checkInDate: checkInDate,
        checkInTime: this.formatTime(checkInDate),
        checkOutDate: checkOutDate,
        checkOutTime: checkOutDate ? this.formatTime(checkOutDate) : '17:00',
        notes: record.notes || ''
      });
    } else {
      this.attendanceForm.reset({
        checkInDate: this.selectedDate,
        checkInTime: '09:00',
        checkOutDate: this.selectedDate,
        checkOutTime: '17:00',
        notes: ''
      });
    }
    
    this.showAttendanceModal = true;
  }

  closeAttendanceModal(): void {
    this.showAttendanceModal = false;
    this.isEditMode = false;
    this.editingRecordId = '';
    this.attendanceForm.reset();
  }

  onAttendanceSubmit(): void {
    if (this.attendanceForm.valid) {
      this.loading = true;
      const formValue = this.attendanceForm.value;
      
      if (this.isEditMode) {
        this.updateAttendance(formValue);
      } else {
        this.createAttendance(formValue);
      }
    } else {
      this.messageService.add({
        severity: 'warn',
        summary: 'Warning',
        detail: 'Please fill all required fields'
      });
    }
  }

  createAttendance(formValue: any): void {
    console.log('AttendanceComponent: Creating attendance record:', formValue);
    
    // Combine date and time to create DateTime objects
    const checkInDateTime = this.combineDateAndTime(formValue.checkInDate, formValue.checkInTime);
    const checkOutDateTime = formValue.checkOutDate && formValue.checkOutTime 
      ? this.combineDateAndTime(formValue.checkOutDate, formValue.checkOutTime) 
      : undefined;
    
    const request: CreateAttendanceRequest = {
      employeeId: formValue.employeeId,
      checkIn: checkInDateTime,
      checkOut: checkOutDateTime,
      notes: formValue.notes
    };

    this.attendanceService.createAttendance(request).subscribe({
      next: (record) => {
        console.log('AttendanceComponent: Attendance record created:', record);
        this.messageService.add({
          severity: 'success',
          summary: 'Success',
          detail: 'Attendance record created successfully'
        });
        this.closeAttendanceModal();
        this.loadAttendanceRecords();
        this.loadTodayAttendanceStats();
        this.loading = false;
      },
      error: (error) => {
        console.error('AttendanceComponent: Failed to create attendance record:', error);
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: error.userMessage || 'Failed to create attendance record'
        });
        this.loading = false;
      }
    });
  }

  private formatTime(date: Date): string {
    return date.toTimeString().substring(0, 5); // HH:MM format
  }

  private combineDateAndTime(date: Date, time: string): Date {
    const [hours, minutes] = time.split(':').map(Number);
    const combined = new Date(date);
    combined.setHours(hours, minutes, 0, 0);
    return combined;
  }

  updateAttendance(formValue: any): void {
    console.log('AttendanceComponent: Updating attendance record:', formValue);
    
    // Combine date and time to create DateTime objects
    const checkInDateTime = this.combineDateAndTime(formValue.checkInDate, formValue.checkInTime);
    const checkOutDateTime = formValue.checkOutDate && formValue.checkOutTime 
      ? this.combineDateAndTime(formValue.checkOutDate, formValue.checkOutTime) 
      : undefined;
    
    const updates: Partial<CreateAttendanceRequest> = {
      employeeId: formValue.employeeId,
      checkIn: checkInDateTime,
      checkOut: checkOutDateTime,
      notes: formValue.notes
    };

    this.attendanceService.updateAttendance(this.editingRecordId, updates).subscribe({
      next: (record) => {
        console.log('AttendanceComponent: Attendance record updated:', record);
        this.messageService.add({
          severity: 'success',
          summary: 'Success',
          detail: 'Attendance record updated successfully'
        });
        this.closeAttendanceModal();
        this.loadAttendanceRecords();
        this.loadTodayAttendanceStats();
        this.loading = false;
      },
      error: (error) => {
        console.error('AttendanceComponent: Failed to update attendance record:', error);
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: error.userMessage || 'Failed to update attendance record'
        });
        this.loading = false;
      }
    });
  }

  deleteAttendance(record: AttendanceRecord): void {
    this.confirmationService.confirm({
      message: `Are you sure you want to delete attendance record for ${record.employeeName}?`,
      header: 'Confirm Delete',
      icon: 'pi pi-exclamation-triangle',
      accept: () => {
        console.log('AttendanceComponent: Deleting attendance record:', record.id);
        
        this.attendanceService.deleteAttendance(record.id).subscribe({
          next: () => {
            console.log('AttendanceComponent: Attendance record deleted');
            this.messageService.add({
              severity: 'success',
              summary: 'Success',
              detail: 'Attendance record deleted successfully'
            });
            this.loadAttendanceRecords();
            this.loadTodayAttendanceStats();
          },
          error: (error) => {
            console.error('AttendanceComponent: Failed to delete attendance record:', error);
            this.messageService.add({
              severity: 'error',
              summary: 'Error',
              detail: error.userMessage || 'Failed to delete attendance record'
            });
          }
        });
      }
    });
  }

  // Bulk attendance functionality
  openBulkAttendanceModal(): void {
    this.showBulkAttendanceModal = true;
    this.initializeBulkAttendanceList();
  }

  closeBulkAttendanceModal(): void {
    this.showBulkAttendanceModal = false;
    this.bulkAttendanceForm.reset({
      date: new Date(),
      defaultCheckInTime: '09:00',
      defaultCheckOutTime: '17:00'
    });
  }

  initializeBulkAttendanceList(): void {
    const defaultCheckInTime = this.bulkAttendanceForm.get('defaultCheckInTime')?.value || '09:00';
    const defaultCheckOutTime = this.bulkAttendanceForm.get('defaultCheckOutTime')?.value || '17:00';
    
    this.bulkAttendanceList = this.employees.map(employee => ({
      employee,
      checkInTime: defaultCheckInTime,
      checkOutTime: defaultCheckOutTime,
      notes: '',
      selected: true
    }));
  }

  applyDefaultTimes(): void {
    const defaultCheckInTime = this.bulkAttendanceForm.get('defaultCheckInTime')?.value || '09:00';
    const defaultCheckOutTime = this.bulkAttendanceForm.get('defaultCheckOutTime')?.value || '17:00';
    
    this.bulkAttendanceList.forEach(item => {
      item.checkInTime = defaultCheckInTime;
      item.checkOutTime = defaultCheckOutTime;
    });
  }

  onBulkAttendanceSubmit(): void {
    if (this.bulkAttendanceForm.valid) {
      const selectedItems = this.bulkAttendanceList.filter(item => item.selected);
      
      if (selectedItems.length === 0) {
        this.messageService.add({
          severity: 'warn',
          summary: 'Warning',
          detail: 'Please select at least one employee'
        });
        return;
      }

      this.loading = true;
      const formValue = this.bulkAttendanceForm.value;
      const selectedDate = formValue.date;
      
      const attendanceRecords = selectedItems.map(item => {
        const checkInDateTime = this.combineDateAndTime(selectedDate, item.checkInTime);
        const checkOutDateTime = item.checkOutTime 
          ? this.combineDateAndTime(selectedDate, item.checkOutTime) 
          : undefined;
        
        return {
          employeeId: item.employee.id,
          checkIn: checkInDateTime,
          checkOut: checkOutDateTime,
          notes: item.notes
        };
      });
      
      const request: BulkAttendanceRequest = {
        attendanceRecords
      };

      console.log('AttendanceComponent: Creating bulk attendance:', request);

      this.attendanceService.createBulkAttendance(request).subscribe({
        next: (records) => {
          console.log('AttendanceComponent: Bulk attendance created:', records);
          this.messageService.add({
            severity: 'success',
            summary: 'Success',
            detail: `Bulk attendance created for ${records.length} employees`
          });
          this.closeBulkAttendanceModal();
          this.loadAttendanceRecords();
          this.loadTodayAttendanceStats();
          this.loading = false;
        },
        error: (error) => {
          console.error('AttendanceComponent: Failed to create bulk attendance:', error);
          this.messageService.add({
            severity: 'error',
            summary: 'Error',
            detail: error.userMessage || 'Failed to create bulk attendance'
          });
          this.loading = false;
        }
      });
    } else {
      this.messageService.add({
        severity: 'warn',
        summary: 'Warning',
        detail: 'Please fill all required fields'
      });
    }
  }

  // Quick actions
  markPresent(employee: Employee): void {
    console.log('AttendanceComponent: Quick marking employee present:', employee);
    
    this.attendanceService.markPresent(employee.id, this.selectedDate).subscribe({
      next: (record) => {
        console.log('AttendanceComponent: Employee marked present:', record);
        this.messageService.add({
          severity: 'success',
          summary: 'Success',
          detail: `${employee.firstName} ${employee.lastName} marked present`
        });
        this.loadAttendanceRecords();
        this.loadTodayAttendanceStats();
      },
      error: (error) => {
        console.error('AttendanceComponent: Failed to mark present:', error);
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: error.userMessage || 'Failed to mark employee present'
        });
      }
    });
  }

  markAbsent(employee: Employee): void {
    console.log('AttendanceComponent: Quick marking employee absent:', employee);
    
    this.attendanceService.markAbsent(employee.id, this.selectedDate).subscribe({
      next: (record) => {
        console.log('AttendanceComponent: Employee marked absent:', record);
        this.messageService.add({
          severity: 'success',
          summary: 'Success',
          detail: `${employee.firstName} ${employee.lastName} marked absent`
        });
        this.loadAttendanceRecords();
        this.loadTodayAttendanceStats();
      },
      error: (error) => {
        console.error('AttendanceComponent: Failed to mark absent:', error);
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: error.userMessage || 'Failed to mark employee absent'
        });
      }
    });
  }

  // Utility methods
  getEmployeeName(employeeId: string): string {
    const employee = this.employees.find(emp => emp.id === employeeId);
    return employee ? `${employee.firstName} ${employee.lastName}` : 'Unknown Employee';
  }

  getEmployeeDepartment(employeeId: string): string {
    const employee = this.employees.find(emp => emp.id === employeeId);
    return employee?.department || 'Unknown Department';
  }

  getStatusSeverity(status: string): string {
    switch (status) {
      case 'Present': return 'success';
      case 'Late': return 'warning';
      case 'Absent': return 'danger';
      case 'Half Day': return 'info';
      case 'On Leave': return 'secondary';
      default: return 'info';
    }
  }

  calculateHoursWorked(record: AttendanceRecord): number {
    if (!record.checkIn || !record.checkOut) return 0;
    
    const checkInTime = this.formatTime(record.checkIn);
    const checkOutTime = this.formatTime(record.checkOut);
    
    return this.attendanceService.calculateHoursWorked(checkInTime, checkOutTime);
  }

  filterRecords(): void {
    // This method can be extended to add filtering functionality
    this.filteredRecords = this.attendanceRecords;
  }
}
     