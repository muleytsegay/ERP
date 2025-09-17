import { BankAccount } from './bank-account.model';

export interface SalaryStructure {
  employeeId: string;
  basicSalary: number;
  housingAllowance: number;
  transportAllowance: number;
  otherAllowance: number;
}

export interface CreateEmployeeWithSalaryRequest {
  employee: {
    firstName: string;
    lastName: string;
    email: string;
    password?: string;
    role: string;
    departmentId: string;
    positionId: string;
  };
  salaryStructure: {
    basicSalary: number;
    housingAllowance: number;
    transportAllowance: number;
    otherAllowance: number;
  };
  bankAccount?: {
    accountNumber: string;
    bankName: string;
    branch?: string;
    swiftBic?: string;
    ifsc?: string;
    accountType?: string;
  };
}

export interface CreateEmployeeResponse {
  employee: {
    id: string;
    employeeId: string;
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    address: string;
    department: string;
    position: string;
    hireDate: Date;
    isActive: boolean;
    userId: string;
    createdAt: Date;
    updatedAt: Date;
  };
  salaryStructure?: SalaryStructure;
  bankAccount?: BankAccount;
}
