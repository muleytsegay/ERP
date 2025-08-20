import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup } from '@angular/forms';
import { FormsModule } from '@angular/forms';
import { PayrollService } from '../../services/payroll.service';
import { EmployeeService } from '../../../employee/services/employee.service';
import { Employee } from '../../../employee/models/employee.model';
import { Payslip } from '../../models/payroll.model';

@Component({
  selector: 'app-payslip',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule],
  templateUrl: './payslip.component.html',
  styleUrls: ['./payslip.component.css']
})
export class PayslipComponent implements OnInit {
  employees: Employee[] = [];
  payslips: Payslip[] = [];
  filteredPayslips: Payslip[] = [];
  selectedPayslip: Payslip | null = null;
  
  filterForm: FormGroup;
  loading = false;
  error = '';
  success = '';

  constructor(
    private payrollService: PayrollService,
    private employeeService: EmployeeService,
    private formBuilder: FormBuilder
  ) {
    this.filterForm = this.formBuilder.group({
      employeeId: [''],
      startDate: [''],
      endDate: ['']
    });
  }

  ngOnInit(): void {
    this.loadEmployees();
    this.loadPayslips();
  }

  loadEmployees(): void {
    this.employeeService.getEmployees().subscribe({
      next: (employees) => {
        this.employees = employees.filter(emp => emp.isActive);
      },
      error: (error) => {
        this.error = 'Failed to load employees';
      }
    });
  }

  loadPayslips(): void {
    this.loading = true;
    // Note: This would typically load all payslips or payslips for current user
    // For demo purposes, we'll load a subset
    this.payrollService.getPayrolls().subscribe({
      next: (payrolls) => {
        // Convert payrolls to payslips (simplified for demo)
        this.payslips = payrolls.map(payroll => ({
          id: payroll.id,
          payrollId: payroll.id,
          employee: this.getEmployeeById(payroll.employeeId),
          payPeriod: this.formatPayPeriod(payroll.payPeriodStart, payroll.payPeriodEnd),
          basicSalary: payroll.basicSalary,
          allowances: payroll.allowances,
          deductions: payroll.deductions,
          grossSalary: payroll.grossSalary,
          taxAmount: payroll.taxAmount,
          netSalary: payroll.netSalary,
          generatedAt: new Date()
        }));
        this.filteredPayslips = [...this.payslips];
        this.loading = false;
      },
      error: (error) => {
        this.error = 'Failed to load payslips';
        this.loading = false;
      }
    });
  }

  getEmployeeById(employeeId: string): Employee {
    return this.employees.find(emp => emp.id === employeeId) || {} as Employee;
  }

  formatPayPeriod(start: Date, end: Date): string {
    const startDate = new Date(start);
    const endDate = new Date(end);
    return `${startDate.toLocaleDateString()} - ${endDate.toLocaleDateString()}`;
  }

  applyFilters(): void {
    const filters = this.filterForm.value;
    
    this.filteredPayslips = this.payslips.filter(payslip => {
      const employeeMatch = !filters.employeeId || payslip.employee?.id === filters.employeeId;
      
      let dateMatch = true;
      if (filters.startDate || filters.endDate) {
        const payslipDate = new Date(payslip.generatedAt);
        
        if (filters.startDate) {
          dateMatch = dateMatch && payslipDate >= new Date(filters.startDate);
        }
        
        if (filters.endDate) {
          dateMatch = dateMatch && payslipDate <= new Date(filters.endDate);
        }
      }
      
      return employeeMatch && dateMatch;
    });
  }

  viewPayslip(payslip: Payslip): void {
    this.selectedPayslip = payslip;
  }

  closePayslipView(): void {
    this.selectedPayslip = null;
  }

  downloadPayslip(payslip: Payslip): void {
    this.loading = true;
    this.payrollService.downloadPayslip(payslip.id).subscribe({
      next: (blob) => {
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `payslip-${payslip.employee?.employeeId || 'unknown'}-${payslip.payPeriod.replace(/[\/\s-]/g, '_')}.pdf`;
        link.click();
        window.URL.revokeObjectURL(url);
        this.loading = false;
        this.success = 'Payslip downloaded successfully!';
      },
      error: (error) => {
        this.loading = false;
        this.error = 'Failed to download payslip';
      }
    });
  }

  printPayslip(): void {
    if (this.selectedPayslip) {
      window.print();
    }
  }

  clearMessages(): void {
    this.error = '';
    this.success = '';
  }

  formatCurrency(amount: number): string {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  }

  formatDate(date: Date): string {
    return new Date(date).toLocaleDateString();
  }

  getEmployeeName(employee: Employee): string {
    return employee ? `${employee.firstName} ${employee.lastName}` : 'Unknown';
  }

  resetFilters(): void {
    this.filterForm.reset();
    this.filteredPayslips = [...this.payslips];
  }

  getTotalDeductions(payslip: Payslip): number {
    const deductionsTotal = payslip.deductions?.reduce((sum, d) => sum + d.amount, 0) || 0;
    return payslip.taxAmount + deductionsTotal;
  }

  getTotalAllowances(payslip: Payslip): number {
    return payslip.allowances?.reduce((sum, a) => sum + a.amount, 0) || 0;
  }
}
