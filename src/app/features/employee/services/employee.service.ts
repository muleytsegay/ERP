import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, of, throwError } from 'rxjs';
import { map, switchMap, catchError, tap } from 'rxjs/operators';
import { Employee, Department, Position, CreateEmployeeRequest } from '../models/employee.model';
import { SalaryStructure, CreateEmployeeWithSalaryRequest, CreateEmployeeResponse } from '../models/salary.model';
import { BankAccount, CreateBankAccountRequest } from '../models/bank-account.model';
import { PayrollService } from '../../payroll/services/payroll.service';
import { BankAccountService } from './bank-account.service';
import { AuthService } from '../../../core/services/auth.service';

@Injectable({
  providedIn: 'root'
})
export class EmployeeService {
  private apiUrl = 'https://gateway-microservice.onrender.com/hrms/api/v1';

  
  constructor(
    private http: HttpClient,
    private payrollService: PayrollService,
    private bankAccountService: BankAccountService,
    private authService: AuthService
  ) {}

  // Employee CRUD operations
  getEmployees(): Observable<Employee[]> {
    console.log('EmployeeService: Getting employees from:', `${this.apiUrl}/employees`);
    
    return this.http.get<any[]>(`${this.apiUrl}/employees`).pipe(
      map(employees => {
        console.log('EmployeeService: Raw employees from backend:', employees);
        
        return employees.map(emp => {
          // Map backend employee data to frontend Employee interface
          const mappedEmployee: Employee = {
            id: emp.id || emp.employeeId || '',
            employeeId: emp.employeeId || emp.id || '',
            firstName: emp.firstName || '',
            lastName: emp.lastName || '',
            email: emp.email || '',
            phone: emp.phone || '',
            address: emp.address || '',
            department: emp.department?.name || emp.departmentName || emp.department || '',
            position: emp.position?.title || emp.positionTitle || emp.position || '',
            hireDate: emp.hireDate ? new Date(emp.hireDate) : new Date(),
            salary: emp.salary || emp.baseSalary || 0,
            isActive: emp.isActive !== undefined ? emp.isActive : true,
            userId: emp.userId || emp.id || '',
            createdAt: emp.createdAt ? new Date(emp.createdAt) : new Date(),
            updatedAt: emp.updatedAt ? new Date(emp.updatedAt) : new Date()
          };
          
          console.log('EmployeeService: Mapped employee:', mappedEmployee);
          return mappedEmployee;
        });
      }),
      tap(mappedEmployees => {
        console.log('EmployeeService: Final mapped employees:', mappedEmployees);
      }),
      catchError((error: HttpErrorResponse) => {
        console.error('EmployeeService: Failed to get employees:', error);
        console.error('EmployeeService: Error status:', error.status);
        console.error('EmployeeService: Error details:', error.error);
        
        let errorMessage = 'Failed to load employees';
        
        if (error.status === 401) {
          errorMessage = 'Authentication failed. Please login again.';
        } else if (error.status === 403) {
          errorMessage = 'You do not have permission to view employees.';
        } else if (error.status === 500) {
          errorMessage = 'Server error occurred while loading employees.';
        }
        
        return throwError(() => ({ ...error, userMessage: errorMessage }));
      })
    );
  }

  getEmployee(id: string): Observable<Employee> {
    console.log('EmployeeService: Getting employee by id:', id);
    
    return this.http.get<any>(`${this.apiUrl}/employees/${id}`).pipe(
      map(emp => {
        console.log('EmployeeService: Raw employee from backend:', emp);
        
        // Map backend employee data to frontend Employee interface
        const mappedEmployee: Employee = {
          id: emp.id || emp.employeeId || '',
          employeeId: emp.employeeId || emp.id || '',
          firstName: emp.firstName || '',
          lastName: emp.lastName || '',
          email: emp.email || '',
          phone: emp.phone || '',
          address: emp.address || '',
          department: emp.department?.name || emp.departmentName || emp.department || '',
          position: emp.position?.title || emp.positionTitle || emp.position || '',
          hireDate: emp.hireDate ? new Date(emp.hireDate) : new Date(),
          salary: emp.salary || emp.baseSalary || 0,
          isActive: emp.isActive !== undefined ? emp.isActive : true,
          userId: emp.userId || emp.id || '',
          createdAt: emp.createdAt ? new Date(emp.createdAt) : new Date(),
          updatedAt: emp.updatedAt ? new Date(emp.updatedAt) : new Date()
        };
        
        console.log('EmployeeService: Mapped single employee:', mappedEmployee);
        return mappedEmployee;
      }),
      catchError((error: HttpErrorResponse) => {
        console.error('EmployeeService: Failed to get employee:', error);
        return throwError(() => error);
      })
    );
  }

  createEmployee(employee: CreateEmployeeRequest): Observable<Employee> {
    console.log('Simple createEmployee called with:', employee);
    
    // Validate required fields
    if (!employee.firstName || !employee.lastName || !employee.email) {
      return throwError(() => ({
        userMessage: 'Employee first name, last name, and email are required',
        error: 'Validation failed'
      }));
    }

    if (!employee.departmentId || !employee.positionId) {
      return throwError(() => ({
        userMessage: 'Department and position are required',
        error: 'Validation failed'
      }));
    }

    return this.http.post<Employee>(`${this.apiUrl}/employees`, employee).pipe(
      catchError((error) => {
        console.error('Simple createEmployee error:', error);
        console.error('Error status:', error.status);
        console.error('Error body:', error.error);
        
        let errorMessage = 'Failed to create employee';
        
        // Handle authentication errors
        if (error.status === 401) {
          errorMessage = 'Authentication failed. Please login again.';
        } else if (error.status === 403) {
          errorMessage = 'You do not have permission to create employees.';
        } else if (error.status === 500) {
          errorMessage = 'Server error occurred. Please check the data format and try again.';
          console.error('500 Error - Possible data format issue:', employee);
        } else if (error.error) {
          // Handle validation errors
          if (error.error.errors) {
            console.error('Validation errors:', error.error.errors);
            const validationErrors = Object.values(error.error.errors).flat();
            errorMessage = 'Validation error: ' + validationErrors.join(', ');
          } else if (error.error.message) {
            errorMessage = error.error.message;
          } else if (error.error.detail) {
            errorMessage = error.error.detail;
          }
        }
        
        console.error('Error details:', error.error);
        
        // Return error with enhanced message
        const enhancedError = {
          ...error,
          userMessage: errorMessage
        };
        
        return throwError(() => enhancedError);
      })
    );
  }

  // New method to create employee with salary structure in both microservices
  createEmployeeWithSalary(request: CreateEmployeeWithSalaryRequest): Observable<CreateEmployeeResponse> {
    // Log the request data for debugging
    console.log('Creating employee with complete data:', request);
    
    // Validate required employee fields
    if (!request.employee.firstName || !request.employee.lastName || !request.employee.email) {
      return throwError(() => ({
        userMessage: 'Employee first name, last name, and email are required',
        error: 'Validation failed'
      }));
    }

    if (!request.employee.departmentId || !request.employee.positionId) {
      return throwError(() => ({
        userMessage: 'Department and position are required',
        error: 'Validation failed'
      }));
    }

    // Prepare the employee data with password
    const employeeData = {
      ...request.employee,
      password: request.employee.password || 'DefaultPassword123!'
    };
    
    // First create the employee in HRMS
    return this.http.post<any>(`${this.apiUrl}/employees`, employeeData).pipe(
      switchMap((createdEmployee) => {
        console.log('Employee created successfully:', createdEmployee);
        
        // If employee creation successful, create salary structure in Payroll service
        const salaryStructure: SalaryStructure = {
          employeeId: createdEmployee.employeeId || createdEmployee.id,
          basicSalary: request.salaryStructure.basicSalary,
          housingAllowance: request.salaryStructure.housingAllowance,
          transportAllowance: request.salaryStructure.transportAllowance,
          otherAllowance: request.salaryStructure.otherAllowance
        };

        console.log('Creating salary structure:', salaryStructure);

        return this.payrollService.createSalaryStructure(salaryStructure).pipe(
          switchMap((createdSalaryStructure) => {
            console.log('Salary structure created successfully:', createdSalaryStructure);
            
            // If bank account information is provided, create it
            if (request.bankAccount?.accountNumber) {
              const bankAccountData = {
                dto: {
                  employeeId: createdEmployee.employeeId || createdEmployee.id,
                  bankName: request.bankAccount.bankName || '',
                  accountHolderName: `${request.employee.firstName} ${request.employee.lastName}`,
                  accountNumber: request.bankAccount.accountNumber,
                  branch: request.bankAccount.branch || '',
                  swiftBic: request.bankAccount.swiftBic || '',
                  ifsc: request.bankAccount.ifsc || '',
                  isPrimary: true
                }
              };

              console.log('Creating bank account:', bankAccountData);

              return this.bankAccountService.createBankAccount(bankAccountData).pipe(
                map((createdBankAccount) => ({
                  employee: createdEmployee,
                  salaryStructure: createdSalaryStructure,
                  bankAccount: createdBankAccount
                })),
                catchError((bankError) => {
                  console.error('Failed to create bank account:', bankError);
                  console.error('Bank account error status:', bankError.status);
                  console.error('Bank account error details:', bankError.error);
                  
                  // Log the data that failed
                  console.error('Bank account data that failed:', bankAccountData);
                  
                  // Return partial success - employee and salary created
                  return of({
                    employee: createdEmployee,
                    salaryStructure: createdSalaryStructure,
                    bankAccount: undefined
                  });
                })
              );
            } else {
              // No bank account to create
              return of({
                employee: createdEmployee,
                salaryStructure: createdSalaryStructure
              });
            }
          }),
          catchError((salaryError) => {
            console.error('Failed to create salary structure:', salaryError);
            console.error('Salary error status:', salaryError.status);
            console.error('Salary error details:', salaryError.error);
            
            // Log the data that failed
            console.error('Salary structure data that failed:', salaryStructure);
            
            // Return partial success - only employee created
            return of({
              employee: createdEmployee,
              salaryStructure: undefined
            });
          })
        );
      }),
      catchError((employeeError) => {
        console.error('Failed to create employee:', employeeError);
        console.error('Employee creation error status:', employeeError.status);
        console.error('Employee creation error body:', employeeError.error);
        
        let errorMessage = 'Failed to create employee';
        
        // Handle authentication errors
        if (employeeError.status === 401) {
          errorMessage = 'Authentication failed. Please login again.';
        } else if (employeeError.status === 403) {
          errorMessage = 'You do not have permission to create employees.';
        } else if (employeeError.status === 500) {
          errorMessage = 'Server error occurred. Please check the employee data format and try again.';
          console.error('500 Error - Employee data being sent:', employeeData);
        } else if (employeeError.error) {
          // Handle validation errors
          if (employeeError.error.errors) {
            console.error('Validation errors:', employeeError.error.errors);
            const validationErrors = Object.values(employeeError.error.errors).flat();
            errorMessage = 'Validation error: ' + validationErrors.join(', ');
          } else if (employeeError.error.message) {
            errorMessage = employeeError.error.message;
          } else if (employeeError.error.detail) {
            errorMessage = employeeError.error.detail;
          }
        }
        
        // Return error with enhanced message
        const enhancedError = {
          ...employeeError,
          userMessage: errorMessage
        };
        
        return throwError(() => enhancedError);
      })
    );
  }

  // Complete employee creation with salary structure and bank account
  createEmployeeComplete(
    employeeData: any,
    salaryData: any,
    bankData: any
  ): Observable<{ employee: any; salaryStructure?: SalaryStructure; bankAccount?: BankAccount }> {
    // Create the request matching backend expectations (only fields API expects)
    const employeeRequest: CreateEmployeeRequest = {
      firstName: employeeData.firstName,
      lastName: employeeData.lastName,
      email: employeeData.email,
      password: employeeData.password,
      role: employeeData.role || 'EMPLOYEE', // Default role if not provided
      departmentId: employeeData.departmentId,
      positionId: employeeData.positionId
    };

    console.log('Sending employee data to backend:', employeeRequest);

    // Debug: Check authentication status
    const token = this.authService.getToken();
    const isAuthenticated = this.authService.isAuthenticated();
    const currentUser = this.authService.getCurrentUserValue();
    
    console.log('Authentication Debug:');
    console.log('- Token exists:', !!token);
    console.log('- Is authenticated:', isAuthenticated);
    console.log('- Current user:', currentUser);
    console.log('- Token (first 50 chars):', token?.substring(0, 50) + '...');

    return this.http.post<any>(`${this.apiUrl}/employees`, employeeRequest).pipe(
      switchMap((createdEmployee) => {
        console.log('Employee created successfully:', createdEmployee);
        
        // If employee creation successful, create salary structure in Payroll service
        const salaryStructure: SalaryStructure = {
          employeeId: createdEmployee.employeeId || createdEmployee.id,
          basicSalary: salaryData.basicSalary,
          housingAllowance: salaryData.housingAllowance,
          transportAllowance: salaryData.transportAllowance,
          otherAllowance: salaryData.otherAllowance
        };

        return this.payrollService.createSalaryStructure(salaryStructure).pipe(
          switchMap((createdSalaryStructure) => {
            console.log('Salary structure created:', createdSalaryStructure);
            
            if (bankData) {
              const bankRequest: CreateBankAccountRequest = {
                dto: {
                  employeeId: createdEmployee.employeeId || createdEmployee.id,
                  bankName: bankData.bankName,
                  accountHolderName: bankData.accountHolderName,
                  accountNumber: bankData.accountNumber,
                  branch: bankData.branch,
                  swiftBic: bankData.swiftBic || '',
                  ifsc: bankData.ifsc || '',
                  isPrimary: bankData.isPrimary || true
                }
              };

              return this.bankAccountService.createBankAccount(bankRequest).pipe(
                map((bankAccount) => ({
                  employee: createdEmployee,
                  salaryStructure: createdSalaryStructure,
                  bankAccount: bankAccount
                })),
                catchError((bankError) => {
                  console.error('Failed to create bank account:', bankError);
                  return of({
                    employee: createdEmployee,
                    salaryStructure: createdSalaryStructure,
                    bankAccount: undefined
                  });
                })
              );
            } else {
              return of({
                employee: createdEmployee,
                salaryStructure: createdSalaryStructure,
                bankAccount: undefined
              });
            }
          }),
          catchError((salaryError) => {
            console.error('Failed to create salary structure:', salaryError);
            return of({
              employee: createdEmployee,
              salaryStructure: undefined,
              bankAccount: undefined
            });
          })
        );
      }),
      catchError((employeeError) => {
        console.error('Failed to create employee:', employeeError);
        return throwError(() => employeeError);
      })
    );
  }

  updateEmployee(id: string, employee: Partial<Employee>): Observable<Employee> {
    return this.http.put<Employee>(`${this.apiUrl}/employees/${id}`, employee);
  }

  deleteEmployee(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/employees/${id}`);
  }

  // Department operations
  getDepartments(): Observable<Department[]> {
    return this.http.get<Department[]>(`${this.apiUrl}/departments`);
  }

  getDepartment(id: string): Observable<Department> {
    return this.http.get<Department>(`${this.apiUrl}/departments/${id}`);
  }

  createDepartment(department: Omit<Department, 'id' | 'createdAt' | 'updatedAt'>): Observable<Department> {
    return this.http.post<Department>(`${this.apiUrl}/departments`, department);
  }

  updateDepartment(id: string, department: Partial<Department>): Observable<Department> {
    return this.http.put<Department>(`${this.apiUrl}/departments/${id}`, department);
  }

  // Position operations
  getPositions(): Observable<Position[]> {
    return this.http.get<Position[]>(`${this.apiUrl}/positions`);
  }

  getPositionsByDepartment(departmentId: string): Observable<Position[]> {
    return this.http.get<Position[]>(`${this.apiUrl}/positions/department/${departmentId}`);
  }

  createPosition(position: Omit<Position, 'id'>): Observable<Position> {
    return this.http.post<Position>(`${this.apiUrl}/positions`, position);
  }

  updatePosition(id: string, position: Partial<Position>): Observable<Position> {
    return this.http.put<Position>(`${this.apiUrl}/positions/${id}`, position);
  }

  // Search and filter operations
  searchEmployees(query: string): Observable<Employee[]> {
    return this.http.get<Employee[]>(`${this.apiUrl}/employees/search?q=${query}`);
  }

  getEmployeesByDepartment(departmentId: string): Observable<Employee[]> {
    console.log('EmployeeService: Getting employees by department:', departmentId);
    
    return this.http.get<any[]>(`${this.apiUrl}/employees/department/${departmentId}`).pipe(
      map(employees => {
        console.log('EmployeeService: Raw employees by department from backend:', employees);
        
        return employees.map(emp => {
          // Map backend employee data to frontend Employee interface
          const mappedEmployee: Employee = {
            id: emp.id || emp.employeeId || '',
            employeeId: emp.employeeId || emp.id || '',
            firstName: emp.firstName || '',
            lastName: emp.lastName || '',
            email: emp.email || '',
            phone: emp.phone || '',
            address: emp.address || '',
            department: emp.department?.name || emp.departmentName || emp.department || '',
            position: emp.position?.title || emp.positionTitle || emp.position || '',
            hireDate: emp.hireDate ? new Date(emp.hireDate) : new Date(),
            salary: emp.salary || emp.baseSalary || 0,
            isActive: emp.isActive !== undefined ? emp.isActive : true,
            userId: emp.userId || emp.id || '',
            createdAt: emp.createdAt ? new Date(emp.createdAt) : new Date(),
            updatedAt: emp.updatedAt ? new Date(emp.updatedAt) : new Date()
          };
          
          return mappedEmployee;
        });
      }),
      catchError((error: HttpErrorResponse) => {
        console.error('EmployeeService: Failed to get employees by department:', error);
        return throwError(() => error);
      })
    );
  }
}
