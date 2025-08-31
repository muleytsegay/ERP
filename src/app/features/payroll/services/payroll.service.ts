import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { EmployeePayroll, PayrollSummary } from '../models/payroll.model';
import { HttpClient } from '@angular/common/http';

@Injectable({ providedIn: 'root' })
export class PayrollService {
  // Replace with your actual API base when ready
  private apiBase = ''; // e.g. 'https://api.example.com/payroll'

  constructor(private http: HttpClient) {}

  // Mock data for quick frontend dev. Replace with API call.
  getPayrollSummary(period: string): Observable<PayrollSummary> {
    const mock: PayrollSummary = {
      totalEmployees: 3,
      grossPayroll: 22600,
      netPayroll: 20600,
      totalDeductions: 2000,
    };
    // return this.http.get<PayrollSummary>(`${this.apiBase}/summary?period=${period}`);
    return of(mock);
  }

  getEmployeePayroll(period: string): Observable<EmployeePayroll[]> {
    const mock: EmployeePayroll[] = [
      {
        id: '1',
        name: 'Alice Johnson',
        employeeId: 'EMP001',
        department: 'Engineering',
        baseSalary: 8000,
        allowances: 1200,
        deductions: 800,
        grossSalary: 9200,
        netSalary: 8400,
        status: 'Processed',
      },
      {
        id: '2',
        name: 'Bob Smith',
        employeeId: 'EMP002',
        department: 'Marketing',
        baseSalary: 6500,
        allowances: 800,
        deductions: 650,
        grossSalary: 7300,
        netSalary: 6650,
        status: 'Processed',
      },
      {
        id: '3',
        name: 'Carol Davis',
        employeeId: 'EMP003',
        department: 'HR',
        baseSalary: 5500,
        allowances: 600,
        deductions: 550,
        grossSalary: 6100,
        netSalary: 5550,
        status: 'Pending',
      },
    ];
    // return this.http.get<EmployeePayroll[]>(`${this.apiBase}/employees?period=${period}`);
    return of(mock);
  }

  processPayroll(period: string): Observable<any> {
    // return this.http.post(`${this.apiBase}/process`, { period });
    return of({ success: true, message: 'Processed (mock)' });
  }

  getAllPayrolls(): Observable<EmployeePayroll[]> {
    // For now, we’ll just reuse the mock from getEmployeePayroll
    // Later, replace with your real API when ready
    return this.getEmployeePayroll('all');
  }

  exportPayroll(period: string): Observable<Blob> {
    // Example for API: return this.http.get(`${this.apiBase}/export?period=${period}`, { responseType: 'blob' });
    const blob = new Blob(['mock csv content'], { type: 'text/csv' });
    return of(blob);
  }
}
