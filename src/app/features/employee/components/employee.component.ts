import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Employee } from '../models/employee.model';
import { EmployeeService } from '../services/employee.service';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { InputTextModule } from 'primeng/inputtext';
import { ToastModule } from 'primeng/toast';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { CardModule } from 'primeng/card';
import { TooltipModule } from 'primeng/tooltip';
import { MessageModule } from 'primeng/message';
import { MessageService, ConfirmationService } from 'primeng/api';

@Component({
  selector: 'app-employee',
  templateUrl: './employee.component.html',
  styleUrls: ['./employee.component.css'],
  standalone: true,
  imports: [
    CommonModule, 
    ReactiveFormsModule, 
    TableModule,
    ButtonModule,
    DialogModule,
    InputTextModule,
    ToastModule,
    ConfirmDialogModule,
    CardModule,
    TooltipModule,
    MessageModule
  ],
  providers: [MessageService, ConfirmationService]
})
export class EmployeeComponent implements OnInit {
  employeeForm: FormGroup;
  isEditMode = false;
  
  departmentOptions: { label: string; value: string }[] = [];
  positionOptions: { label: string; value: string }[] = [];

  showAddModal = false;
  employees: Employee[] = [];
  loading = false;
  error = '';

  constructor(
    private employeeService: EmployeeService,
    private messageService: MessageService,
    private confirmationService: ConfirmationService,
    private fb: FormBuilder
  ) {
    this.employeeForm = this.fb.group({
      id: [''],
      firstName: ['', Validators.required],
      lastName: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      phone: ['', Validators.required],
      address: [''],
      departmentId: ['', Validators.required],
      positionId: ['', Validators.required],
      hireDate: ['', Validators.required],
      salary: [0, [Validators.required, Validators.min(0)]]
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
  }

  closeAddModal() {
    this.showAddModal = false;
    this.resetForm();
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
        this.employeeService.createEmployee(employeeData).subscribe({
          next: () => {
            this.messageService.add({
              severity: 'success',
              summary: 'Success',
              detail: 'Employee created successfully'
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
              detail: 'Failed to create employee'
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
  }
}
