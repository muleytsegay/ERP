import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError, BehaviorSubject } from 'rxjs';
import { map, catchError, tap } from 'rxjs/operators';
import { 
  Leave, 
  LeaveBalance, 
  LeaveType, 
  LeaveApplication, 
  LeaveApproval, 
  LeaveStats, 
  EmployeeLeaveStats 
} from '../models/leave.model';
import { AuthService } from '../../../core/services/auth.service';

@Injectable({
  providedIn: 'root'
})
export class LeaveService {
  private readonly apiUrl = 'https://gateway-microservice.onrender.com/hrms/api/v1';


  private currentUser: any = null;
  private currentUserSub = new BehaviorSubject<any>(null);

  constructor(
    private readonly http: HttpClient,
    private readonly authService: AuthService
  ) {
    this.authService.currentUser$.subscribe((user: any) => {
      this.currentUser = user;
      this.currentUserSub.next(user);
    });
  }

  // Leave CRUD operations with role-based access
  getLeaves(): Observable<Leave[]> {
    console.log('LeaveService: Getting all leaves');
    
    return this.http.get<Leave[]>(`${this.apiUrl}/leaves`).pipe(
      map(leaves => leaves.map(leave => this.mapLeaveResponse(leave))),
      tap(leaves => console.log('LeaveService: Leaves loaded:', leaves)),
      catchError(error => this.handleError(error, 'Failed to load leaves'))
    );
  }

  getLeave(id: string): Observable<Leave> {
    console.log('LeaveService: Getting leave by ID:', id);
    
    return this.http.get<Leave>(`${this.apiUrl}/leaves/${id}`).pipe(
      map(leave => this.mapLeaveResponse(leave)),
      tap(leave => console.log('LeaveService: Leave loaded:', leave)),
      catchError(error => this.handleError(error, 'Failed to load leave details'))
    );
  }

  getLeavesByEmployee(employeeId: string): Observable<Leave[]> {
    console.log('LeaveService: Getting leaves for employee:', employeeId);
    
    return this.http.get<Leave[]>(`${this.apiUrl}/leaves/employee/${employeeId}`).pipe(
      map(leaves => leaves.map(leave => this.mapLeaveResponse(leave))),
      tap(leaves => console.log('LeaveService: Employee leaves loaded:', leaves)),
      catchError(error => this.handleError(error, 'Failed to load employee leaves'))
    );
  }

  getMyLeaves(): Observable<Leave[]> {
    console.log('LeaveService: Getting current user leaves');
    if (!this.currentUser?.employeeId) {
      return throwError(() => new Error('User not authenticated or employee ID not found'));
    }
    return this.getLeavesByEmployee(this.currentUser.employeeId);
  }

  getPendingLeaves(): Observable<Leave[]> {
    console.log('LeaveService: Getting pending leaves for approval');
    
    return this.http.get<Leave[]>(`${this.apiUrl}/leaves/pending`).pipe(
      map(leaves => leaves.map(leave => this.mapLeaveResponse(leave))),
      tap(leaves => console.log('LeaveService: Pending leaves loaded:', leaves)),
      catchError(error => this.handleError(error, 'Failed to load pending leaves'))
    );
  }

  applyLeave(application: LeaveApplication): Observable<Leave> {
    console.log('LeaveService: Applying for leave:', application);
    
    const leaveData = {
      employeeId: application.employeeId,
      leaveTypeId: application.leaveTypeId,
      startDate: application.startDate.toISOString(),
      endDate: application.endDate.toISOString(),
      reason: application.reason,
      isEmergency: application.isEmergency || false
    };
    
    return this.http.post<Leave>(`${this.apiUrl}/leaves/apply`, leaveData).pipe(
      map(leave => this.mapLeaveResponse(leave)),
      tap(leave => console.log('LeaveService: Leave application submitted:', leave)),
      catchError(error => this.handleError(error, 'Failed to submit leave application'))
    );
  }

  approveLeave(approval: LeaveApproval): Observable<Leave> {
    console.log('LeaveService: Approving leave:', approval);
    
    const approvalData = {
      comments: approval.comments,
      approvedBy: approval.approvedBy
    };
    
    return this.http.post<Leave>(`${this.apiUrl}/leaves/${approval.leaveId}/approve`, approvalData).pipe(
      map(leave => this.mapLeaveResponse(leave)),
      tap(leave => console.log('LeaveService: Leave approved:', leave)),
      catchError(error => this.handleError(error, 'Failed to approve leave'))
    );
  }

  rejectLeave(approval: LeaveApproval): Observable<Leave> {
    console.log('LeaveService: Rejecting leave:', approval);
    
    const rejectionData = {
      comments: approval.comments,
      approvedBy: approval.approvedBy
    };
    
    return this.http.post<Leave>(`${this.apiUrl}/leaves/${approval.leaveId}/reject`, rejectionData).pipe(
      map(leave => this.mapLeaveResponse(leave)),
      tap(leave => console.log('LeaveService: Leave rejected:', leave)),
      catchError(error => this.handleError(error, 'Failed to reject leave'))
    );
  }
  cancelLeave(id: string): Observable<Leave> {
    console.log('LeaveService: Cancelling leave:', id);
    
    return this.http.post<Leave>(`${this.apiUrl}/leaves/${id}/cancel`, {}).pipe(
      map(leave => this.mapLeaveResponse(leave)),
      tap(leave => console.log('LeaveService: Leave cancelled:', leave)),
      catchError(error => this.handleError(error, 'Failed to cancel leave'))
    );
  }

  updateLeave(id: string, leave: Partial<Leave>): Observable<Leave> {
    console.log('LeaveService: Updating leave:', { id, leave });
    
    return this.http.put<Leave>(`${this.apiUrl}/leaves/${id}`, leave).pipe(
      map(leave => this.mapLeaveResponse(leave)),
      tap(leave => console.log('LeaveService: Leave updated:', leave)),
      catchError(error => this.handleError(error, 'Failed to update leave'))
    );
  }

  deleteLeave(id: string): Observable<void> {
    console.log('LeaveService: Deleting leave:', id);
    
    return this.http.delete<void>(`${this.apiUrl}/leaves/${id}`).pipe(
      tap(() => console.log('LeaveService: Leave deleted successfully')),
      catchError(error => this.handleError(error, 'Failed to delete leave'))
    );
  }

  // Leave Balance operations
  getLeaveBalance(employeeId: string): Observable<LeaveBalance[]> {
    console.log('LeaveService: Getting leave balance for employee:', employeeId);
    
    return this.http.get<LeaveBalance[]>(`${this.apiUrl}/leave-balance/employee/${employeeId}`).pipe(
      map(balances => balances.map(balance => this.mapLeaveBalanceResponse(balance))),
      tap(balances => console.log('LeaveService: Leave balances loaded:', balances)),
      catchError(error => this.handleError(error, 'Failed to load leave balance'))
    );
  }

  getMyLeaveBalance(): Observable<LeaveBalance[]> {
    console.log('LeaveService: Getting current user leave balance');
    if (!this.currentUser?.employeeId) {
      return throwError(() => new Error('User not authenticated or employee ID not found'));
    }
    return this.getLeaveBalance(this.currentUser.employeeId);
  }

  getLeaveBalanceByType(employeeId: string, leaveTypeId: string): Observable<LeaveBalance> {
    console.log('LeaveService: Getting leave balance by type:', { employeeId, leaveTypeId });
    
    return this.http.get<LeaveBalance>(`${this.apiUrl}/leave-balance/employee/${employeeId}/type/${leaveTypeId}`).pipe(
      map(balance => this.mapLeaveBalanceResponse(balance)),
      tap(balance => console.log('LeaveService: Leave balance by type loaded:', balance)),
      catchError(error => this.handleError(error, 'Failed to load leave balance by type'))
    );
  }

  updateLeaveBalance(id: string, balance: Partial<LeaveBalance>): Observable<LeaveBalance> {
    console.log('LeaveService: Updating leave balance:', { id, balance });
    
    return this.http.put<LeaveBalance>(`${this.apiUrl}/leave-balance/${id}`, balance).pipe(
      map(balance => this.mapLeaveBalanceResponse(balance)),
      tap(balance => console.log('LeaveService: Leave balance updated:', balance)),
      catchError(error => this.handleError(error, 'Failed to update leave balance'))
    );
  }

  // Leave Type operations
  getLeaveTypes(): Observable<LeaveType[]> {
    console.log('LeaveService: Getting all leave types');
    
    return this.http.get<LeaveType[]>(`${this.apiUrl}/leave-types`).pipe(
      map(types => types.map(type => this.mapLeaveTypeResponse(type))),
      tap(types => console.log('LeaveService: Leave types loaded:', types)),
      catchError(error => this.handleError(error, 'Failed to load leave types'))
    );
  }

  getActiveLeaveTypes(): Observable<LeaveType[]> {
    console.log('LeaveService: Getting active leave types');
    
    return this.http.get<LeaveType[]>(`${this.apiUrl}/leave-types/active`).pipe(
      map(types => types.map(type => this.mapLeaveTypeResponse(type))),
      tap(types => console.log('LeaveService: Active leave types loaded:', types)),
      catchError(error => this.handleError(error, 'Failed to load active leave types'))
    );
  }

  getLeaveType(id: string): Observable<LeaveType> {
    console.log('LeaveService: Getting leave type by ID:', id);
    
    return this.http.get<LeaveType>(`${this.apiUrl}/leave-types/${id}`).pipe(
      map(type => this.mapLeaveTypeResponse(type)),
      tap(type => console.log('LeaveService: Leave type loaded:', type)),
      catchError(error => this.handleError(error, 'Failed to load leave type'))
    );
  }

  createLeaveType(leaveType: Omit<LeaveType, 'id' | 'createdAt' | 'updatedAt'>): Observable<LeaveType> {
    console.log('LeaveService: Creating leave type:', leaveType);
    
    return this.http.post<LeaveType>(`${this.apiUrl}/leave-types`, leaveType).pipe(
      map(type => this.mapLeaveTypeResponse(type)),
      tap(type => console.log('LeaveService: Leave type created:', type)),
      catchError(error => this.handleError(error, 'Failed to create leave type'))
    );
  }

  updateLeaveType(id: string, leaveType: Partial<LeaveType>): Observable<LeaveType> {
    console.log('LeaveService: Updating leave type:', { id, leaveType });
    
    return this.http.put<LeaveType>(`${this.apiUrl}/leave-types/${id}`, leaveType).pipe(
      map(type => this.mapLeaveTypeResponse(type)),
      tap(type => console.log('LeaveService: Leave type updated:', type)),
      catchError(error => this.handleError(error, 'Failed to update leave type'))
    );
  }

  deleteLeaveType(id: string): Observable<void> {
    console.log('LeaveService: Deleting leave type:', id);
    
    return this.http.delete<void>(`${this.apiUrl}/leave-types/${id}`).pipe(
      tap(() => console.log('LeaveService: Leave type deleted successfully')),
      catchError(error => this.handleError(error, 'Failed to delete leave type'))
    );
  }

  // Statistics and Reports
  getLeaveStats(): Observable<LeaveStats> {
    console.log('LeaveService: Getting leave statistics');
    
    return this.http.get<LeaveStats>(`${this.apiUrl}/leaves/stats`).pipe(
      tap(stats => console.log('LeaveService: Leave statistics loaded:', stats)),
      catchError(error => this.handleError(error, 'Failed to load leave statistics'))
    );
  }

  getEmployeeLeaveStats(): Observable<EmployeeLeaveStats[]> {
    console.log('LeaveService: Getting employee leave statistics');
    
    return this.http.get<EmployeeLeaveStats[]>(`${this.apiUrl}/leaves/employee-stats`).pipe(
      tap(stats => console.log('LeaveService: Employee leave statistics loaded:', stats)),
      catchError(error => this.handleError(error, 'Failed to load employee leave statistics'))
    );
  }

  getLeaveReport(startDate: Date, endDate: Date, departmentId?: string): Observable<any> {
    console.log('LeaveService: Getting leave report:', { startDate, endDate, departmentId });
    
    const params: any = {
      startDate: startDate.toISOString().split('T')[0],
      endDate: endDate.toISOString().split('T')[0]
    };
    
    if (departmentId) {
      params.departmentId = departmentId;
    }

    return this.http.get<any>(`${this.apiUrl}/leaves/report`, { params }).pipe(
      tap(report => console.log('LeaveService: Leave report loaded:', report)),
      catchError(error => this.handleError(error, 'Failed to load leave report'))
    );
  }

  // Utility methods
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

  // Check if user can access leave management features
  canManageLeaves(): boolean {
    return this.currentUser?.role === 'HR' || this.currentUser?.role === 'ADMIN';
  }

  canApproveLeaves(): boolean {
    return this.currentUser?.role === 'HR' || this.currentUser?.role === 'ADMIN' || this.currentUser?.role === 'MANAGER';
  }

  // Private helper methods
  private mapLeaveResponse(leave: any): Leave {
    return {
      ...leave,
      startDate: new Date(leave.startDate),
      endDate: new Date(leave.endDate),
      appliedDate: new Date(leave.appliedDate),
      approvedDate: leave.approvedDate ? new Date(leave.approvedDate) : undefined,
      rejectedDate: leave.rejectedDate ? new Date(leave.rejectedDate) : undefined,
      createdAt: new Date(leave.createdAt),
      updatedAt: new Date(leave.updatedAt)
    };
  }

  private mapLeaveBalanceResponse(balance: any): LeaveBalance {
    return {
      ...balance,
      createdAt: balance.createdAt ? new Date(balance.createdAt) : undefined,
      updatedAt: balance.updatedAt ? new Date(balance.updatedAt) : undefined
    };
  }

  private mapLeaveTypeResponse(type: any): LeaveType {
    return {
      ...type,
      createdAt: new Date(type.createdAt),
      updatedAt: new Date(type.updatedAt)
    };
  }

  private handleError(error: HttpErrorResponse, defaultMessage: string): Observable<never> {
    let errorMessage = defaultMessage;
    
    if (error.status === 401) {
      errorMessage = 'Authentication failed. Please login again.';
    } else if (error.status === 403) {
      errorMessage = 'You do not have permission to perform this action.';
    } else if (error.status === 404) {
      errorMessage = 'Leave record not found.';
    } else if (error.status === 500) {
      errorMessage = 'Server error occurred. Please try again later.';
    } else if (error.error?.message) {
      errorMessage = error.error.message;
    } else if (error.error?.detail) {
      errorMessage = error.error.detail;
    }
    
    console.error('LeaveService Error:', error);
    return throwError(() => ({ ...error, userMessage: errorMessage }));
  }
}
