import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Employee, CreateEmployeeRequest, EmployeeFormData } from '../models/employee.model';
import { CreateEmployeeWithSalaryRequest } from '../models/salary.model';
import { EmployeeService } from '../services/employee.service';
import { PayrollService } from '../../payroll/services/payroll.service';
import { BankAccountService } from '../services/bank-account.service';
import { AuthService } from '../../../core/services/auth.service';
import { SalaryStructureComponent } from './salary-structure/salary-structure.component';
import { BankAccountComponent } from './bank-account/bank-account.component';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { InputTextModule } from 'primeng/inputtext';
import { TextareaModule } from 'primeng/textarea';
import { InputNumberModule } from 'primeng/inputnumber';
import { DropdownModule } from 'primeng/dropdown';
import { ToastModule } from 'primeng/toast';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { CardModule } from 'primeng/card';
import { TooltipModule } from 'primeng/tooltip';
import { MessageModule } from 'primeng/message';
import { DividerModule } from 'primeng/divider';
import { StepsModule } from 'primeng/steps';
import { MessageService, ConfirmationService, MenuItem } from 'primeng/api';

@Component({
  selector: 'app-employee',
  standalone: true,
  imports: [
    CommonModule, 
    ReactiveFormsModule, 
    TableModule, 
    ButtonModule, 
    DialogModule, 
    InputTextModule,
    TextareaModule,
    InputNumberModule,
    DropdownModule,
    ToastModule, 
    ConfirmDialogModule, 
    CardModule, 
    TooltipModule, 
    MessageModule,
    DividerModule,
    StepsModule,
    SalaryStructureComponent,
    BankAccountComponent
  ],
  templateUrl: './employee.component.html',
  styleUrls: ['./employee.component.css'],
  providers: [MessageService, ConfirmationService]
})
export class EmployeeComponent implements OnInit {
  employeeForm: FormGroup;
  isEditMode = false;
  
  departmentOptions: { label: string; value: string }[] = [];
  positionOptions: { label: string; value: string }[] = [];
  roleOptions: { label: string; value: string }[] = [
    { label: 'Employee', value: 'EMPLOYEE' },
    { label: 'Manager', value: 'MANAGER' },
    { label: 'Admin', value: 'ADMIN' },
    { label: 'HR', value: 'HR' }
  ];

  showAddModal = false;
  employees: Employee[] = [];
  loading = false;
  error = '';

  // Multi-step form properties
  activeStep = 0;
  steps: MenuItem[] = [
    { label: 'Employee Info' },
    { label: 'Salary Structure' },
    { label: 'Bank Account' }
  ];

  // Step form data
  employeeData: any = {};
  salaryData: any = {};
  bankData: any = {};

  // Step validation flags
  employeeStepValid = false;
  salaryStepValid = false;
  bankStepValid = false;

  constructor(
    private employeeService: EmployeeService,
    private payrollService: PayrollService,
    private bankAccountService: BankAccountService,
    private authService: AuthService,
    private messageService: MessageService,
    private confirmationService: ConfirmationService,
    private fb: FormBuilder
  ) {
    this.employeeForm = this.fb.group({
      id: [''],
      firstName: ['', Validators.required],
      lastName: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      role: ['', Validators.required],
      departmentId: ['', Validators.required],
      positionId: ['', Validators.required]
    });

    // Watch form changes for step validation
    this.employeeForm.valueChanges.subscribe(value => {
      this.employeeStepValid = this.employeeForm.valid;
      this.employeeData = value;
      console.log('Employee form data updated:', this.employeeData);
    });
  }

  ngOnInit(): void {
    this.getEmployees();
    this.getDepartments();
    this.getPositions();
  }

  getDepartments(): void {
    this.employeeService.getDepartments().subscribe({
      next: (data: any) => {
        const departments = Array.isArray(data) ? data : (Array.isArray((data as any).data) ? (data as any).data : []);
        this.departmentOptions = departments.map((dept: any) => ({
          label: dept.name,
          value: dept.id
        }));
      },
      error: (err: any) => {
        console.error('Failed to load departments:', err);
        // Fallback to empty array if API fails
        this.departmentOptions = [];
      }
    });
  }

  getPositions(): void {
    this.employeeService.getPositions().subscribe({
      next: (data: any) => {
        const positions = Array.isArray(data) ? data : (Array.isArray((data as any).data) ? (data as any).data : []);
        this.positionOptions = positions.map((pos: any) => ({
          label: pos.title,
          value: pos.id
        }));
      },
      error: (err: any) => {
        console.error('Failed to load positions:', err);
        // Fallback to empty array if API fails
        this.positionOptions = [];
      }
    });
  }

  openAddModal() {
    this.showAddModal = true;
    this.activeStep = 0;
  }

  closeAddModal() {
    this.showAddModal = false;
    this.resetForm();
  }

  nextStep() {
    if (this.activeStep < this.steps.length - 1) {
      this.activeStep++;
    }
  }

  previousStep() {
    if (this.activeStep > 0) {
      this.activeStep--;
    }
  }

  onSalaryDataChange(data: any) {
    this.salaryData = data;
  }

  onSalaryValidChange(valid: boolean) {
    this.salaryStepValid = valid;
  }

  onBankDataChange(data: any) {
    this.bankData = data;
  }

  onBankValidChange(valid: boolean) {
    this.bankStepValid = valid;
  }

  canProceedToNext(): boolean {
    switch (this.activeStep) {
      case 0: return this.employeeStepValid;
      case 1: return this.salaryStepValid;
      case 2: return this.bankStepValid;
      default: return false;
    }
  }

  canSubmit(): boolean {
    return this.employeeStepValid && this.salaryStepValid && this.bankStepValid;
  }

  getEmployees(): void {
    this.loading = true;
    this.employeeService.getEmployees().subscribe({
      next: (data: any) => {
        const employeesArr = Array.isArray(data) ? data : (Array.isArray((data as any).data) ? (data as any).data : []);
        this.employees = (employeesArr as any[]).map((emp: any) => ({
          ...emp,
          fullName: emp.firstName + ' ' + emp.lastName
        }));
        this.loading = false;
      },
      error: (err: any) => {
        this.error = 'Failed to load employees.';
        this.loading = false;
      }
    });
  }

  deleteEmployee(id: string): void {
    this.confirmationService.confirm({
      message: 'Are you sure you want to delete this employee?',
      header: 'Confirm Delete',
      icon: 'pi pi-exclamation-triangle',
      accept: () => {
        this.employeeService.deleteEmployee(id).subscribe({
          next: () => {
            this.messageService.add({
              severity: 'success',
              summary: 'Success',
              detail: 'Employee deleted successfully'
            });
            this.getEmployees();
          },
          error: () => {
            this.messageService.add({
              severity: 'error',
              summary: 'Error',
              detail: 'Failed to delete employee'
            });
          }
        });
      }
    });
  }

  editEmployee(employee: Employee): void {
    this.employeeForm.patchValue(employee);
    this.isEditMode = true;
    this.showAddModal = true;
  }

  onAddEmployeeSubmit(event?: Event) {
    if (event) {
      event.preventDefault();
    }
    
    // First check if user is authenticated
    if (!this.authService.isAuthenticated()) {
      console.log('User not authenticated, redirecting to login');
      this.messageService.add({
        severity: 'warn',
        summary: 'Session Expired',
        detail: 'Your session has expired. Please login again.'
      });
      this.authService.logoutLocal();
      return;
    }
    
    if (this.employeeForm.valid) {
      this.loading = true;
      const employeeData = this.employeeForm.value;
      
      if (this.isEditMode) {
        this.employeeService.updateEmployee(employeeData.id, employeeData).subscribe({
          next: () => {
            this.messageService.add({
              severity: 'success',
              summary: 'Success',
              detail: 'Employee updated successfully'
            });
            this.loading = false;
            this.closeAddModal();
            this.getEmployees();
            this.resetForm();
          },
          error: (error: any) => {
            this.messageService.add({
              severity: 'error',
              summary: 'Error',
              detail: 'Failed to update employee'
            });
            this.loading = false;
          }
        });
      } else {
        // Validate that we have all required data
        if (!this.employeeStepValid) {
          this.messageService.add({
            severity: 'warn',
            summary: 'Validation Error',
            detail: 'Please complete employee information'
          });
          this.loading = false;
          return;
        }
        
        if (!this.salaryStepValid) {
          this.messageService.add({
            severity: 'warn',
            summary: 'Validation Error', 
            detail: 'Please complete salary structure'
          });
          this.loading = false;
          return;
        }
        
        this.loading = true;
        
        console.log('Form raw data:', this.employeeData);
        
        // Validate required fields for employee creation
        if (!this.employeeData.firstName || !this.employeeData.lastName || !this.employeeData.email) {
          this.messageService.add({
            severity: 'error',
            summary: 'Validation Error',
            detail: 'Employee first name, last name, and email are required'
          });
          this.loading = false;
          return;
        }

        // Validate department and position
        if (!this.employeeData.departmentId) {
          this.messageService.add({
            severity: 'error',
            summary: 'Validation Error',
            detail: 'Please select a department'
          });
          this.loading = false;
          return;
        }

        if (!this.employeeData.positionId) {
          this.messageService.add({
            severity: 'error',
            summary: 'Validation Error',
            detail: 'Please select a position'
          });
          this.loading = false;
          return;
        }
        
        this.loading = true;
        
        // Step 1: Create the employee first and get the employeeId
        const employeeRequest: CreateEmployeeRequest = {
          firstName: this.employeeData.firstName,
          lastName: this.employeeData.lastName,
          email: this.employeeData.email,
          password: this.employeeData.password || 'DefaultPassword123!',
          role: this.employeeData.role || 'EMPLOYEE',
          departmentId: this.employeeData.departmentId,
          positionId: this.employeeData.positionId
        };
        
        console.log('Step 1: Creating employee:', employeeRequest);
        
        this.employeeService.createEmployee(employeeRequest).subscribe({
          next: (createdEmployee) => {
            console.log('Step 1 completed: Employee created successfully:', createdEmployee);
            
            const employeeId = createdEmployee.employeeId || createdEmployee.id;
            console.log('Got employeeId for next steps:', employeeId);
            
            if (!employeeId) {
              console.error('No employeeId received from employee creation');
              this.messageService.add({
                severity: 'error',
                summary: 'Error',
                detail: 'Employee created but no ID received. Cannot proceed with salary structure.'
              });
              this.loading = false;
              return;
            }
            
            // Step 2: Create salary structure using the employeeId
            if (this.salaryStepValid && this.salaryData) {
              const salaryStructure = {
                employeeId: employeeId,
                basicSalary: this.salaryData.basicSalary || 0,
                housingAllowance: this.salaryData.housingAllowance || 0,
                transportAllowance: this.salaryData.transportAllowance || 0,
                otherAllowance: this.salaryData.otherAllowance || 0
              };
              
              console.log('Step 2: Creating salary structure:', salaryStructure);
              
              this.payrollService.createSalaryStructure(salaryStructure).subscribe({
                next: (createdSalaryStructure) => {
                  console.log('Step 2 completed: Salary structure created successfully:', createdSalaryStructure);
                  
                  // Step 3: Create bank account if provided
                  if (this.bankStepValid && this.bankData && this.bankData.accountNumber) {
                    const bankAccountData = {
                      dto: {
                        employeeId: employeeId,
                        bankName: this.bankData.bankName || '',
                        accountHolderName: `${this.employeeData.firstName} ${this.employeeData.lastName}`,
                        accountNumber: this.bankData.accountNumber,
                        branch: this.bankData.branch || '',
                        swiftBic: this.bankData.swiftBic || '',
                        ifsc: this.bankData.ifsc || '',
                        isPrimary: true
                      }
                    };
                    
                    console.log('Step 3: Creating bank account:', bankAccountData);
                    
                    this.bankAccountService.createBankAccount(bankAccountData).subscribe({
                      next: (createdBankAccount) => {
                        console.log('Step 3 completed: Bank account created successfully:', createdBankAccount);
                        
                        this.messageService.add({
                          severity: 'success',
                          summary: 'Success',
                          detail: 'Employee, salary structure, and bank account created successfully'
                        });
                        this.loading = false;
                        this.closeAddModal();
                        this.getEmployees();
                        this.resetForm();
                      },
                      error: (bankError) => {
                        console.error('Step 3 failed: Bank account creation failed:', bankError);
                        
                        this.messageService.add({
                          severity: 'warn',
                          summary: 'Partial Success',
                          detail: 'Employee and salary created successfully, but bank account creation failed'
                        });
                        this.loading = false;
                        this.closeAddModal();
                        this.getEmployees();
                        this.resetForm();
                      }
                    });
                  } else {
                    // No bank account to create, finish with success
                    this.messageService.add({
                      severity: 'success',
                      summary: 'Success',
                      detail: 'Employee and salary structure created successfully'
                    });
                    this.loading = false;
                    this.closeAddModal();
                    this.getEmployees();
                    this.resetForm();
                  }
                },
                error: (salaryError) => {
                  console.error('Step 2 failed: Salary structure creation failed:', salaryError);
                  
                  this.messageService.add({
                    severity: 'warn',
                    summary: 'Partial Success',
                    detail: 'Employee created successfully, but salary structure creation failed'
                  });
                  this.loading = false;
                  this.closeAddModal();
                  this.getEmployees();
                  this.resetForm();
                }
              });
            } else {
              // No salary structure to create, finish with employee only
              this.messageService.add({
                severity: 'success',
                summary: 'Success',
                detail: 'Employee created successfully'
              });
              this.loading = false;
              this.closeAddModal();
              this.getEmployees();
              this.resetForm();
            }
          },
          error: (employeeError) => {
            console.error('Step 1 failed: Employee creation failed:', employeeError);
            
            let errorMessage = 'Failed to create employee';
            
            // Enhanced error handling
            if (employeeError.userMessage) {
              errorMessage = employeeError.userMessage;
            } else if (employeeError.error?.errors) {
              console.error('Validation errors:', employeeError.error.errors);
              const validationErrors = Object.values(employeeError.error.errors).flat();
              errorMessage = 'Validation error: ' + validationErrors.join(', ');
            } else if (employeeError.error?.message) {
              errorMessage = employeeError.error.message;
            } else if (employeeError.error?.detail) {
              errorMessage = employeeError.error.detail;
            } else if (employeeError.status === 401) {
              errorMessage = 'Authentication failed. Please login again.';
              this.authService.logoutLocal();
            } else if (employeeError.status === 403) {
              errorMessage = 'You do not have permission to create employees.';
            } else if (employeeError.status === 500) {
              errorMessage = 'Server error occurred. Please check the data and try again.';
            }
            
            this.messageService.add({
              severity: 'error',
              summary: 'Error',
              detail: errorMessage
            });
            this.loading = false;
          }
        });
      }
    } else {
      this.messageService.add({
        severity: 'warn',
        summary: 'Warning',
        detail: 'Please fill all required fields'
      });
    }
  }

  resetForm() {
    this.employeeForm.reset();
    this.isEditMode = false;
    this.activeStep = 0;
    this.employeeData = {};
    this.salaryData = {};
    this.bankData = {};
    this.employeeStepValid = false;
    this.salaryStepValid = false;
    this.bankStepValid = false;
  }
}
