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
import { MessageService, ConfirmationService } from 'primeng/api';

interface AttendanceRecord {
  id: string;
  employeeId: string;
  employeeName: string;
  department: string;
  date: Date;
  timeIn: string;
  timeOut: string;
  status: 'Present' | 'Absent' | 'Late' | 'Half Day';
  hoursWorked: number;
}

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
    CardModule, 
    ToastModule, 
    ConfirmDialogModule, 
    MessageModule, 
    TagModule
  ],
  providers: [MessageService, ConfirmationService],
  templateUrl: './attendance.component.html',
  styleUrls: ['./attendance.component.css']
})
export class AttendanceComponent implements OnInit {
  attendanceRecords: AttendanceRecord[] = [];
  filteredRecords: AttendanceRecord[] = [];
  
  attendanceForm: FormGroup;
  selectedDate: string = new Date().toISOString().split('T')[0]; // Format for HTML date input
  showAttendanceModal = false;
  isEditMode = false;
  editingRecordId = '';
  
  loading = false;
  error = '';
  
  statusOptions = [
    { label: 'Present', value: 'Present' },
    { label: 'Absent', value: 'Absent' },
    { label: 'Late', value: 'Late' },
    { label: 'Half Day', value: 'Half Day' }
  ];

  employeeOptions = [
    { label: 'John Doe', value: '1' },
    { label: 'Jane Smith', value: '2' },
    { label: 'Mike Johnson', value: '3' }
  ];

  constructor(
    private formBuilder: FormBuilder,
    private messageService: MessageService,
    private confirmationService: ConfirmationService
  ) {
    this.attendanceForm = this.formBuilder.group({
      employeeId: ['', Validators.required],
      date: [new Date().toISOString().split('T')[0], Validators.required],
      timeIn: ['09:00', Validators.required],
      timeOut: ['17:00', Validators.required],
      status: ['Present', Validators.required]
    });
  }

  ngOnInit(): void {
    this.loadAttendanceRecords();
  }

  loadAttendanceRecords(): void {
    this.loading = true;
    // Mock data for demonstration
    setTimeout(() => {
      this.attendanceRecords = [
        {
          id: '1',
          employeeId: '1',
          employeeName: 'John Doe',
          department: 'Engineering',
          date: new Date(),
          timeIn: '09:00',
          timeOut: '17:00',
          status: 'Present',
          hoursWorked: 8
        },
        {
          id: '2',
          employeeId: '2',
          employeeName: 'Jane Smith',
          department: 'HR',
          date: new Date(),
          timeIn: '09:15',
          timeOut: '17:00',
          status: 'Late',
          hoursWorked: 7.75
        }
      ];
      this.filteredRecords = [...this.attendanceRecords];
      this.loading = false;
    }, 1000);
  }

  openAttendanceModal(): void {
    this.showAttendanceModal = true;
    this.isEditMode = false;
    this.attendanceForm.reset({
      date: new Date().toISOString().split('T')[0],
      timeIn: '09:00',
      timeOut: '17:00',
      status: 'Present'
    });
  }

  editAttendance(record: AttendanceRecord): void {
    this.showAttendanceModal = true;
    this.isEditMode = true;
    this.editingRecordId = record.id;
    
    this.attendanceForm.patchValue({
      employeeId: record.employeeId,
      date: new Date(record.date).toISOString().split('T')[0],
      timeIn: record.timeIn,
      timeOut: record.timeOut,
      status: record.status
    });
  }

  closeAttendanceModal(): void {
    this.showAttendanceModal = false;
    this.isEditMode = false;
    this.editingRecordId = '';
    this.attendanceForm.reset();
  }

  onSubmitAttendance(): void {
    if (this.attendanceForm.invalid) {
      return;
    }

    this.loading = true;
    
    // Mock API call
    setTimeout(() => {
      this.loading = false;
      
      if (this.isEditMode) {
        this.messageService.add({
          severity: 'success',
          summary: 'Success',
          detail: 'Attendance record updated successfully!'
        });
      } else {
        this.messageService.add({
          severity: 'success',
          summary: 'Success',
          detail: 'Attendance record created successfully!'
        });
      }
      
      this.closeAttendanceModal();
      this.loadAttendanceRecords();
    }, 1000);
  }

  deleteAttendance(recordId: string): void {
    const record = this.attendanceRecords.find(r => r.id === recordId);
    if (!record) return;

    this.confirmationService.confirm({
      message: `Are you sure you want to delete the attendance record for ${record.employeeName}?`,
      header: 'Delete Confirmation',
      icon: 'pi pi-exclamation-triangle',
      accept: () => {
        this.messageService.add({
          severity: 'success',
          summary: 'Success',
          detail: 'Attendance record deleted successfully!'
        });
        this.loadAttendanceRecords();
      }
    });
  }

  getStatusSeverity(status: string): string {
    switch (status) {
      case 'Present': return 'success';
      case 'Late': return 'warning';
      case 'Absent': return 'danger';
      case 'Half Day': return 'info';
      default: return 'secondary';
    }
  }

  get af() {
    return this.attendanceForm.controls;
  }
}
