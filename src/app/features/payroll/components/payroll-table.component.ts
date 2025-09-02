import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { EmployeePayroll } from '../models/payroll.model';

@Component({
  selector: 'app-payroll-table',
  standalone: true,
  imports: [CommonModule, TableModule, ButtonModule],
  template: `
    <div class="table-wrap">
      <p-table
        [value]="employees"
        [paginator]="true"
        [rows]="10"
        [rowsPerPageOptions]="[5, 10, 20]"
        [responsiveLayout]="'stack'"
        [autoLayout]="true"
        [lazy]="true"
        (onLazyLoad)="loadPayroll($event)"
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
            <!-- Approval Workflow (Pending → Approve/Reject) -->
            <!-- <td>
            <ng-container *ngIf="e.status === 'Pending'; else processedBlock">
              <button
                pButton
                label="Approve"
                class="p-button-success"
                (click)="approve.emit(e.id)"
              ></button>
              <button
                pButton
                label="Reject"
                class="p-button-danger"
                (click)="reject.emit(e.id)"
              ></button>
            </ng-container>
            <ng-template #processedBlock>
              <span>Processed</span>
            </ng-template>
          </td> -->

            <!-- <td>
            <button pButton icon="pi pi-file" class="p-button-text"></button>
          </td> -->
            <!-- Payslip Download per Employee -->
            <td>
              <button
                pButton
                icon="pi pi-file"
                class="p-button-text"
                (click)="downloadPayslip(e.id)"
              ></button>
            </td>
          </tr>
        </ng-template>

        <ng-template pTemplate="emptymessage">
          <tr>
            <td colspan="9" class="empty">No data for this period.</td>
          </tr>
        </ng-template>
      </p-table>
    </div>
  `,
  styles: [
    `
      .table-wrap {
        width: 100%;
        overflow-x: auto; /* allows horizontal scroll on tiny screens */
      }

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

  @Output() payslip = new EventEmitter<string>();

  downloadPayslip(employeeId: string) {
    this.payslip.emit(employeeId);
  }

  @Output() approve = new EventEmitter<string>();
  @Output() reject = new EventEmitter<string>();

  @Output() lazyLoad = new EventEmitter<any>();
  // loadPayroll(event: any) {
  //   this.lazyLoad.emit(event);
  // }
  // payroll-table.component.ts
  loadPayroll(event: any) {
    // event.first = index of first row
    // event.rows = number of rows per page
    const page = event.first / event.rows; // convert first index to page number
    this.lazyLoad.emit({ page, size: event.rows });
  }
}
