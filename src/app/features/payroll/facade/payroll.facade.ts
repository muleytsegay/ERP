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

  export(period: string): Observable<Blob> {
    return this.svc.exportPayroll(period);
  }
}
