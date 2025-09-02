import { Injectable } from '@angular/core';
import { BehaviorSubject, forkJoin, Observable } from 'rxjs';
import { PayrollService } from '../services/payroll.service';
import { EmployeePayroll, PayrollSummary } from '../models/payroll.model';
import { finalize } from 'rxjs/operators';

@Injectable({ providedIn: 'root' })
export class PayrollFacade {
  private summarySubject = new BehaviorSubject<PayrollSummary | null>(null);
  private employeesSubject = new BehaviorSubject<EmployeePayroll[]>([]);
  private loadingSubject = new BehaviorSubject<boolean>(false);

  readonly summary$ = this.summarySubject.asObservable();
  readonly employees$ = this.employeesSubject.asObservable();
  readonly loading$ = this.loadingSubject.asObservable();

  constructor(private svc: PayrollService) {}

  load(period: string) {
    this.loadingSubject.next(true);
    // parallel calls; adjust if API different
    forkJoin({
      summary: this.svc.getPayrollSummary(period),
      employees: this.svc.getEmployeePayroll(period),
    })
      .pipe(finalize(() => this.loadingSubject.next(false)))
      .subscribe({
        next: (res) => {
          this.summarySubject.next(res.summary);
          this.employeesSubject.next(res.employees);
        },
        error: (err) => {
          console.error('Payroll load error', err);
          this.loadingSubject.next(false);
        },
      });
  }

  process(period: string): Observable<any> {
    return this.svc.processPayroll(period);
  }
  /**
   * Exports payroll data as a CSV file.
   */
  export(period: string): Observable<Blob> {
    return this.svc.exportPayroll(period);
  }

  /**
   * Calculates payroll and refreshes data.
   */
  calculatePayroll(period: string): Observable<any> {
    return this.svc.calculatePayroll(period);
  }

  /**
   * Loads paginated data for lazy tables.
   */
  loadPaginated(period: string, page: number, size: number) {
    this.loadingSubject.next(true);
    this.svc
      .getEmployeePayrollPaginated(period, page, size)
      .pipe(finalize(() => this.loadingSubject.next(false)))
      .subscribe((employees) => {
        this.employeesSubject.next(employees);
      });
  }

  /**
   * Processes all pending payrolls.
   */
  processAll(): Observable<any> {
    return this.svc.processAllPayroll();
  }
  /**
   * Approves a specific employee's payroll.
   */
  approvePayroll(id: string): Observable<any> {
    return this.svc.approvePayroll(id);
  }
  /**
   * Rejects a specific employee's payroll.
   */
  rejectPayroll(id: string): Observable<any> {
    return this.svc.rejectPayroll(id);
  }
  /**
   * Downloads the payslip for a specific employee.
   */
  downloadPayslip(employeeId: string): Observable<Blob> {
    return this.svc.downloadPayslip(employeeId);
  }
}
