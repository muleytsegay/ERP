import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { EmployeePayroll, PayrollSummary } from '../models/payroll.model';
import { HttpClient } from '@angular/common/http';

@Injectable({ providedIn: 'root' })
export class PayrollService {
  //to be Replaced with  actual API base when ready
  private apiBase = ''; // e.g. 'https://api.example.com/payroll'

  constructor(private http: HttpClient) {}

  // Mock data for quick frontend dev. Replace with API call.
  getPayrollSummary(period: string): Observable<PayrollSummary> {
    const mock: PayrollSummary = {
      totalEmployees: 5,
      grossPayroll: 22600,
      netPayroll: 206009,
      totalDeductions: 2100000,
    };
    // return this.http.get<PayrollSummary>(`${this.apiBase}/summary?period=${period}`);
    return of(mock);
  }

  private mock: EmployeePayroll[] = [
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
    {
      id: '4',
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
      id: '5',
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
      id: '6',
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
    {
      id: '7',
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
      id: '8',
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
      id: '9',
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
    {
      id: '10',
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
      id: '11',
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
      id: '12',
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

  getEmployeePayroll(period: string): Observable<EmployeePayroll[]> {
    // return this.http.get<EmployeePayroll[]>(`${this.apiBase}/employees?period=${period}`);
    return of(this.mock);
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
    const data = new Blob([JSON.stringify(this.mock)], { type: 'text/csv' });
    return of(data);
  }

  calculatePayroll(period: string): Observable<any> {
    // return this.http.post(`${this.apiBase}/calculate`, { period });
    return of({ success: true });
  }

  downloadPayslip(employeeId: string): Observable<Blob> {
    // return this.http.get(`${this.apiBase}/payslip/${employeeId}`, {
    //   responseType: 'blob',
    // });
    const payslipContent = `Payslip for Employee ID: ${employeeId}`;
    const blob = new Blob([payslipContent], { type: 'application/pdf' });
    return of(blob);
  }

  getEmployeePayrollPaginated(
    period: string,
    page: number,
    size: number
  ): Observable<EmployeePayroll[]> {
    // return this.http.get<EmployeePayroll[]>(
    //   `${this.apiBase}/employees?period=${period}&page=${page}&size=${size}`
    // );
    return of(this.mock.slice(page * size, (page + 1) * size));
  }

  processAllPayroll(): Observable<any> {
    // return this.http.post(`${this.apiBase}/process/all`, {});

    return of({ success: true });
  }

  approvePayroll(id: string): Observable<any> {
    // return this.http.put(`${this.apiBase}/payroll/${id}/approve`, {});
    return of({ success: true });
  }

  rejectPayroll(id: string): Observable<any> {
    // return this.http.put(`${this.apiBase}/payroll/${id}/reject`, {});
    return of({ success: true });
  }
}
