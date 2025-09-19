// src/app/features/payroll/models/payroll.model.ts
export interface EmployeePayroll {
  id: string;
  employeeId?: string;
  name?: string;
  // department?: string;
  basicSalary?: number;
  totalAllowances?: number;
  totalDeductions?: number;
  deductions?: number;
  grossPay?: number;
  netPay?: number;
  netSalary?: number; // Added for dashboard
  payPeriodStart?: string; // Added for dashboard
  status?: 'Pending' | 'Processed' | 'Approved' | string;
  payDateUtc?: string;
}

export interface PayrollSummary {
  totalEmployees: number;
  grossPayroll: number;
  netPayroll: number;
  totalDeductions: number;
}

// PayrollPeriod for dropdown
export interface PayrollPeriod {
  label: string;
  value: string; // e.g., 'dec-2024'
}
