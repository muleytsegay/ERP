export interface Payroll {
  id: string;
  employeeId: string;
  payPeriodStart: Date;
  payPeriodEnd: Date;
  basicSalary: number;
  allowances: Allowance[];
  deductions: Deduction[];
  grossSalary: number;
  taxAmount: number;
  netSalary: number;
  overtimeHours: number;
  overtimeRate: number;
  overtimePay: number;
  status: PayrollStatus;
  processedAt: Date;
  processedBy: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Allowance {
  id: string;
  type: AllowanceType;
  description: string;
  amount: number;
  isPercentage: boolean;
}

export interface Deduction {
  id: string;
  type: DeductionType;
  description: string;
  amount: number;
  isPercentage: boolean;
}

export interface Payslip {
  id: string;
  payrollId: string;
  employee: Employee;
  payPeriod: string;
  basicSalary: number;
  allowances: Allowance[];
  deductions: Deduction[];
  grossSalary: number;
  taxAmount: number;
  netSalary: number;
  generatedAt: Date;
}

export enum PayrollStatus {
  DRAFT = 'draft',
  PROCESSED = 'processed',
  APPROVED = 'approved',
  PAID = 'paid',
  CANCELLED = 'cancelled'
}

export enum AllowanceType {
  HOUSE_ALLOWANCE = 'house_allowance',
  TRANSPORT_ALLOWANCE = 'transport_allowance',
  MEDICAL_ALLOWANCE = 'medical_allowance',
  BONUS = 'bonus',
  OVERTIME = 'overtime',
  OTHER = 'other'
}

export enum DeductionType {
  TAX = 'tax',
  INSURANCE = 'insurance',
  PENSION = 'pension',
  LOAN = 'loan',
  ADVANCE = 'advance',
  OTHER = 'other'
}

export interface SalaryCalculationRequest {
  employeeId: string;
  payPeriodStart: Date;
  payPeriodEnd: Date;
  overtimeHours?: number;
  additionalAllowances?: Allowance[];
  additionalDeductions?: Deduction[];
}

import { Employee } from '../../employee/models/employee.model';
