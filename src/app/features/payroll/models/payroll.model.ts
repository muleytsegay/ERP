export interface EmployeePayroll {
  id: string;
  name: string;
  employeeId: string;
  department: string;
  baseSalary: number;
  allowances: number;
  deductions: number;
  grossSalary: number;
  netSalary: number;
  // payDate: string;
  status: 'Processed' | 'Pending';

  payPeriodStart?: string;
  payPeriodEnd?: string;
}

export interface PayrollSummary {
  totalEmployees: number;
  grossPayroll: number;
  netPayroll: number;
  totalDeductions: number;
}

export interface PayrollPeriod {
  label: string;
  value: string;
}
