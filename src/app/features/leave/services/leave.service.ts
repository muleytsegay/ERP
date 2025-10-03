import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError, BehaviorSubject } from 'rxjs';
import { map, catchError, tap } from 'rxjs/operators';
import {
  LeaveRequest,
  LeaveApplication,
  LeaveApproval,
  LeaveStats,
  EmployeeLeaveStats,
} from '../models/leave.model';
import { AuthService } from '../../../core/services/auth.service';

@Injectable({
  providedIn: 'root',
})
export class LeaveService {
  private readonly apiUrl =
    'https://gateway-microservice.onrender.com/hrms/api/v1';

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
  getLeaves(): Observable<LeaveRequest[]> {
    console.log('LeaveService: Getting all leaves');

    return this.http.get<LeaveRequest[]>(`${this.apiUrl}/leave-requests`).pipe(
      map((leaves) => leaves.map((leave) => this.mapLeaveResponse(leave))),
      tap((leaves) => console.log('LeaveService: Leaves loaded:', leaves)),
      catchError((error) => this.handleError(error, 'Failed to load leaves'))
    );
  }

  getLeave(id: string): Observable<LeaveRequest> {
    console.log('LeaveService: Getting leave by ID:', id);

    return this.http
      .get<LeaveRequest>(`${this.apiUrl}/leave-requests/${id}`)
      .pipe(
        map((leave) => this.mapLeaveResponse(leave)),
        tap((leave) => console.log('LeaveService: Leave loaded:', leave)),
        catchError((error) =>
          this.handleError(error, 'Failed to load leave details')
        )
      );
  }

  getLeavesByEmployee(employeeId: string): Observable<LeaveRequest[]> {
    console.log('LeaveService: Getting leaves for employee:', employeeId);

    return this.http
      .get<LeaveRequest[]>(
        `${this.apiUrl}/leave-requests/employee/${employeeId}`
      )
      .pipe(
        map((leaves) => leaves.map((leave) => this.mapLeaveResponse(leave))),
        tap((leaves) =>
          console.log('LeaveService: Employee leaves loaded:', leaves)
        ),
        catchError((error) =>
          this.handleError(error, 'Failed to load employee leaves')
        )
      );
  }

  getMyLeaves(): Observable<LeaveRequest[]> {
    console.log('LeaveService: Getting current user leaves');
    if (!this.currentUser?.id) {
      return throwError(
        () => new Error('User not authenticated or user ID not found')
      );
    }
    return this.getLeavesByEmployee(this.currentUser.id);
  }

  getPendingLeaves(): Observable<LeaveRequest[]> {
    console.log('LeaveService: Getting pending leaves for approval');

    // Try different possible endpoints - uncomment the correct one:
    // Option 1: Query parameter approach
    return this.http
      .get<LeaveRequest[]>(`${this.apiUrl}/leave-requests?status=pending`)
      .pipe(
        map((leaves) => leaves.map((leave) => this.mapLeaveResponse(leave))),
        tap((leaves) =>
          console.log('LeaveService: Pending leaves loaded:', leaves)
        ),
        catchError((error) =>
          this.handleError(error, 'Failed to load pending leaves')
        )
      );

    // Option 2: Route parameter approach (uncomment if above doesn't work)
    // return this.http
    //   .get<LeaveRequest[]>(`${this.apiUrl}/leave-requests/pending`)
    //   .pipe(
    //     map((leaves) => leaves.map((leave) => this.mapLeaveResponse(leave))),
    //     tap((leaves) =>
    //       console.log('LeaveService: Pending leaves loaded:', leaves)
    //     ),
    //     catchError((error) =>
    //       this.handleError(error, 'Failed to load pending leaves')
    //     )
    //   );

    // Option 3: Status route approach (uncomment if others don't work)
    // return this.http
    //   .get<LeaveRequest[]>(`${this.apiUrl}/leave-requests/status/pending`)
    //   .pipe(
    //     map((leaves) => leaves.map((leave) => this.mapLeaveResponse(leave))),
    //     tap((leaves) =>
    //       console.log('LeaveService: Pending leaves loaded:', leaves)
    //     ),
    //     catchError((error) =>
    //       this.handleError(error, 'Failed to load pending leaves')
    //     )
    //   );
  }

  applyLeave(application: LeaveApplication): Observable<LeaveRequest> {
    console.log('LeaveService: Applying for leave:', application);

    // Validate required fields
    if (
      !application.employeeId ||
      !application.startDate ||
      !application.endDate ||
      !application.reason
    ) {
      return throwError(
        () => new Error('Missing required fields for leave application')
      );
    }

    // Validate dates
    if (application.startDate > application.endDate) {
      return throwError(() => new Error('Start date cannot be after end date'));
    }

    // Try without employeeId first - backend might get it from auth token
    const leaveData = {
      startDate: application.startDate.toISOString(),
      endDate: application.endDate.toISOString(),
      reason: application.reason.trim(),
    };

    // Alternative: Try with different date format if the above fails
    // const leaveData = {
    //   startDate: application.startDate.toISOString().split('T')[0], // YYYY-MM-DD format
    //   endDate: application.endDate.toISOString().split('T')[0],
    //   reason: application.reason.trim(),
    // };

    console.log('LeaveService: Sending leave data to API:', leaveData);
    console.log('LeaveService: API URL:', `${this.apiUrl}/leave-requests`);
    console.log('LeaveService: Current user:', this.currentUser);
    console.log(
      'LeaveService: Auth token exists:',
      !!this.authService.getToken()
    );

    return this.http
      .post<LeaveRequest>(`${this.apiUrl}/leave-requests/me`, leaveData)
      .pipe(
        map((leave) => this.mapLeaveResponse(leave)),
        tap((leave) =>
          console.log('LeaveService: Leave application submitted:', leave)
        ),
        catchError((error) =>
          this.handleError(error, 'Failed to submit leave application')
        )
      );
  }

  // Alias method for creating leave requests (same as applyLeave)
  // createLeave(application: LeaveApplication): Observable<LeaveRequest> {
  //   return this.applyLeave(application);
  // }

  approveLeave(approval: LeaveApproval): Observable<LeaveRequest> {
    console.log('LeaveService: Approving leave:', approval);

    // Backend only expects status field
    const approvalData = {
      status: 'approved',
    };

    console.log('LeaveService: Sending approval data:', approvalData);
    console.log(
      'LeaveService: API endpoint:',
      `${this.apiUrl}/leave-requests/${approval.leaveId}/status`
    );
    console.log('LeaveService: Current user for approval:', this.currentUser);

    return this.http
      .put<LeaveRequest>(
        `${this.apiUrl}/leave-requests/${approval.leaveId}/status`,
        approvalData
      )
      .pipe(
        map((leave) => this.mapLeaveResponse(leave)),
        tap((leave) => console.log('LeaveService: Leave approved:', leave)),
        catchError((error) => {
          console.error('LeaveService: Approval failed with detailed error:', {
            error: error,
            requestData: approvalData,
            endpoint: `${this.apiUrl}/leave-requests/${approval.leaveId}/status`,
            leaveId: approval.leaveId,
            errorDetails: error.error,
          });
          return this.handleError(error, 'Failed to approve leave');
        })
      );
  }

  rejectLeave(approval: LeaveApproval): Observable<LeaveRequest> {
    console.log('LeaveService: Rejecting leave:', approval);

    // Backend only expects status field
    const rejectionData = {
      status: 'rejected',
    };

    console.log('LeaveService: Sending rejection data:', rejectionData);
    console.log(
      'LeaveService: API endpoint:',
      `${this.apiUrl}/leave-requests/${approval.leaveId}/status`
    );
    console.log('LeaveService: Current user for rejection:', this.currentUser);

    return this.http
      .put<LeaveRequest>(
        `${this.apiUrl}/leave-requests/${approval.leaveId}/status`,
        rejectionData
      )
      .pipe(
        map((leave) => this.mapLeaveResponse(leave)),
        tap((leave) => console.log('LeaveService: Leave rejected:', leave)),
        catchError((error) => {
          console.error('LeaveService: Rejection failed with detailed error:', {
            error: error,
            requestData: rejectionData,
            endpoint: `${this.apiUrl}/leave-requests/${approval.leaveId}/status`,
            leaveId: approval.leaveId,
            errorDetails: error.error,
          });
          return this.handleError(error, 'Failed to reject leave');
        })
      );
  }
  cancelLeave(id: string): Observable<LeaveRequest> {
    console.log('LeaveService: Cancelling leave:', id);

    return this.http
      .post<LeaveRequest>(`${this.apiUrl}/leaves/${id}/cancel`, {})
      .pipe(
        map((leave) => this.mapLeaveResponse(leave)),
        tap((leave) => console.log('LeaveService: Leave cancelled:', leave)),
        catchError((error) => this.handleError(error, 'Failed to cancel leave'))
      );
  }

  updateLeave(
    id: string,
    leave: Partial<LeaveRequest>
  ): Observable<LeaveRequest> {
    console.log('LeaveService: Updating leave:', { id, leave });

    return this.http
      .put<LeaveRequest>(`${this.apiUrl}/leave-requests/${id}`, leave)
      .pipe(
        map((leave) => this.mapLeaveResponse(leave)),
        tap((leave) => console.log('LeaveService: Leave updated:', leave)),
        catchError((error) => this.handleError(error, 'Failed to update leave'))
      );
  }

  deleteLeave(id: string): Observable<void> {
    console.log('LeaveService: Deleting leave:', id);

    return this.http.delete<void>(`${this.apiUrl}/leave-requests/${id}`).pipe(
      tap(() => console.log('LeaveService: Leave deleted successfully')),
      catchError((error) => this.handleError(error, 'Failed to delete leave'))
    );
  }

  // Statistics and Reports
  getLeaveStats(): Observable<LeaveStats> {
    console.log('LeaveService: Getting leave statistics');

    return this.http.get<LeaveStats>(`${this.apiUrl}/leaves/stats`).pipe(
      tap((stats) =>
        console.log('LeaveService: Leave statistics loaded:', stats)
      ),
      catchError((error) =>
        this.handleError(error, 'Failed to load leave statistics')
      )
    );
  }

  getEmployeeLeaveStats(): Observable<EmployeeLeaveStats[]> {
    console.log('LeaveService: Getting employee leave statistics');

    return this.http
      .get<EmployeeLeaveStats[]>(`${this.apiUrl}/leaves/employee-stats`)
      .pipe(
        tap((stats) =>
          console.log('LeaveService: Employee leave statistics loaded:', stats)
        ),
        catchError((error) =>
          this.handleError(error, 'Failed to load employee leave statistics')
        )
      );
  }

  getLeaveReport(
    startDate: Date,
    endDate: Date,
    departmentId?: string
  ): Observable<any> {
    console.log('LeaveService: Getting leave report:', {
      startDate,
      endDate,
      departmentId,
    });

    const params: any = {
      startDate: startDate.toISOString().split('T')[0],
      endDate: endDate.toISOString().split('T')[0],
    };

    if (departmentId) {
      params.departmentId = departmentId;
    }

    return this.http.get<any>(`${this.apiUrl}/leaves/report`, { params }).pipe(
      tap((report) =>
        console.log('LeaveService: Leave report loaded:', report)
      ),
      catchError((error) =>
        this.handleError(error, 'Failed to load leave report')
      )
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
    const userRole = this.currentUser?.role?.toLowerCase?.();
    console.log('LeaveService: canManageLeaves check:', {
      currentUser: this.currentUser,
      userRole: userRole,
      canManage: userRole === 'hr' || userRole === 'admin',
    });
    return userRole === 'hr' || userRole === 'admin';
  }

  canApproveLeaves(): boolean {
    const userRole = this.currentUser?.role?.toLowerCase?.();
    console.log('LeaveService: canApproveLeaves check:', {
      currentUser: this.currentUser,
      userRole: userRole,
      canApprove: userRole === 'hr' || userRole === 'admin',
    });
    return userRole === 'hr' || userRole === 'admin';
  }

  // Private helper methods
  private mapLeaveResponse(leave: any): LeaveRequest {
    return {
      ...leave,
      startDate: new Date(leave.startDate),
      endDate: new Date(leave.endDate),
      appliedDate: new Date(leave.appliedDate),
      approvedDate: leave.approvedDate
        ? new Date(leave.approvedDate)
        : undefined,
      rejectedDate: leave.rejectedDate
        ? new Date(leave.rejectedDate)
        : undefined,
      createdAt: new Date(leave.createdAt),
      updatedAt: new Date(leave.updatedAt),
    };
  }

  private handleError(
    error: HttpErrorResponse,
    defaultMessage: string
  ): Observable<never> {
    let errorMessage = defaultMessage;

    console.error('LeaveService Error Details:', {
      status: error.status,
      statusText: error.statusText,
      url: error.url,
      error: error.error,
      message: error.message,
      headers: error.headers,
    });

    if (error.status === 400) {
      if (error.error?.message) {
        errorMessage = error.error.message;
      } else if (error.error?.detail) {
        errorMessage = error.error.detail;
      } else if (error.error?.errors) {
        // Handle validation errors
        const validationErrors = Object.values(error.error.errors).flat();
        errorMessage = `Validation failed: ${validationErrors.join(', ')}`;
      } else {
        errorMessage = 'Invalid request data. Please check your input.';
      }
    } else if (error.status === 401) {
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
