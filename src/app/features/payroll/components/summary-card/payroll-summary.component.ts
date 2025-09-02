import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CardModule } from 'primeng/card';
import { PayrollSummary } from '../../models/payroll.model';

@Component({
  selector: 'app-payroll-summary',
  standalone: true,
  imports: [CommonModule, CardModule],
  templateUrl: './payroll-summary.component.html',
  styleUrls: ['./payroll-summary.component.css'],
})
export class PayrollSummaryComponent {
  @Input() summary: PayrollSummary | null = null;

  // function to format currency
  formatCurrency(value: number): string {
    if (value >= 1_000_000) return `$${(value / 1_000_000).toFixed(1)}M`;
    return `$${value.toLocaleString()}`;
  }

  // Format plain numbers with commas
  formatNumber(value: number): string {
    return value.toLocaleString();
  }

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
        amount: this.formatNumber(s.totalEmployees),
        subtitle: 'Active employees',
      },
      {
        title: 'Gross Payroll',
        amount: this.formatCurrency(s.grossPayroll),
        subtitle: 'Before deductions',
      },
      {
        title: 'Net Payroll',
        amount: this.formatCurrency(s.netPayroll),
        subtitle: 'After deductions',
      },
      {
        title: 'Total Deductions',
        amount: this.formatCurrency(s.totalDeductions),
        subtitle: 'Taxes & benefits',
      },
    ];
  }
}
