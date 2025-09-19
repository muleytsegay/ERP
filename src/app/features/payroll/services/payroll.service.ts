import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { EmployeePayroll, PayrollSummary } from '../models/payroll.model';
import { Bonus, CreateBonusDto, UpdateBonusDto } from '../models/bonus.model';
import {
  Deduction,
  CreateDeductionDto,
  UpdateDeductionDto,
} from '../models/deduction.model';
import { tap } from 'rxjs/operators';
import { AuthService } from '../../../core/services/auth.service';
@Injectable({ providedIn: 'root' })
export class PayrollService {
  private apiBase = 'https://gateway-microservice.onrender.com/payroll/api/v1';
  private employeeApiBase =
    'https://gateway-microservice.onrender.com/hrms/api/v1';

  constructor(private http: HttpClient) {}

  // Payroll methods
  getAllPayrolls(): Observable<EmployeePayroll[]> {
    return this.http.get<any[]>(`${this.apiBase}/payroll`).pipe(
      map((payrolls) => this.mapToEmployeePayroll(payrolls)),
      catchError(this.handleError('getAllPayrolls'))
    );
  }

  getPayrollById(id: string): Observable<EmployeePayroll> {
    return this.http.get<any>(`${this.apiBase}/payroll/${id}`).pipe(
      map((payroll) => this.mapToSingleEmployeePayroll(payroll)),
      catchError(this.handleError('getPayrollById'))
    );
  }

  processPayroll(period: string): Observable<any> {
    const [monthStr, yearStr] = period.split('-');
    const monthMap: Record<string, number> = {
      jan: 1,
      feb: 2,
      mar: 3,
      apr: 4,
      may: 5,
      jun: 6,
      jul: 7,
      aug: 8,
      sep: 9,
      oct: 10,
      nov: 11,
      dec: 12,
    };
    const month = monthMap[monthStr.toLowerCase()];
    const year = parseInt(yearStr, 10);
    return this.http
      .post(`${this.apiBase}/payroll/actions/process`, { year, month })
      .pipe(catchError(this.handleError('processPayroll')));
  }

  getPayrollSummary(): Observable<PayrollSummary> {
    return this.getAllPayrolls().pipe(
      map((payrolls) => this.computeSummary(payrolls))
    );
  }

  getSalaryStructures(): Observable<any[]> {
    return this.http
      .get<any[]>(`${this.apiBase}/salary-structures`)
      .pipe(catchError(this.handleError('getSalaryStructures')));
  }

  createSalaryStructure(data: any): Observable<any> {
    return this.http
      .post(`${this.apiBase}/salary-structures`, data)
      .pipe(catchError(this.handleError('createSalaryStructure')));
  }

  exportPayroll(period: string): Observable<Blob> {
    return this.getAllPayrolls().pipe(
      map(
        (payrolls) =>
          new Blob([this.convertToCSV(payrolls)], { type: 'text/csv' })
      )
    );
  }

  // Bonus methods
  getAllBonuses(): Observable<Bonus[]> {
    return this.http
      .get<Bonus[]>(`${this.apiBase}/bonuses`)
      .pipe(catchError(this.handleError('getAllBonuses')));
  }

  getBonusById(id: string): Observable<Bonus> {
    return this.http
      .get<Bonus>(`${this.apiBase}/bonuses/${id}`)
      .pipe(catchError(this.handleError('getBonusById')));
  }

  getBonusesByEmployee(employeeId: string): Observable<Bonus[]> {
    return this.http
      .get<Bonus[]>(`${this.apiBase}/bonuses/employee/${employeeId}`)
      .pipe(catchError(this.handleError('getBonusesByEmployee')));
  }

  createBonus(bonus: CreateBonusDto): Observable<any> {
    return this.http
      .post(`${this.apiBase}/bonuses`, bonus)
      .pipe(catchError(this.handleError('createBonus')));
  }

  updateBonus(id: string, bonus: UpdateBonusDto): Observable<any> {
    return this.http
      .put(`${this.apiBase}/bonuses/${id}`, bonus)
      .pipe(catchError(this.handleError('updateBonus')));
  }

  deleteBonus(id: string): Observable<any> {
    return this.http
      .delete(`${this.apiBase}/bonuses/${id}`)
      .pipe(catchError(this.handleError('deleteBonus')));
  }

  // Deduction methods
  getAllDeductions(): Observable<Deduction[]> {
    return this.http
      .get<Deduction[]>(`${this.apiBase}/deductions`)
      .pipe(catchError(this.handleError('getAllDeductions')));
  }

  getDeductionById(id: string): Observable<Deduction> {
    return this.http
      .get<Deduction>(`${this.apiBase}/deductions/${id}`)
      .pipe(catchError(this.handleError('getDeductionById')));
  }

  getDeductionsByEmployee(employeeId: string): Observable<Deduction[]> {
    return this.http
      .get<Deduction[]>(`${this.apiBase}/deductions/employee/${employeeId}`)
      .pipe(catchError(this.handleError('getDeductionsByEmployee')));
  }

  createDeduction(deduction: CreateDeductionDto): Observable<any> {
    return this.http
      .post(`${this.apiBase}/deductions`, deduction)
      .pipe(catchError(this.handleError('createDeduction')));
  }

  updateDeduction(id: string, deduction: UpdateDeductionDto): Observable<any> {
    return this.http
      .put(`${this.apiBase}/deductions/${id}`, deduction)
      .pipe(catchError(this.handleError('updateDeduction')));
  }

  deleteDeduction(id: string): Observable<any> {
    return this.http
      .delete(`${this.apiBase}/deductions/${id}`)
      .pipe(catchError(this.handleError('deleteDeduction')));
  }
  // Update the markAsPaid method to use the correct API endpoint
  markAsPaid(id: string): Observable<any> {
    // The API endpoint is /api/v1/payroll/{id}/pay according to the swagger
    return this.http
      .post(`${this.apiBase}/payroll/${id}/pay`, {
        payDateUtc: new Date().toISOString(),
      })
      .pipe(catchError(this.handleError('markAsPaid')));
  }

  // Add the approvePayroll method that was missing
  approvePayroll(id: string): Observable<any> {
    return this.http.post(`${this.apiBase}/payroll/${id}/approve`, {}).pipe(
      tap((response) => console.log('Approve API response:', response)),
      catchError(this.handleError('approvePayroll'))
    );
  }

  deletePayroll(id: string): Observable<any> {
    return this.http
      .delete(`${this.apiBase}/payroll/${id}`)
      .pipe(catchError(this.handleError('deletePayroll')));
  }

  // getAllEmployees(): Observable<any[]> {
  //   return this.http
  //     .get<any[]>(`${this.employeeApiBase}/employees`)
  //     .pipe(catchError(this.handleError('getAllEmployees')));
  // }

  getAllEmployees(): Observable<any[]> {
    return this.http.get<any[]>(`${this.employeeApiBase}/employees`).pipe(
      map((employees: any[]) =>
        employees.map((emp) => ({
          id: emp.id,
          name: `${emp.firstName} ${emp.lastName}`.trim(),
          firstName: emp.firstName,
          lastName: emp.lastName,
          email: emp.email,
        }))
      ),
      catchError(this.handleError('getAllEmployees'))
    );
  }

  // Helper methods
  private mapToEmployeePayroll(payrolls: any[]): EmployeePayroll[] {
    return payrolls.map((p) => this.mapToSingleEmployeePayroll(p));
  }

  private mapToSingleEmployeePayroll(p: any): EmployeePayroll {
    return {
      id: p.id,
      employeeId: p.employeeId,
      name: p.employeeName || `Employee ${p.employeeId?.substring(0, 8)}`,
      basicSalary: p.basicSalary,
      totalAllowances: p.totalAllowances,
      totalDeductions: p.totalDeductions,
      grossPay: p.grossPay,
      netPay: p.netPay,
      status: p.status,
      payDateUtc: p.payDateUtc,
    };
  }

  private computeSummary(payrolls: EmployeePayroll[]): PayrollSummary {
    return {
      totalEmployees: payrolls.length,
      grossPayroll: payrolls.reduce((sum, p) => sum + (p.grossPay || 0), 0),
      netPayroll: payrolls.reduce((sum, p) => sum + (p.netPay || 0), 0),
      totalDeductions: payrolls.reduce(
        (sum, p) => sum + (p.totalDeductions || 0),
        0
      ),
    };
  }

  private convertToCSV(payrolls: EmployeePayroll[]): string {
    const headers = [
      'Employee',
      'Basic Salary',
      'Gross Pay',
      'Deductions',
      'Net Pay',
      'Status',
    ];
    const rows = payrolls.map((p) => [
      p.name || '',
      p.basicSalary?.toString() || '0',
      p.grossPay?.toString() || '0',
      p.totalDeductions?.toString() || '0',
      p.netPay?.toString() || '0',
      p.status || '',
    ]);
    return [headers, ...rows].map((row) => row.join(',')).join('\n');
  }

  private handleError(operation = 'operation') {
    return (error: any) => {
      console.error(`PayrollService ${operation} failed:`, error);
      return throwError(() => error);
    };
  }
}
