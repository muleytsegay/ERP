// import { Component, Input } from '@angular/core';
// import { CommonModule } from '@angular/common';
// import { TableModule } from 'primeng/table';
// import { ButtonModule } from 'primeng/button';
// import { EmployeePayroll } from '../models/payroll.model';

// @Component({
//   selector: 'app-payroll-table',
//   standalone: true,
//   imports: [CommonModule, TableModule, ButtonModule],
//   template: `
//     <p-table
//       [value]="employees"
//       [responsiveLayout]="'scroll'"
//       class="payroll-table"
//       *ngIf="employees?.length; else empty"
//     >
//       <ng-template pTemplate="header">
//         <tr>
//           <th>Employee</th>
//           <th>Department</th>
//           <th>Base Salary</th>
//           <th>Allowances</th>
//           <th>Deductions</th>
//           <th>Gross Salary</th>
//           <th>Net Salary</th>
//           <th>Status</th>
//           <th>Actions</th>
//         </tr>
//       </ng-template>
//       <ng-template pTemplate="body" let-e>
//         <tr>
//           <td>
//             <div class="employee-name">{{ e.name }}</div>
//             <div class="employee-id">{{ e.employeeId }}</div>
//           </td>
//           <td>{{ e.department }}</td>
//           <td>{{ e.baseSalary | currency }}</td>
//           <td>{{ e.allowances | currency }}</td>
//           <td>{{ e.deductions | currency }}</td>
//           <td>{{ e.grossSalary | currency }}</td>
//           <td class="net">{{ e.netSalary | currency }}</td>
//           <td>
//             <span
//               class="status"
//               [ngClass]="e.status === 'Processed' ? 'processed' : 'pending'"
//               >{{ e.status }}</span
//             >
//           </td>
//           <td>
//             <button pButton icon="pi pi-file" class="p-button-text"></button>
//           </td>
//         </tr>
//       </ng-template>
//     </p-table>

//     <ng-template #empty>
//       <div class="empty">No data for this period.</div>
//     </ng-template>
//   `,
//   styles: [
//     `
//       .employee-name {
//         font-weight: 600;
//       }
//       .employee-id {
//         font-size: 12px;
//         color: #6b7280;
//       }
//       .net {
//         color: #16a34a;
//         font-weight: 700;
//       }
//       .status.processed {
//         background: #0b1220;
//         color: #fff;
//         padding: 4px 8px;
//         border-radius: 12px;
//         font-size: 12px;
//       }
//       .status.pending {
//         background: #eef2f7;
//         color: #111827;
//         padding: 4px 8px;
//         border-radius: 12px;
//         font-size: 12px;
//       }
//       .payroll-table ::ng-deep .p-datatable-thead > tr > th {
//         border-bottom: 1px solid #e6e6e6;
//       }
//       .empty {
//         padding: 20px;
//         color: #6b7280;
//       }
//     `,
//   ],
// })
// export class PayrollTableComponent {
//   @Input() employees: EmployeePayroll[] = [];
// }
import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { EmployeePayroll } from '../models/payroll.model';

@Component({
  selector: 'app-payroll-table',
  standalone: true,
  imports: [CommonModule, TableModule, ButtonModule],
  template: `
    <p-table
      [value]="employees"
      [responsiveLayout]="'scroll'"
      class="payroll-table"
      [autoLayout]="true"
    >
      <ng-template pTemplate="header">
        <tr>
          <th>Employee</th>
          <th>Department</th>
          <th>Base Salary</th>
          <th>Allowances</th>
          <th>Deductions</th>
          <th>Gross Salary</th>
          <th>Net Salary</th>
          <th>Status</th>
          <th>Actions</th>
        </tr>
      </ng-template>

      <ng-template pTemplate="body" let-e>
        <tr>
          <td>
            <div class="employee-name">{{ e.name }}</div>
            <div class="employee-id">{{ e.employeeId }}</div>
          </td>
          <td>{{ e.department }}</td>
          <td>{{ e.baseSalary | currency }}</td>
          <td>{{ e.allowances | currency }}</td>
          <td>{{ e.deductions | currency }}</td>
          <td>{{ e.grossSalary | currency }}</td>
          <td class="net">{{ e.netSalary | currency }}</td>
          <td>
            <span
              class="status"
              [ngClass]="e.status === 'Processed' ? 'processed' : 'pending'"
            >
              {{ e.status }}
            </span>
          </td>
          <td>
            <button pButton icon="pi pi-file" class="p-button-text"></button>
          </td>
        </tr>
      </ng-template>

      <ng-template pTemplate="emptymessage">
        <tr>
          <td colspan="9" class="empty">No data for this period.</td>
        </tr>
      </ng-template>
    </p-table>
  `,
  styles: [
    `
      .employee-name {
        font-weight: 600;
      }
      .employee-id {
        font-size: 12px;
        color: #6b7280;
      }
      .net {
        color: #16a34a;
        font-weight: 700;
      }
      .status.processed {
        background: #0b1220;
        color: #fff;
        padding: 4px 8px;
        border-radius: 12px;
        font-size: 12px;
      }
      .status.pending {
        background: #eef2f7;
        color: #111827;
        padding: 4px 8px;
        border-radius: 12px;
        font-size: 12px;
      }
      .payroll-table ::ng-deep .p-datatable-thead > tr > th {
        border-bottom: 1px solid #e6e6e6;
      }
      .empty {
        padding: 20px;
        color: #6b7280;
        text-align: center;
      }
    `,
  ],
})
export class PayrollTableComponent {
  @Input() employees: EmployeePayroll[] = [];
}
