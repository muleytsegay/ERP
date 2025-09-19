// import { Component, OnInit } from '@angular/core';
// import { CommonModule } from '@angular/common';
// import { FormsModule } from '@angular/forms';
// import { PayrollFacade } from '../../facade/payroll.facade';
// import { PayrollSummaryComponent } from '../summary-card/payroll-summary.component';
// import { PayrollFilterComponent } from '../filter/payroll-filter.component';
// import { PayrollTableComponent } from '../table/payroll-table.component';
// import { ProgressSpinnerModule } from 'primeng/progressspinner';
// import { PayrollPeriod, EmployeePayroll } from '../../models/payroll.model';
// import { ButtonModule } from 'primeng/button';
// import { Observable } from 'rxjs';
// import { map } from 'rxjs/operators';

// @Component({
//   selector: 'app-payroll-root',
//   standalone: true,
//   imports: [
//     CommonModule,
//     FormsModule,
//     PayrollSummaryComponent,
//     PayrollFilterComponent,
//     PayrollTableComponent,
//     ProgressSpinnerModule,
//     ButtonModule,
//   ],
//   templateUrl: './payroll-root.component.html',
//   styleUrls: ['./payroll-root.component.css'],
// })
// export class PayrollRootComponent implements OnInit {
//   periods: PayrollPeriod[] = [
//     { label: 'December 2024', value: 'dec-2024' },
//     { label: 'November 2024', value: 'nov-2024' },
//   ];
//   selected: PayrollPeriod = this.periods[0];
//   selectedPeriod: string = 'current';

//   summary$!: Observable<any>;
//   employees$!: Observable<EmployeePayroll[]>;
//   loading$!: Observable<boolean>;

//   constructor(private facade: PayrollFacade) {}

//   ngOnInit() {
//     this.summary$ = this.facade.summary$;
//     this.employees$ = this.facade.employees$.pipe(map((e) => e ?? []));
//     this.loading$ = this.facade.loading$;

//     // Load data immediately for default period
//     this.loadFor(this.selected.value);

//     // Force initial employees fetch on first load
//     this.facade.loadPaginated(this.selected.value, 0, 10);
//   }

//   onPeriodChange(val?: string) {
//     this.selected = this.periods.find((p) => p.value === val) || this.selected;
//     this.loadFor(this.selected.value);
//   }

//   loadFor(periodValue: string) {
//     this.facade.load(periodValue);
//   }

//   onProcess(period?: string) {
//     const p = period ?? this.selected.value;
//     this.facade.process(p).subscribe(() => {
//       this.facade.load(p);
//     });
//   }

//   onExport(period?: string) {
//     const p = period ?? this.selected.value;
//     this.facade.export(p).subscribe((blob) => {
//       const url = window.URL.createObjectURL(blob);
//       const a = document.createElement('a');
//       a.href = url;
//       a.download = `payroll_${p}.csv`;
//       a.click();
//       window.URL.revokeObjectURL(url);
//     });
//   }

//   // onCalculatePayroll() {
//   //   const period = this.selected.value;
//   //   this.facade.calculatePayroll(period).subscribe(() => {
//   //     this.loadFor(period);
//   //   });
//   // }

//   onDownloadPayslip(employeeId: string) {
//     this.facade.downloadPayslip(employeeId).subscribe((blob: Blob) => {
//       const url = window.URL.createObjectURL(blob);
//       const a = document.createElement('a');
//       a.href = url;
//       a.download = `payslip_${employeeId}.pdf`;
//       a.click();
//       window.URL.revokeObjectURL(url);
//     });
//   }

//   // onProcessAll() {
//   //   this.facade.processAll().subscribe(() => {
//   //     this.loadFor(this.selected.value);
//   //   });
//   // }

//   onLazyLoad(event: any) {
//     const page = event.first / event.rows;
//     const size = event.rows;
//     this.facade.loadPaginated(this.selected.value, page, size);
//   }

//   // onApprove(employeeId: string) {
//   //   this.facade.approvePayroll(employeeId).subscribe(() => {
//   //     this.loadFor(this.selected.value);
//   //   });
//   // }

//   // onReject(employeeId: string) {
//   //   this.facade.rejectPayroll(employeeId).subscribe(() => {
//   //     this.loadFor(this.selected.value);
//   //   });
//   // }

//   // In your payroll-root.component.ts
//   // Update the onProcessAll method to use process instead
//   onProcessAll() {
//     // Process payroll for the selected period
//     this.facade.process(this.selected.value).subscribe(() => {
//       this.loadFor(this.selected.value);
//     });
//   }

//   // Remove the onCalculatePayroll method as it's not supported

//   // Update the onApprove and onReject methods if needed
//   onApprove(payrollId: string) {
//     this.facade.approvePayroll(payrollId).subscribe(() => {
//       this.loadFor(this.selected.value);
//     });
//   }

//   onReject(payrollId: string) {
//     this.facade.rejectPayroll(payrollId).subscribe(() => {
//       this.loadFor(this.selected.value);
//     });
//   }
// }
// src/app/features/payroll/components/payroll-root.component.ts
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { PayrollFacade } from '../../facade/payroll.facade';
import { PayrollSummaryComponent } from '../summary-card/payroll-summary.component';
import { PayrollFilterComponent } from '../filter/payroll-filter.component';
import { PayrollTableComponent } from '../table/payroll-table.component';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { PayrollPeriod, EmployeePayroll } from '../../models/payroll.model';
import { ButtonModule } from 'primeng/button';
import { Observable } from 'rxjs';
import { map, tap } from 'rxjs/operators';
import { MessageService } from 'primeng/api';
import { ToastModule } from 'primeng/toast';
import { TabViewModule } from 'primeng/tabview';
import { BonusListComponent } from '../bonus-list/bonus-list.component';
import { DeductionListComponent } from '../deduction-list/deduction-list.component';

@Component({
  selector: 'app-payroll-root',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    PayrollSummaryComponent,
    PayrollFilterComponent,
    PayrollTableComponent,
    ProgressSpinnerModule,
    ButtonModule,
    ToastModule,
    TabViewModule,
    BonusListComponent,
    DeductionListComponent,
  ],
  templateUrl: './payroll-root.component.html',
  styleUrls: ['./payroll-root.component.css'],
  providers: [MessageService],
})
export class PayrollRootComponent implements OnInit {
  periods: PayrollPeriod[] = [
    { label: 'September 2025', value: 'sep-2025' },
    { label: 'December 2024', value: 'dec-2024' },
    { label: 'November 2024', value: 'nov-2024' },
  ];
  selected: PayrollPeriod = this.periods[0];
  selectedPeriod: string = 'current';

  // new: activeTab controls which section shows
  activeTab: 'payroll' | 'bonuses' | 'deductions' = 'payroll';

  summary$!: Observable<any>;
  employees$!: Observable<EmployeePayroll[]>;
  loading$!: Observable<boolean>;

  constructor(
    private facade: PayrollFacade,
    private messageService: MessageService
  ) {}

  // ngOnInit() {
  //   this.summary$ = this.facade.summary$;
  //   this.employees$ = this.facade.employees$.pipe(map((e) => e ?? []));
  //   this.loading$ = this.facade.loading$;

  //   // Load data immediately for default period
  //   this.loadFor(this.selected.value);

  //   // Force initial employees fetch on first load
  //   this.facade.loadPaginated(this.selected.value, 0, 10);
  // }
  // In your payroll-root.component.ts, update the ngOnInit method
  ngOnInit() {
    this.summary$ = this.facade.summary$.pipe(
      tap((summary) => console.log('Summary data:', summary))
    );

    this.employees$ = this.facade.employees$.pipe(
      map((e) => e ?? []),
      tap((employees) => console.log('Employees data:', employees))
    );

    this.loading$ = this.facade.loading$.pipe(
      tap((loading) => console.log('Loading state:', loading))
    );

    // initial payroll load
    if (this.activeTab === 'payroll') {
      this.loadFor(this.selected.value);
      this.facade.loadPaginated(this.selected.value, 0, 10);
    }

    // Load data immediately for default period
    // this.loadFor(this.selected.value);

    // Force initial employees fetch on first load
    // this.facade.loadPaginated(this.selected.value, 0, 10);
  }

  // switch visible section
  setActive(tab: 'payroll' | 'bonuses' | 'deductions') {
    if (this.activeTab === tab) return;
    this.activeTab = tab;

    // when coming to payroll, ensure data is loaded
    if (tab === 'payroll') {
      this.loadFor(this.selected.value);
      this.facade.loadPaginated(this.selected.value, 0, 10);
    }
  }

  // onPeriodChange(val?: string) {
  //   this.selected = this.periods.find((p) => p.value === val) || this.selected;
  //   this.loadFor(this.selected.value);
  // }

  // loadFor(periodValue: string) {
  //   this.facade.load(periodValue);
  // }
  activeIndex: number = 0; // default to Payroll tab

  onTabChange(event: any) {
    this.activeIndex = event.index;
  }

  onProcess(period?: string) {
    const p = period ?? this.selected.value;
    this.facade.process(p).subscribe({
      next: (result) => {
        this.messageService.add({
          severity: 'success',
          summary: 'Success',
          detail: 'Payroll processed successfully',
        });
        this.facade.load(p);
      },
      error: (error) => {
        console.error('Payroll processing error:', error);
        this.messageService.add({
          severity: 'error',
          summary: 'Processing Failed',
          detail: 'Failed to process payroll. Please try again later.',
        });
      },
    });
  }

  onExport(period?: string) {
    const p = period ?? this.selected.value;
    this.facade.export(p).subscribe((blob) => {
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `payroll_${p}.csv`;
      a.click();
      window.URL.revokeObjectURL(url);

      this.messageService.add({
        severity: 'success',
        summary: 'Exported',
        detail: 'Payroll data exported successfully',
      });
    });
  }

  onDownloadPayslip(employeeId: string) {
    this.facade.downloadPayslip(employeeId).subscribe((blob: Blob) => {
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `payslip_${employeeId}.pdf`;
      a.click();
      window.URL.revokeObjectURL(url);
    });
  }

  onProcessAll() {
    this.facade.process(this.selected.value).subscribe({
      next: (result) => {
        this.messageService.add({
          severity: 'success',
          summary: 'Success',
          detail: 'Payroll processed successfully',
        });
        this.loadFor(this.selected.value);
      },
      error: (error) => {
        console.error('Payroll processing error:', error);
        this.messageService.add({
          severity: 'error',
          summary: 'Processing Failed',
          detail: 'Failed to process payroll. Please try again later.',
        });
      },
    });
  }

  onLazyLoad(event: any) {
    const page = event.first / event.rows;
    const size = event.rows;
    this.facade.loadPaginated(this.selected.value, page, size);
  }

  // onApprove(payrollId: string) {
  //   this.facade.approvePayroll(payrollId).subscribe({
  //     next: (result) => {
  //       this.messageService.add({
  //         severity: 'success',
  //         summary: 'Approved',
  //         detail: 'Payroll approved successfully',
  //       });
  //       this.loadFor(this.selected.value);
  //     },
  //     error: (error) => {
  //       console.error('Payroll approval error:', error);
  //       this.messageService.add({
  //         severity: 'error',
  //         summary: 'Approval Failed',
  //         detail: 'Failed to approve payroll. Please try again later.',
  //       });
  //     },
  //   });
  // }

  // In your payroll-root.component.ts, update the onPeriodChange method
  onPeriodChange(val?: string) {
    console.log('Period changed to:', val);
    this.selected = this.periods.find((p) => p.value === val) || this.selected;
    console.log('Selected period:', this.selected);
    this.loadFor(this.selected.value);
  }

  // Update the loadFor method
  loadFor(periodValue: string) {
    console.log('Loading data for period:', periodValue);
    this.facade.load(periodValue);
  }

  onReject(payrollId: string) {
    this.facade.rejectPayroll(payrollId).subscribe({
      next: (result) => {
        this.messageService.add({
          severity: 'success',
          summary: 'Rejected',
          detail: 'Payroll rejected successfully',
        });
        this.loadFor(this.selected.value);
      },
      error: (error) => {
        console.error('Payroll rejection error:', error);
        this.messageService.add({
          severity: 'error',
          summary: 'Rejection Failed',
          detail: 'Failed to reject payroll. Please try again later.',
        });
      },
    });
  }
  // Add these methods to your PayrollRootComponent class

  // Add these methods
  onMarkAsPaid(id: string) {
    this.facade.markAsPaid(id).subscribe({
      next: () => {
        this.messageService.add({
          severity: 'success',
          summary: 'Success',
          detail: 'Payroll marked as paid successfully',
        });
      },
      error: (error) => {
        console.error('Mark as paid error:', error);
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Failed to mark payroll as paid. Please try again later.',
        });
      },
    });
  }

  onDelete(id: string) {
    this.facade.deletePayroll(id).subscribe({
      next: () => {
        this.messageService.add({
          severity: 'success',
          summary: 'Success',
          detail: 'Payroll deleted successfully',
        });
      },
      error: (error) => {
        console.error('Delete payroll error:', error);
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Failed to delete payroll. Please try again later.',
        });
      },
    });
  }

  // Also update the onApprove method to use the facade
  onApprove(id: string) {
    this.facade.approvePayroll(id).subscribe({
      next: () => {
        this.messageService.add({
          severity: 'success',
          summary: 'Approved',
          detail: 'Payroll approved successfully',
        });
      },
      error: (error) => {
        console.error('Payroll approval error:', error);
        this.messageService.add({
          severity: 'error',
          summary: 'Approval Failed',
          detail: 'Failed to approve payroll. Please try again later.',
        });
      },
    });
  }
}
