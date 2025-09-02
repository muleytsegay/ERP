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

// export interface EmployeePayroll {
//   id: number;             // Unique ID of the employee
//   name: string;           // Employee full name
//   position: string;       // Job title
//   salary: number;         // Monthly salary
//   status: 'Active' | 'Inactive'; // Employment status
// }

// export interface PayrollSummary {
//   totalEmployees: number; // Total employees in payroll
//   totalSalary: number;    // Total monthly payroll cost
// }
