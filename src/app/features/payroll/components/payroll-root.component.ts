// import { Component, OnInit } from '@angular/core';
// import { CommonModule } from '@angular/common';
// import { FormsModule } from '@angular/forms';
// import { PayrollFacade } from '../facade/payroll.facade';
// import { PayrollSummaryComponent } from './payroll-summary.component';
// import { PayrollFilterComponent } from './payroll-filter.component';
// import { PayrollTableComponent } from './payroll-table.component';
// import { ProgressSpinnerModule } from 'primeng/progressspinner';
// import { PayrollPeriod } from '../models/payroll.model';
// import { ButtonModule } from 'primeng/button';
// import { Observable } from 'rxjs';

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
//   template: `
//     <div class="page">
//       <header class="head">
//         <div>
//           <h1>Payroll Management</h1>
//           <p class="muted">Process and manage employee payroll</p>
//         </div>
//         <div class="top-actions">
//           <button
//             pButton
//             label="Calculate Payroll"
//             icon="pi pi-calculator"
//             class="p-button-text"
//           ></button>
//           <button
//             pButton
//             label="Process Payroll"
//             icon="pi pi-play"
//             class="p-button-raised p-button-success"
//             (click)="onProcess()"
//           ></button>
//         </div>
//       </header>

//       <app-payroll-summary [summary]="summary$ | async"></app-payroll-summary>

//       <section class="controls">
//         <app-payroll-filter
//           [periods]="periods"
//           [selected]="selected"
//           (change)="onPeriodChange($event)"
//           (process)="onProcess($event)"
//           (export)="onExport($event)"
//         >
//         </app-payroll-filter>
//       </section>

//       <section class="table-wrap">
//         <ng-container *ngIf="loading$ | async; else tableBlock">
//           <div class="loading"><p-progressSpinner></p-progressSpinner></div>
//         </ng-container>

//         <ng-template #tableBlock>
//           <h3 class="section-title">Payroll Details - {{ selected.label }}</h3>
//           <app-payroll-table
//             [employees]="employees$ | async"
//           ></app-payroll-table>
//         </ng-template>
//       </section>
//     </div>
//   `,
//   styles: [
//     `
//       .page {
//         padding: 18px;
//         max-width: 1100px;
//         margin: 0 auto;
//       }
//       .head {
//         display: flex;
//         justify-content: space-between;
//         align-items: center;
//         margin-bottom: 14px;
//       }
//       .muted {
//         color: #6b7280;
//         margin-top: 2px;
//       }
//       .top-actions {
//         display: flex;
//         gap: 8px;
//         align-items: center;
//       }
//       .controls {
//         margin: 18px 0;
//       }
//       .table-wrap {
//         background: #fff;
//         border-radius: 10px;
//         padding: 18px;
//         box-shadow: 0 2px 10px rgba(0, 0, 0, 0.03);
//       }
//       .section-title {
//         margin: 0 0 10px 0;
//         font-weight: 600;
//         color: #111827;
//       }
//       .loading {
//         display: flex;
//         justify-content: center;
//         padding: 40px;
//       }
//     `,
//   ],
// })
// export class PayrollRootComponent implements OnInit {
//   periods: PayrollPeriod[] = [
//     { label: 'December 2024', value: 'dec-2024' },
//     { label: 'November 2024', value: 'nov-2024' },
//   ];
//   selected: PayrollPeriod = this.periods[0];
//   // selected: { label: string; value: string } | null = null;

//   summary$!: Observable<any>;
//   employees$!: Observable<any>;
//   loading$!: Observable<boolean>;

//   constructor(private facade: PayrollFacade) {}

//   ngOnInit() {
//     this.summary$ = this.facade.summary$;
//     this.employees$ = this.facade.employees$;
//     this.loading$ = this.facade.loading$;
//   }

//   onPeriodChange(val?: string) {
//     this.loadFor(val ?? this.selected.value);
//   }

//   loadFor(periodValue: string) {
//     // periodValue is e.g. 'dec-2024'; facade expects a string. adapt as needed
//     this.facade.load(periodValue);
//   }

//   onProcess(period?: string) {
//     const p = period ?? this.selected.value;
//     this.facade.process(p).subscribe((res) => {
//       // refresh after process
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
// }
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { PayrollFacade } from '../facade/payroll.facade';
import { PayrollSummaryComponent } from './payroll-summary.component';
import { PayrollFilterComponent } from './payroll-filter.component';
import { PayrollTableComponent } from './payroll-table.component';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { PayrollPeriod, EmployeePayroll } from '../models/payroll.model';
import { ButtonModule } from 'primeng/button';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

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
  ],
  template: `
    <div class="page">
      <header class="head">
        <div>
          <h1 style="color:#000">Payroll Management</h1>
          <p style="color : #374151">Process and manage employee payroll</p>
        </div>
        <div class="top-actions">
          <button
            style="color: #000;"
            pButton
            label="Calculate Payroll"
            icon="pi pi-calculator"
            class="p-button-text bg-white"
          ></button>
          <button
            style="background-color: #000; border-color: #000;"
            pButton
            label="Process Payroll"
            icon="pi pi-play"
            class="p-button-raised p-button-success"
            (click)="onProcess()"
          ></button>
        </div>
      </header>

      <app-payroll-summary [summary]="summary$ | async"></app-payroll-summary>

      <section class="controls">
        <app-payroll-filter
          [periods]="periods"
          [selected]="selected"
          (change)="onPeriodChange($event)"
          (process)="onProcess($event)"
          (export)="onExport($event)"
        ></app-payroll-filter>
      </section>

      <section class="table-wrap">
        <ng-container *ngIf="loading$ | async; else tableBlock">
          <div class="loading"><p-progressSpinner></p-progressSpinner></div>
        </ng-container>

        <ng-template #tableBlock>
          <h3 class="section-title">Payroll Details - {{ selected.label }}</h3>
          <app-payroll-table
            [employees]="(employees$ | async) ?? []"
          ></app-payroll-table>
        </ng-template>
      </section>
    </div>
  `,
  styles: [
    `
      .page {
        padding: 18px;
        max-width: 1100px;
        margin: 0 auto;
        background: #f9fafb;
      }
      .head {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 14px;
      }
      .muted {
        color: #6b7280;
        margin-top: 2px;
      }
      .top-actions {
        display: flex;
        gap: 8px;
        align-items: center;
      }
      .controls {
        margin: 18px 0;
      }
      .table-wrap {
        background: #fff;
        border-radius: 10px;
        padding: 18px;
        box-shadow: 0 2px 10px rgba(0, 0, 0, 0.03);
      }
      .section-title {
        margin: 0 0 10px 0;
        font-weight: 600;
        color: #111827;
      }
      .loading {
        display: flex;
        justify-content: center;
        padding: 40px;
      }
    `,
  ],
})
export class PayrollRootComponent implements OnInit {
  periods: PayrollPeriod[] = [
    { label: 'December 2024', value: 'dec-2024' },
    { label: 'November 2024', value: 'nov-2024' },
  ];
  selected: PayrollPeriod = this.periods[0];

  summary$!: Observable<any>;
  employees$!: Observable<EmployeePayroll[]>;
  loading$!: Observable<boolean>;

  constructor(private facade: PayrollFacade) {}

  ngOnInit() {
    this.summary$ = this.facade.summary$;
    this.employees$ = this.facade.employees$.pipe(
      map((e) => e ?? []) // ensure it's always an array
    );
    this.loading$ = this.facade.loading$;

    // Load data immediately for default period
    this.loadFor(this.selected.value);
  }

  onPeriodChange(val?: string) {
    this.selected = this.periods.find((p) => p.value === val) || this.selected;
    this.loadFor(this.selected.value);
  }

  loadFor(periodValue: string) {
    this.facade.load(periodValue);
  }

  onProcess(period?: string) {
    const p = period ?? this.selected.value;
    this.facade.process(p).subscribe(() => {
      this.facade.load(p); // reload after processing
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
    });
  }
}
