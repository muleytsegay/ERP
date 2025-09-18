export interface AttendanceRecord {
  id: string;
  employeeId: string;
  employeeName?: string;
  department?: string;
  checkIn: Date;
  checkOut?: Date;
  status?: 'Present' | 'Absent' | 'Late' | 'Half Day' | 'On Leave';
  hoursWorked?: number;
  breakTime?: number;
  overtime?: number;
  notes?: string;
  createdBy?: string;
  updatedBy?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface CreateAttendanceRequest {
  employeeId: string;
  checkIn: Date;
  checkOut?: Date;
  notes?: string;
}

export interface BulkAttendanceRequest {
  attendanceRecords: {
    employeeId: string;
    checkIn: Date;
    checkOut?: Date;
    notes?: string;
  }[];
}

export interface AttendanceStats {
  totalEmployees: number;
  presentToday: number;
  absentToday: number;
  lateToday: number;
  onLeaveToday: number;
  attendanceRate: number;
}

export interface EmployeeAttendanceSummary {
  employeeId: string;
  employeeName: string;
  department: string;
  totalDays: number;
  presentDays: number;
  absentDays: number;
  lateDays: number;
  attendanceRate: number;
}