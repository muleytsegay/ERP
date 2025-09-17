export interface Employee {
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
  salary: number;
  isActive: boolean;
  userId: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Department {
  id: string;
  name: string;
  description: string;
  managerId: string;
  isActive: boolean;
}

export interface Position {
  id: string;
  title: string;
  departmentId: string;
  baseSalary: number;
  description: string;
  isActive: boolean;
}

export interface CreateEmployeeRequest {
  id?: string;
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  role: string;
  departmentId: string;
  positionId: string;
}

// Extended interface for internal form data collection
export interface EmployeeFormData {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  address: string;
  departmentId: string;
  positionId: string;
  hireDate: Date;
  role: string;
}

// Extended interface for creating employee with salary breakdown
export interface CreateEmployeeWithSalaryBreakdown {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  address: string;
  departmentId: string;
  positionId: string;
  hireDate: Date;
  basicSalary: number;
  housingAllowance: number;
  transportAllowance: number;
  otherAllowance: number;
}
