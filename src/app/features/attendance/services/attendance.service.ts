import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { map, catchError, tap } from 'rxjs/operators';
import { 
  AttendanceRecord, 
  CreateAttendanceRequest, 
  BulkAttendanceRequest, 
  AttendanceStats, 
  EmployeeAttendanceSummary 
} from '../models/attendance.model';

@Injectable({
  providedIn: 'root'
})
export class AttendanceService {
  private apiUrl = 'https://gateway-microservice.onrender.com/hrms/api/v1';

  constructor(private http: HttpClient) {}

  // Get all attendance records
  getAttendanceRecords(): Observable<AttendanceRecord[]> {
    console.log('AttendanceService: Getting all attendance records');
    
    return this.http.get<AttendanceRecord[]>(`${this.apiUrl}/attendance`).pipe(
      map(records => {
        console.log('AttendanceService: Raw attendance records:', records);
        return records.map(record => ({
          ...record,
          checkIn: new Date(record.checkIn),
          checkOut: record.checkOut ? new Date(record.checkOut) : undefined,
          createdAt: record.createdAt ? new Date(record.createdAt) : undefined,
          updatedAt: record.updatedAt ? new Date(record.updatedAt) : undefined
        }));
      }),
      tap(mappedRecords => {
        console.log('AttendanceService: Mapped attendance records:', mappedRecords);
      }),
      catchError((error: HttpErrorResponse) => {
        console.error('AttendanceService: Failed to get attendance records:', error);
        return throwError(() => this.handleError(error, 'Failed to load attendance records'));
      })
    );
  }

  // Get attendance records by date range
  getAttendanceByDateRange(startDate: Date, endDate: Date): Observable<AttendanceRecord[]> {
    console.log('AttendanceService: Getting attendance by date range:', { startDate, endDate });
    
    const params = {
      startDate: startDate.toISOString().split('T')[0],
      endDate: endDate.toISOString().split('T')[0]
    };
    
    return this.http.get<AttendanceRecord[]>(`${this.apiUrl}/attendance/date-range`, { params }).pipe(
      map(records => records.map(record => ({
        ...record,
        checkIn: new Date(record.checkIn),
        checkOut: record.checkOut ? new Date(record.checkOut) : undefined,
        createdAt: record.createdAt ? new Date(record.createdAt) : undefined,
        updatedAt: record.updatedAt ? new Date(record.updatedAt) : undefined
      }))),
      catchError((error: HttpErrorResponse) => {
        console.error('AttendanceService: Failed to get attendance by date range:', error);
        return throwError(() => this.handleError(error, 'Failed to load attendance records for date range'));
      })
    );
  }

  // Get attendance records for a specific date
  getAttendanceByDate(date: Date): Observable<AttendanceRecord[]> {
    console.log('AttendanceService: Getting attendance for date:', date);
    
    const dateStr = date.toISOString().split('T')[0];
    
    return this.http.get<AttendanceRecord[]>(`${this.apiUrl}/attendance/date/${dateStr}`).pipe(
      map(records => records.map(record => ({
        ...record,
        checkIn: new Date(record.checkIn),
        checkOut: record.checkOut ? new Date(record.checkOut) : undefined,
        createdAt: record.createdAt ? new Date(record.createdAt) : undefined,
        updatedAt: record.updatedAt ? new Date(record.updatedAt) : undefined
      }))),
      catchError((error: HttpErrorResponse) => {
        console.error('AttendanceService: Failed to get attendance by date:', error);
        return throwError(() => this.handleError(error, 'Failed to load attendance records for selected date'));
      })
    );
  }

  // Get attendance records for a specific employee
  getEmployeeAttendance(employeeId: string, startDate?: Date, endDate?: Date): Observable<AttendanceRecord[]> {
    console.log('AttendanceService: Getting employee attendance:', { employeeId, startDate, endDate });
    
    let url = `${this.apiUrl}/attendance/employee/${employeeId}`;
    const params: any = {};
    
    if (startDate) {
      params.startDate = startDate.toISOString().split('T')[0];
    }
    if (endDate) {
      params.endDate = endDate.toISOString().split('T')[0];
    }
    
    return this.http.get<AttendanceRecord[]>(url, { params }).pipe(
      map(records => records.map(record => ({
        ...record,
        checkIn: new Date(record.checkIn),
        checkOut: record.checkOut ? new Date(record.checkOut) : undefined,
        createdAt: record.createdAt ? new Date(record.createdAt) : undefined,
        updatedAt: record.updatedAt ? new Date(record.updatedAt) : undefined
      }))),
      catchError((error: HttpErrorResponse) => {
        console.error('AttendanceService: Failed to get employee attendance:', error);
        return throwError(() => this.handleError(error, 'Failed to load employee attendance records'));
      })
    );
  }

  // Create single attendance record
  createAttendance(request: CreateAttendanceRequest): Observable<AttendanceRecord> {
    console.log('AttendanceService: Creating attendance record:', request);
    
    const attendanceData = {
      employeeId: request.employeeId,
      checkIn: request.checkIn.toISOString(),
      checkOut: request.checkOut ? request.checkOut.toISOString() : undefined,
      notes: request.notes
    };
    
    console.log('AttendanceService: Sending attendance data:', attendanceData);
    
    return this.http.post<AttendanceRecord>(`${this.apiUrl}/attendance`, attendanceData).pipe(
      map(record => ({
        ...record,
        checkIn: new Date(record.checkIn),
        checkOut: record.checkOut ? new Date(record.checkOut) : undefined,
        createdAt: record.createdAt ? new Date(record.createdAt) : undefined,
        updatedAt: record.updatedAt ? new Date(record.updatedAt) : undefined
      })),
      tap(createdRecord => {
        console.log('AttendanceService: Attendance record created successfully:', createdRecord);
      }),
      catchError((error: HttpErrorResponse) => {
        console.error('AttendanceService: Failed to create attendance record:', error);
        return throwError(() => this.handleError(error, 'Failed to create attendance record'));
      })
    );
  }

  // Bulk create attendance records for multiple employees
  createBulkAttendance(request: BulkAttendanceRequest): Observable<AttendanceRecord[]> {
    console.log('AttendanceService: Creating bulk attendance records:', request);
    
    const bulkData = {
      attendanceRecords: request.attendanceRecords.map(record => ({
        employeeId: record.employeeId,
        checkIn: record.checkIn.toISOString(),
        checkOut: record.checkOut ? record.checkOut.toISOString() : undefined,
        notes: record.notes
      }))
    };
    
    return this.http.post<AttendanceRecord[]>(`${this.apiUrl}/attendance/bulk`, bulkData).pipe(
      map(records => records.map(record => ({
        ...record,
        checkIn: new Date(record.checkIn),
        checkOut: record.checkOut ? new Date(record.checkOut) : undefined,
        createdAt: record.createdAt ? new Date(record.createdAt) : undefined,
        updatedAt: record.updatedAt ? new Date(record.updatedAt) : undefined
      }))),
      tap(createdRecords => {
        console.log('AttendanceService: Bulk attendance records created successfully:', createdRecords);
      }),
      catchError((error: HttpErrorResponse) => {
        console.error('AttendanceService: Failed to create bulk attendance records:', error);
        return throwError(() => this.handleError(error, 'Failed to create bulk attendance records'));
      })
    );
  }

  // Update attendance record
  updateAttendance(id: string, updates: Partial<CreateAttendanceRequest>): Observable<AttendanceRecord> {
    console.log('AttendanceService: Updating attendance record:', { id, updates });
    
    const updateData: any = {};
    
    if (updates.employeeId) {
      updateData.employeeId = updates.employeeId;
    }
    
    if (updates.checkIn) {
      updateData.checkIn = updates.checkIn.toISOString();
    }
    
    if (updates.checkOut) {
      updateData.checkOut = updates.checkOut.toISOString();
    }
    
    if (updates.notes) {
      updateData.notes = updates.notes;
    }
    
    return this.http.put<AttendanceRecord>(`${this.apiUrl}/attendance/${id}`, updateData).pipe(
      map(record => ({
        ...record,
        checkIn: new Date(record.checkIn),
        checkOut: record.checkOut ? new Date(record.checkOut) : undefined,
        createdAt: record.createdAt ? new Date(record.createdAt) : undefined,
        updatedAt: record.updatedAt ? new Date(record.updatedAt) : undefined
      })),
      tap(updatedRecord => {
        console.log('AttendanceService: Attendance record updated successfully:', updatedRecord);
      }),
      catchError((error: HttpErrorResponse) => {
        console.error('AttendanceService: Failed to update attendance record:', error);
        return throwError(() => this.handleError(error, 'Failed to update attendance record'));
      })
    );
  }

  // Delete attendance record
  deleteAttendance(id: string): Observable<void> {
    console.log('AttendanceService: Deleting attendance record:', id);
    
    return this.http.delete<void>(`${this.apiUrl}/attendance/${id}`).pipe(
      tap(() => {
        console.log('AttendanceService: Attendance record deleted successfully');
      }),
      catchError((error: HttpErrorResponse) => {
        console.error('AttendanceService: Failed to delete attendance record:', error);
        return throwError(() => this.handleError(error, 'Failed to delete attendance record'));
      })
    );
  }

  // Get attendance statistics for today
  getTodayAttendanceStats(): Observable<AttendanceStats> {
    console.log('AttendanceService: Getting today attendance stats');
    
    const today = new Date().toISOString().split('T')[0];
    
    return this.http.get<AttendanceStats>(`${this.apiUrl}/attendance/stats/today`).pipe(
      tap(stats => {
        console.log('AttendanceService: Today attendance stats:', stats);
      }),
      catchError((error: HttpErrorResponse) => {
        console.error('AttendanceService: Failed to get today attendance stats:', error);
        return throwError(() => this.handleError(error, 'Failed to load attendance statistics'));
      })
    );
  }

  // Get attendance statistics for a date range
  getAttendanceStats(startDate: Date, endDate: Date): Observable<AttendanceStats> {
    console.log('AttendanceService: Getting attendance stats for date range:', { startDate, endDate });
    
    const params = {
      startDate: startDate.toISOString().split('T')[0],
      endDate: endDate.toISOString().split('T')[0]
    };
    
    return this.http.get<AttendanceStats>(`${this.apiUrl}/attendance/stats`, { params }).pipe(
      tap(stats => {
        console.log('AttendanceService: Attendance stats for date range:', stats);
      }),
      catchError((error: HttpErrorResponse) => {
        console.error('AttendanceService: Failed to get attendance stats:', error);
        return throwError(() => this.handleError(error, 'Failed to load attendance statistics'));
      })
    );
  }

  // Get employee attendance summary
  getEmployeeAttendanceSummary(startDate: Date, endDate: Date): Observable<EmployeeAttendanceSummary[]> {
    console.log('AttendanceService: Getting employee attendance summary:', { startDate, endDate });
    
    const params = {
      startDate: startDate.toISOString().split('T')[0],
      endDate: endDate.toISOString().split('T')[0]
    };
    
    return this.http.get<EmployeeAttendanceSummary[]>(`${this.apiUrl}/attendance/summary`, { params }).pipe(
      tap(summary => {
        console.log('AttendanceService: Employee attendance summary:', summary);
      }),
      catchError((error: HttpErrorResponse) => {
        console.error('AttendanceService: Failed to get employee attendance summary:', error);
        return throwError(() => this.handleError(error, 'Failed to load employee attendance summary'));
      })
    );
  }

  // Mark employee present (quick action)
  markPresent(employeeId: string, checkInTime: Date = new Date()): Observable<AttendanceRecord> {
    console.log('AttendanceService: Marking employee present:', { employeeId, checkInTime });
    
    const request: CreateAttendanceRequest = {
      employeeId,
      checkIn: checkInTime,
      notes: 'Marked present via quick action'
    };
    
    return this.createAttendance(request);
  }

  // Mark employee absent (quick action)
  markAbsent(employeeId: string, date: Date = new Date(), reason?: string): Observable<AttendanceRecord> {
    console.log('AttendanceService: Marking employee absent:', { employeeId, date, reason });
    
    // For absent, we create a record with checkIn but mark as absent in notes
    const checkInTime = new Date(date);
    checkInTime.setHours(0, 0, 0, 0); // Set to start of day for absent records
    
    const request: CreateAttendanceRequest = {
      employeeId,
      checkIn: checkInTime,
      notes: reason ? `Absent: ${reason}` : 'Marked absent via quick action'
    };
    
    return this.createAttendance(request);
  }

  // Check out employee
  checkOut(attendanceId: string, checkOutTime: Date): Observable<AttendanceRecord> {
    console.log('AttendanceService: Checking out employee:', { attendanceId, checkOutTime });
    
    return this.updateAttendance(attendanceId, { checkOut: checkOutTime });
  }

  // Calculate hours worked
  calculateHoursWorked(timeIn: string, timeOut: string): number {
    if (!timeIn || !timeOut) return 0;
    
    const [inHours, inMinutes] = timeIn.split(':').map(Number);
    const [outHours, outMinutes] = timeOut.split(':').map(Number);
    
    const inTime = inHours * 60 + inMinutes;
    const outTime = outHours * 60 + outMinutes;
    
    const diffMinutes = outTime - inTime;
    return Math.max(0, diffMinutes / 60);
  }

  // Private helper method for error handling
  private handleError(error: HttpErrorResponse, defaultMessage: string): any {
    let errorMessage = defaultMessage;
    
    if (error.status === 401) {
      errorMessage = 'Authentication failed. Please login again.';
    } else if (error.status === 403) {
      errorMessage = 'You do not have permission to perform this action.';
    } else if (error.status === 404) {
      errorMessage = 'Attendance record not found.';
    } else if (error.status === 500) {
      errorMessage = 'Server error occurred. Please try again later.';
    } else if (error.error?.message) {
      errorMessage = error.error.message;
    } else if (error.error?.detail) {
      errorMessage = error.error.detail;
    }
    
    return { ...error, userMessage: errorMessage };
  }
}