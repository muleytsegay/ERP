import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PayrollSummary } from '../models/payroll.model';
import { CardModule } from 'primeng/card';

@Component({
  selector: 'app-payroll-summary',
  standalone: true,
  imports: [CommonModule, CardModule],
  template: ` <div class="summary-grid">
    <p-card class="card" *ngFor="let c of cards">
      <div class="card-top">
        <div class="title">{{ c.title }}</div>
        <div class="icon">$</div>
      </div>
      <div class="amount">{{ c.amount | number }}</div>
      <div class="subtitle">{{ c.subtitle }}</div>
    </p-card>
  </div>`,
  styles: [
    `
      .summary-grid {
        display: flex;
        gap: 16px;
        margin-bottom: 18px;
        flex-wrap: wrap;
      }
      .card {
        flex: 1 1 220px;
        border-radius: 10px;
        box-shadow: 0 1px 6px rgba(0, 0, 0, 0.06);
      }
      .card-top {
        display: flex;
        justify-content: space-between;
        align-items: center;
        color: #374151;
        font-size: 14px;
      }
      .amount {
        font-weight: 700;
        font-size: 20px;
        margin-top: 8px;
        color: #000;
      }
      .subtitle {
        color: #374151;
        font-size: 12px;
        margin-top: 6px;
      }
    `,
  ],
})
export class PayrollSummaryComponent {
  @Input() summary: PayrollSummary | null = null;

  get cards() {
    const s = this.summary ?? {
      totalEmployees: 0,
      grossPayroll: 0,
      netPayroll: 0,
      totalDeductions: 0,
    };
    return [
      {
        title: 'Total Employees',
        amount: s.totalEmployees,
        subtitle: 'Active employees',
      },
      {
        title: 'Gross Payroll',
        amount: s.grossPayroll,
        subtitle: 'Before deductions',
      },
      {
        title: 'Net Payroll',
        amount: s.netPayroll,
        subtitle: 'After deductions',
      },
      {
        title: 'Total Deductions',
        amount: s.totalDeductions,
        subtitle: 'Taxes & benefits',
      },
    ];
  }
}
