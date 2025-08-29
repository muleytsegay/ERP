import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators, FormsModule } from '@angular/forms';
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
    CalendarModule,
    CardModule, 
    ToastModule, 
    ConfirmDialogModule, 
    MessageModule, 
    TagModule,
    DropdownModule
  ],
  providers: [MessageService, ConfirmationService],
  templateUrl: './attendance.component.html',
  styleUrls: ['./attendance.component.css']
})
export class AttendanceComponent implements OnInit {
  attendanceRecords: AttendanceRecord[] = [];
  filteredRecords: AttendanceRecord[] = [];
  
  attendanceForm: FormGroup;
  selectedDate: Date = new Date();
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
    { label: 'Mike Johnson', value: '3' },
    { label: 'Sarah Wilson', value: '4' },
    { label: 'Tom Brown', value: '5' }
  ];

  constructor(
    private formBuilder: FormBuilder,
    private messageService: MessageService,
    private confirmationService: ConfirmationService
  ) {
    this.attendanceForm = this.formBuilder.group({
      employeeId: ['', Validators.required],
      date: [new Date(), Validators.required],
      timeIn: ['09:00', Validators.required],
      timeOut: ['17:00', Validators.required],
      status: ['Present', Validators.required]
    });
  }

  ngOnInit(): void {
    this.loadAttendanceRecords();
    this.filterRecords();
  }

  loadAttendanceRecords(): void {
    this.loading = true;
    // Mock data for demonstration - replace with actual service call
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
        },
        {
          id: '3',
          employeeId: '3',
          employeeName: 'Mike Johnson',
          department: 'Sales',
          date: new Date(Date.now() - 86400000), // Yesterday
          timeIn: '09:00',
          timeOut: '17:00',
          status: 'Present',
          hoursWorked: 8
        },
        {
          id: '4',
          employeeId: '4',
          employeeName: 'Sarah Wilson',
          department: 'Marketing',
          date: new Date(),
          timeIn: '',
          timeOut: '',
          status: 'Absent',
          hoursWorked: 0
        }
      ];
      this.filterRecords();
      this.loading = false;
    }, 1000);
  }

  filterRecords(): void {
    if (this.selectedDate) {
      const selectedDateStr = this.selectedDate.toDateString();
      this.filteredRecords = this.attendanceRecords.filter(record => 
        new Date(record.date).toDateString() === selectedDateStr
      );
    } else {
      this.filteredRecords = [...this.attendanceRecords];
    }
  }

  onDateChange(): void {
    this.filterRecords();
  }

  openAttendanceModal(): void {
    this.showAttendanceModal = true;
    this.isEditMode = false;
    this.attendanceForm.reset({
      date: new Date(),
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
      date: new Date(record.date),
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
      this.messageService.add({
        severity: 'warn',
        summary: 'Warning',
        detail: 'Please fill all required fields'
      });
      return;
    }

    this.loading = true;
    const formData = this.attendanceForm.value;
    
    // Calculate hours worked
    const timeIn = formData.timeIn;
    const timeOut = formData.timeOut;
    const hoursWorked = this.calculateHoursWorked(timeIn, timeOut);
    
    const attendanceData: AttendanceRecord = {
      id: this.isEditMode ? this.editingRecordId : this.generateId(),
      employeeId: formData.employeeId,
      employeeName: this.getEmployeeName(formData.employeeId),
      department: this.getDepartmentForEmployee(formData.employeeId),
      date: formData.date,
      timeIn: formData.timeIn,
      timeOut: formData.timeOut,
      status: formData.status,
      hoursWorked: hoursWorked
    };
    
    // Mock API call
    setTimeout(() => {
      this.loading = false;
      
      if (this.isEditMode) {
        const index = this.attendanceRecords.findIndex(r => r.id === this.editingRecordId);
        if (index !== -1) {
          this.attendanceRecords[index] = attendanceData;
        }
        this.messageService.add({
          severity: 'success',
          summary: 'Success',
          detail: 'Attendance record updated successfully!'
        });
      } else {
        this.attendanceRecords.push(attendanceData);
        this.messageService.add({
          severity: 'success',
          summary: 'Success',
          detail: 'Attendance record created successfully!'
        });
      }
      
      this.filterRecords();
      this.closeAttendanceModal();
    }, 1000);
  }

  deleteAttendance(id: string): void {
    this.confirmationService.confirm({
      message: 'Are you sure you want to delete this attendance record?',
      header: 'Confirm Delete',
      icon: 'pi pi-exclamation-triangle',
      accept: () => {
        this.attendanceRecords = this.attendanceRecords.filter(record => record.id !== id);
        this.filterRecords();
        this.messageService.add({
          severity: 'success',
          summary: 'Success',
          detail: 'Attendance record deleted successfully'
        });
      }
    });
  }

  calculateHoursWorked(timeIn: string, timeOut: string): number {
    if (!timeIn || !timeOut) return 0;
    
    const [inHour, inMinute] = timeIn.split(':').map(Number);
    const [outHour, outMinute] = timeOut.split(':').map(Number);
    
    const inMinutes = inHour * 60 + inMinute;
    const outMinutes = outHour * 60 + outMinute;
    
    const diffMinutes = outMinutes - inMinutes;
    return Math.max(0, diffMinutes / 60);
  }

  getEmployeeName(employeeId: string): string {
    const employee = this.employeeOptions.find(emp => emp.value === employeeId);
    return employee ? employee.label : 'Unknown Employee';
  }

  getDepartmentForEmployee(employeeId: string): string {
    // Mock department mapping
    const departmentMap: { [key: string]: string } = {
      '1': 'Engineering',
      '2': 'HR',
      '3': 'Sales',
      '4': 'Marketing',
      '5': 'Finance'
    };
    return departmentMap[employeeId] || 'Unknown';
  }

  generateId(): string {
  // Return statement should not be followed by other code.
  return Date.now().toString() + Math.random().toString(36).substr(2, 9);
}

// This is a separate method that could be called elsewhere,
// for example, in a component's lifecycle hook.
loadAndSetInterval() {
  this.loadAttendanceRecords();
  setInterval(() => {
    this.loadAttendanceRecords();
  }, 1000);
}

// deleteAttendance(recordId: string): void {
//   const record = this.attendanceRecords.find(r => r.id === recordId);
//   if (!record) {
//     return;
//   }
  
//   this.confirmationService.confirm({
//     message: `Are you sure you want to delete the attendance record for ${record.employeeName}?`,
//     header: 'Delete Confirmation',
//     icon: 'pi pi-exclamation-triangle',
//     accept: () => {

//       this.messageService.add({
//         severity: 'success',
//         summary: 'Success',
//         detail: 'Attendance record deleted successfully!'
//       });
//       this.loadAttendanceRecords();
//     }
//   }); // Removed the trailing comma from here.
// }

getStatusSeverity(status: string): string {
  switch (status) {
    case 'Present':
      return 'success';
    case 'Late':
      return 'warning';
    case 'Absent':
      return 'danger';
    case 'Half Day':
      return 'info';
    default:
      return 'secondary';
  }
}

get af() {
  return this.attendanceForm.controls;
}
}
