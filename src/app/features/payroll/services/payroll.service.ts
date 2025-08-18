import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import {
  Payroll,
  Payslip,
  SalaryCalculationRequest,
} from '../models/payroll.model';

@Injectable({
  providedIn: 'root',
})
export class PayrollService {
  private apiUrl = 'http://localhost:3000/api/v1';

  constructor(private http: HttpClient) {}

  // Payroll operations
  getPayrolls(): Observable<Payroll[]> {
    return this.http.get<Payroll[]>(`${this.apiUrl}/payroll`);
  }

  getPayroll(id: string): Observable<Payroll> {
    return this.http.get<Payroll>(`${this.apiUrl}/payroll/${id}`);
  }

  getPayrollsByEmployee(employeeId: string): Observable<Payroll[]> {
    return this.http.get<Payroll[]>(
      `${this.apiUrl}/payroll/employee/${employeeId}`
    );
  }

  calculateSalary(request: SalaryCalculationRequest): Observable<Payroll> {
    return this.http.post<Payroll>(`${this.apiUrl}/payroll/calculate`, request);
  }

  processPayroll(id: string): Observable<Payroll> {
    return this.http.post<Payroll>(`${this.apiUrl}/payroll/${id}/process`, {});
  }

  approvePayroll(id: string): Observable<Payroll> {
    return this.http.post<Payroll>(`${this.apiUrl}/payroll/${id}/approve`, {});
  }

  rejectPayroll(id: string, reason: string): Observable<Payroll> {
    return this.http.post<Payroll>(`${this.apiUrl}/payroll/${id}/reject`, {
      reason,
    });
  }

  updatePayroll(id: string, payroll: Partial<Payroll>): Observable<Payroll> {
    return this.http.put<Payroll>(`${this.apiUrl}/payroll/${id}`, payroll);
  }

  deletePayroll(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/payroll/${id}`);
  }

  // Payslip operations
  generatePayslip(payrollId: string): Observable<Payslip> {
    return this.http.post<Payslip>(
      `${this.apiUrl}/payroll/${payrollId}/payslip`,
      {}
    );
  }

  getPayslip(id: string): Observable<Payslip> {
    return this.http.get<Payslip>(`${this.apiUrl}/payslips/${id}`);
  }

  getPayslipsByEmployee(employeeId: string): Observable<Payslip[]> {
    return this.http.get<Payslip[]>(
      `${this.apiUrl}/payslips/employee/${employeeId}`
    );
  }

  downloadPayslip(id: string): Observable<Blob> {
    return this.http.get(`${this.apiUrl}/payslips/${id}/download`, {
      responseType: 'blob',
    });
  }

  // Bulk operations
  processBulkPayroll(
    employeeIds: string[],
    payPeriodStart: Date,
    payPeriodEnd: Date
  ): Observable<Payroll[]> {
    return this.http.post<Payroll[]>(`${this.apiUrl}/payroll/bulk-process`, {
      employeeIds,
      payPeriodStart,
      payPeriodEnd,
    });
  }

  // Reports
  getPayrollSummary(startDate: Date, endDate: Date): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/payroll/summary`, {
      params: {
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString(),
      },
    });
  }

  getPayrollReport(
    startDate: Date,
    endDate: Date,
    departmentId?: string
  ): Observable<any> {
    const params: any = {
      startDate: startDate.toISOString(),
      endDate: endDate.toISOString(),
    };

    if (departmentId) {
      params.departmentId = departmentId;
    }

    return this.http.get<any>(`${this.apiUrl}/payroll/report`, { params });
  }
}
