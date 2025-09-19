import { Injectable } from '@angular/core';
import { BehaviorSubject, forkJoin, Observable } from 'rxjs';
import { PayrollService } from '../services/payroll.service';
import { EmployeePayroll, PayrollSummary } from '../models/payroll.model';

import { finalize, tap } from 'rxjs/operators';

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
    forkJoin({
      summary: this.svc.getPayrollSummary(),
      employees: this.svc.getAllPayrolls(),
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

  loadPaginated(period: string, page: number, size: number) {
    this.loadingSubject.next(true);
    this.svc
      .getAllPayrolls()
      .pipe(finalize(() => this.loadingSubject.next(false)))
      .subscribe((employees) => {
        const start = page * size;
        const paginatedEmployees = employees.slice(start, start + size);
        this.employeesSubject.next(paginatedEmployees);
      });
  }

  process(period: string): Observable<any> {
    return this.svc.processPayroll(period);
  }

  // approvePayroll(id: string): Observable<any> {
  //   return this.svc.approvePayroll?.(id) ?? new Observable();
  // }

  rejectPayroll(id: string): Observable<any> {
    return new Observable((observer) => {
      observer.next(null);
      observer.complete();
    });
  }

  export(period: string): Observable<Blob> {
    return this.svc.exportPayroll(period);
  }

  downloadPayslip(employeeId: string): Observable<Blob> {
    return new Observable((observer) => {
      observer.next(new Blob());
      observer.complete();
    });
  }

  // Update the markAsPaid method
  markAsPaid(id: string): Observable<any> {
    return this.svc.markAsPaid(id).pipe(
      tap(() => {
        // Update the local state to reflect the change
        const employees = this.employeesSubject.value;
        const updatedEmployees = employees.map((emp) =>
          emp.id === id ? { ...emp, status: 'Paid' } : emp
        );
        this.employeesSubject.next(updatedEmployees);
      })
    );
  }

  approvePayroll(id: string): Observable<any> {
    return this.svc.approvePayroll(id).pipe(
      tap((response) => {
        console.log('Approve response:', response);

        // Update the local state based on API response
        const employees = this.employeesSubject.value;
        const updatedEmployees = employees.map((emp) => {
          if (emp.id === id) {
            // Use the status from API response if available, otherwise set to 'Approved'
            return { ...emp, status: response.status || 'Approved' };
          }
          return emp;
        });
        this.employeesSubject.next(updatedEmployees);
      })
    );
  }
  // Update the deletePayroll method
  deletePayroll(id: string): Observable<any> {
    return this.svc.deletePayroll(id).pipe(
      tap(() => {
        // Remove from local state
        const employees = this.employeesSubject.value;
        const updatedEmployees = employees.filter((emp) => emp.id !== id);
        this.employeesSubject.next(updatedEmployees);
      })
    );
  }
}
