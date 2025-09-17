import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Leave, LeaveBalance, LeaveType, LeaveApplication, LeaveApproval } from '../nodels/leave.model';

@Injectable({
  providedIn: 'root'
})
export class LeaveService {
  private apiUrl = 'https://gateway-microservice.onrender.com/hrms/api/v1';

  constructor(private http: HttpClient) {}

  // Leave CRUD operations
  getLeaves(): Observable<Leave[]> {
    return this.http.get<Leave[]>(`${this.apiUrl}/leaves`);
  }

  getLeave(id: string): Observable<Leave> {
    return this.http.get<Leave>(`${this.apiUrl}/leaves/${id}`);
  }

  getLeavesByEmployee(employeeId: string): Observable<Leave[]> {
    return this.http.get<Leave[]>(`${this.apiUrl}/leaves/employee/${employeeId}`);
  }

  getPendingLeaves(): Observable<Leave[]> {
    return this.http.get<Leave[]>(`${this.apiUrl}/leaves/pending`);
  }

  applyLeave(application: LeaveApplication): Observable<Leave> {
    const formData = new FormData();
    formData.append('employeeId', application.employeeId);
    formData.append('leaveTypeId', application.leaveTypeId);
    formData.append('startDate', application.startDate.toISOString());
    formData.append('endDate', application.endDate.toISOString());
    formData.append('reason', application.reason);

    if (application.attachments) {
      application.attachments.forEach((file, index) => {
        formData.append('attachments', file);
      });
    }

    return this.http.post<Leave>(`${this.apiUrl}/leaves/apply`, formData);
  }

  approveLeave(approval: LeaveApproval): Observable<Leave> {
    return this.http.post<Leave>(`${this.apiUrl}/leaves/${approval.leaveId}/approve`, {
      comments: approval.comments
    });
  }

  rejectLeave(approval: LeaveApproval): Observable<Leave> {
    return this.http.post<Leave>(`${this.apiUrl}/leaves/${approval.leaveId}/reject`, {
      comments: approval.comments
    });
  }

  cancelLeave(id: string): Observable<Leave> {
    return this.http.post<Leave>(`${this.apiUrl}/leaves/${id}/cancel`, {});
  }

  updateLeave(id: string, leave: Partial<Leave>): Observable<Leave> {
    return this.http.put<Leave>(`${this.apiUrl}/leaves/${id}`, leave);
  }

  deleteLeave(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/leaves/${id}`);
  }

  // Leave Balance operations
  getLeaveBalance(employeeId: string): Observable<LeaveBalance[]> {
    return this.http.get<LeaveBalance[]>(`${this.apiUrl}/leave-balance/employee/${employeeId}`);
  }

  getLeaveBalanceByType(employeeId: string, leaveTypeId: string): Observable<LeaveBalance> {
    return this.http.get<LeaveBalance>(`${this.apiUrl}/leave-balance/employee/${employeeId}/type/${leaveTypeId}`);
  }

  updateLeaveBalance(id: string, balance: Partial<LeaveBalance>): Observable<LeaveBalance> {
    return this.http.put<LeaveBalance>(`${this.apiUrl}/leave-balance/${id}`, balance);
  }

  // Leave Type operations
  getLeaveTypes(): Observable<LeaveType[]> {
    return this.http.get<LeaveType[]>(`${this.apiUrl}/leave-types`);
  }

  getActiveLeaveTypes(): Observable<LeaveType[]> {
    return this.http.get<LeaveType[]>(`${this.apiUrl}/leave-types/active`);
  }

  getLeaveType(id: string): Observable<LeaveType> {
    return this.http.get<LeaveType>(`${this.apiUrl}/leave-types/${id}`);
  }

  createLeaveType(leaveType: Omit<LeaveType, 'id' | 'createdAt' | 'updatedAt'>): Observable<LeaveType> {
    return this.http.post<LeaveType>(`${this.apiUrl}/leave-types`, leaveType);
  }

  updateLeaveType(id: string, leaveType: Partial<LeaveType>): Observable<LeaveType> {
    return this.http.put<LeaveType>(`${this.apiUrl}/leave-types/${id}`, leaveType);
  }

  deleteLeaveType(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/leave-types/${id}`);
  }

  // Reports and Analytics
  getLeaveReport(startDate: Date, endDate: Date, departmentId?: string): Observable<any> {
    const params: any = {
      startDate: startDate.toISOString(),
      endDate: endDate.toISOString()
    };
    
    if (departmentId) {
      params.departmentId = departmentId;
    }

    return this.http.get<any>(`${this.apiUrl}/leaves/report`, { params });
  }

  getLeaveStatistics(): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/leaves/statistics`);
  }

  calculateLeaveDays(startDate: Date, endDate: Date): number {
    const start = new Date(startDate);
    const end = new Date(endDate);
    const timeDiff = end.getTime() - start.getTime();
    return Math.ceil(timeDiff / (1000 * 3600 * 24)) + 1;
  }

  isWeekend(date: Date): boolean {
    const day = date.getDay();
    return day === 0 || day === 6; // Sunday = 0, Saturday = 6
  }

  getWorkingDays(startDate: Date, endDate: Date): number {
    let count = 0;
    const current = new Date(startDate);
    const end = new Date(endDate);

    while (current <= end) {
      if (!this.isWeekend(current)) {
        count++;
      }
      current.setDate(current.getDate() + 1);
    }

    return count;
  }
}
