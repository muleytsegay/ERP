import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators, FormArray } from '@angular/forms';
import { PayrollService } from '../../services/payroll.service';
import { EmployeeService } from '../../../employee/services/employee.service';
import { Employee } from '../../../employee/models/employee.model';
import { Payroll, SalaryCalculationRequest, Allowance, Deduction, AllowanceType, DeductionType } from '../../models/payroll.model';

@Component({
  selector: 'app-salary-calculation',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './salary-calculation.component.html',
  styleUrls: ['./salary-calculation.component.css']
})
export class SalaryCalculationComponent implements OnInit {
  employees: Employee[] = [];
  calculationForm: FormGroup;
  calculatedPayroll: Payroll | null = null;
  
  loading = false;
  error = '';
  success = '';

  allowanceTypes = Object.values(AllowanceType);
  deductionTypes = Object.values(DeductionType);

  constructor(
    private payrollService: PayrollService,
    private employeeService: EmployeeService,
    private formBuilder: FormBuilder
  ) {
    this.calculationForm = this.formBuilder.group({
      employeeId: ['', [Validators.required]],
      payPeriodStart: ['', [Validators.required]],
      payPeriodEnd: ['', [Validators.required]],
      overtimeHours: [0, [Validators.min(0)]],
      allowances: this.formBuilder.array([]),
      deductions: this.formBuilder.array([])
    });
  }

  ngOnInit(): void {
    this.loadEmployees();
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

  get f() {
    return this.calculationForm.controls;
  }

  get allowances() {
    return this.calculationForm.get('allowances') as FormArray;
  }

  get deductions() {
    return this.calculationForm.get('deductions') as FormArray;
  }

  addAllowance(): void {
    const allowanceGroup = this.formBuilder.group({
      type: ['', [Validators.required]],
      description: ['', [Validators.required]],
      amount: [0, [Validators.required, Validators.min(0)]],
      isPercentage: [false]
    });
    
    this.allowances.push(allowanceGroup);
  }

  removeAllowance(index: number): void {
    this.allowances.removeAt(index);
  }

  addDeduction(): void {
    const deductionGroup = this.formBuilder.group({
      type: ['', [Validators.required]],
      description: ['', [Validators.required]],
      amount: [0, [Validators.required, Validators.min(0)]],
      isPercentage: [false]
    });
    
    this.deductions.push(deductionGroup);
  }

  removeDeduction(index: number): void {
    this.deductions.removeAt(index);
  }

  clearMessages(): void {
    this.error = '';
    this.success = '';
  }

  onCalculate(): void {
    if (this.calculationForm.invalid) {
      return;
    }

    this.loading = true;
    this.clearMessages();

    const formValue = this.calculationForm.value;
    const request: SalaryCalculationRequest = {
      employeeId: formValue.employeeId,
      payPeriodStart: new Date(formValue.payPeriodStart),
      payPeriodEnd: new Date(formValue.payPeriodEnd),
      overtimeHours: formValue.overtimeHours || 0,
      additionalAllowances: formValue.allowances || [],
      additionalDeductions: formValue.deductions || []
    };

    this.payrollService.calculateSalary(request).subscribe({
      next: (payroll) => {
        this.loading = false;
        this.calculatedPayroll = payroll;
        this.success = 'Salary calculated successfully!';
      },
      error: (error) => {
        this.loading = false;
        this.error = error.error?.message || 'Failed to calculate salary';
        this.calculatedPayroll = null;
      }
    });
  }

  onProcessPayroll(): void {
    if (!this.calculatedPayroll) {
      return;
    }

    this.loading = true;
    this.clearMessages();

    this.payrollService.processPayroll(this.calculatedPayroll.id).subscribe({
      next: (payroll) => {
        this.loading = false;
        this.calculatedPayroll = payroll;
        this.success = 'Payroll processed successfully!';
      },
      error: (error) => {
        this.loading = false;
        this.error = error.error?.message || 'Failed to process payroll';
      }
    });
  }

  reset(): void {
    this.calculationForm.reset();
    this.calculatedPayroll = null;
    this.clearMessages();
    
    // Clear form arrays
    while (this.allowances.length !== 0) {
      this.allowances.removeAt(0);
    }
    while (this.deductions.length !== 0) {
      this.deductions.removeAt(0);
    }
  }

  getEmployeeName(employeeId: string): string {
    const employee = this.employees.find(emp => emp.id === employeeId);
    return employee ? `${employee.firstName} ${employee.lastName}` : 'Unknown';
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

  getStatusBadgeClass(status: string): string {
    switch (status.toLowerCase()) {
      case 'draft':
        return 'bg-gray-100 text-gray-800';
      case 'processed':
        return 'bg-blue-100 text-blue-800';
      case 'approved':
        return 'bg-green-100 text-green-800';
      case 'paid':
        return 'bg-purple-100 text-purple-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  }
}
