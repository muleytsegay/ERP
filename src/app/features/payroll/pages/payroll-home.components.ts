import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { EmployeeService } from '../../employee/services/employee.service';

@Component({
  selector: 'app-payroll-home',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './payroll-home.components.html',
})
export class PayrollHomeComponent implements OnInit {
  summary = {
    // totalEmployees: 3,
    totalEmployees: 0,
    grossPayroll: 22600,
    netPayroll: 20600,
    totalDeductions: 20000000,
    // grossPayroll: 0,
    // netPayroll: 0,
    // totalDeductions: 0,
  };

  periods = [
    'January 2024',
    'February 2024',
    'March 2024',
    'April 2024',
    'May 2024',
    'June 2024',
    'July 2024',
    'August 2024',
    'September 2024',
    'October 2024',
    'November 2024',
    'December 2024',
  ];
  selectedPeriod = 'December 2024';

  employees: any[] = [];
  loading = false;

  constructor(private employeeService: EmployeeService) {}

  ngOnInit(): void {
    this.loadEmployeeStats();
  }

  onExportPayroll(): void {
    alert(`Exporting payroll for ${this.selectedPeriod}`);
  }

  onGenerateReports(): void {
    alert(`Generating reports for ${this.selectedPeriod}`);
  }

  loadEmployeeStats(): void {
    this.loading = true;
    this.employeeService.getEmployees().subscribe({
      next: (response) => {
        this.employees = (response as any)?.data || response;

        if (!Array.isArray(this.employees)) {
          console.error('Employees data is not an array:', this.employees);
          this.loading = false;
          return;
        }

        // Total employees
        this.summary.totalEmployees = this.employees.length;

        // Calculate Gross Payroll (Base Salary + Allowances)
        // this.summary.grossPayroll = this.employees.reduce(
        //   (sum, emp) => sum + (emp.salary || 0) + (emp.allowances || 0),
        //   0
        // );

        // Total deductions (assuming deduction field exists, otherwise defaults to 0)
        // this.summary.totalDeductions = this.employees.reduce(
        //   (sum, emp) => sum + (emp.deductions || 0),
        //   0
        // );

        // Net Payroll = Gross Payroll - Total Deductions
        // this.summary.netPayroll =
        //   this.summary.grossPayroll - this.summary.totalDeductions;

        // this.loading = false;
        // },
        // error: (err) => {
        //   console.error('Error fetching employees:', err);
        //   this.loading = false;
      },
    });
  }

  formatCurrency(value: number): string {
    if (value >= 1_000_000) return `$${(value / 1_000_000).toFixed(1)}M`;
    return `$${value.toLocaleString()}`;
  }
}
