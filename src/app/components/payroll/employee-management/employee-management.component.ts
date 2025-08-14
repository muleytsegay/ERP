import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { EmployeeService } from '../../../shared/services/employee.service';
import { Employee, Department, Position, CreateEmployeeRequest } from '../../../shared/models/employee.model';

@Component({
  selector: 'app-employee-management',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule, RouterModule],
  templateUrl: './employee-management.component.html',
  styleUrls: ['./employee-management.component.css']
})
export class EmployeeManagementComponent implements OnInit {
  employees: Employee[] = [];
  departments: Department[] = [];
  positions: Position[] = [];
  filteredEmployees: Employee[] = [];
  
  employeeForm: FormGroup;
  searchTerm = '';
  selectedDepartment = '';
  isModalOpen = false;
  isEditing = false;
  editingEmployeeId = '';
  
  loading = false;
  error = '';
  success = '';

  constructor(
    private employeeService: EmployeeService,
    private formBuilder: FormBuilder
  ) {
    this.employeeForm = this.formBuilder.group({
      firstName: ['', [Validators.required]],
      lastName: ['', [Validators.required]],
      email: ['', [Validators.required, Validators.email]],
      phone: ['', [Validators.required]],
      address: ['', [Validators.required]],
      departmentId: ['', [Validators.required]],
      positionId: ['', [Validators.required]],
      hireDate: ['', [Validators.required]],
      salary: ['', [Validators.required, Validators.min(0)]]
    });
  }

  ngOnInit(): void {
    this.loadEmployees();
    this.loadDepartments();
    this.loadPositions();
  }

  loadEmployees(): void {
    this.loading = true;
    this.employeeService.getEmployees().subscribe({
      next: (employees) => {
        this.employees = employees;
        this.filteredEmployees = employees;
        this.loading = false;
      },
      error: (error) => {
        this.error = 'Failed to load employees';
        this.loading = false;
      }
    });
  }

  loadDepartments(): void {
    this.employeeService.getDepartments().subscribe({
      next: (departments) => {
        this.departments = departments;
      },
      error: (error) => {
        console.error('Failed to load departments', error);
      }
    });
  }

  loadPositions(): void {
    this.employeeService.getPositions().subscribe({
      next: (positions) => {
        this.positions = positions;
      },
      error: (error) => {
        console.error('Failed to load positions', error);
      }
    });
  }

  get f() {
    return this.employeeForm.controls;
  }

  onDepartmentChange(): void {
    const departmentId = this.employeeForm.get('departmentId')?.value;
    if (departmentId) {
      this.employeeService.getPositionsByDepartment(departmentId).subscribe({
        next: (positions) => {
          this.positions = positions;
          this.employeeForm.patchValue({ positionId: '' });
        },
        error: (error) => {
          console.error('Failed to load positions for department', error);
        }
      });
    }
  }

  filterEmployees(): void {
    this.filteredEmployees = this.employees.filter(employee => {
      const matchesSearch = this.searchTerm === '' || 
        employee.firstName.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        employee.lastName.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        employee.email.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        employee.employeeId.toLowerCase().includes(this.searchTerm.toLowerCase());
      
      const matchesDepartment = this.selectedDepartment === '' || 
        employee.department === this.selectedDepartment;
      
      return matchesSearch && matchesDepartment;
    });
  }

  openAddModal(): void {
    this.isModalOpen = true;
    this.isEditing = false;
    this.employeeForm.reset();
    this.clearMessages();
  }

  openEditModal(employee: Employee): void {
    this.isModalOpen = true;
    this.isEditing = true;
    this.editingEmployeeId = employee.id;
    
    this.employeeForm.patchValue({
      firstName: employee.firstName,
      lastName: employee.lastName,
      email: employee.email,
      phone: employee.phone,
      address: employee.address,
      departmentId: employee.department,
      positionId: employee.position,
      hireDate: new Date(employee.hireDate).toISOString().split('T')[0],
      salary: employee.salary
    });
    
    this.clearMessages();
  }

  closeModal(): void {
    this.isModalOpen = false;
    this.isEditing = false;
    this.editingEmployeeId = '';
    this.employeeForm.reset();
    this.clearMessages();
  }

  clearMessages(): void {
    this.error = '';
    this.success = '';
  }

  onSubmit(): void {
    if (this.employeeForm.invalid) {
      return;
    }

    this.loading = true;
    this.clearMessages();

    if (this.isEditing) {
      this.updateEmployee();
    } else {
      this.createEmployee();
    }
  }

  createEmployee(): void {
    const employeeData: CreateEmployeeRequest = {
      ...this.employeeForm.value,
      hireDate: new Date(this.employeeForm.value.hireDate)
    };

    this.employeeService.createEmployee(employeeData).subscribe({
      next: (employee) => {
        this.loading = false;
        this.success = 'Employee created successfully!';
        this.loadEmployees();
        this.closeModal();
      },
      error: (error) => {
        this.loading = false;
        this.error = error.error?.message || 'Failed to create employee';
      }
    });
  }

  updateEmployee(): void {
    const employeeData = {
      ...this.employeeForm.value,
      hireDate: new Date(this.employeeForm.value.hireDate)
    };

    this.employeeService.updateEmployee(this.editingEmployeeId, employeeData).subscribe({
      next: (employee) => {
        this.loading = false;
        this.success = 'Employee updated successfully!';
        this.loadEmployees();
        this.closeModal();
      },
      error: (error) => {
        this.loading = false;
        this.error = error.error?.message || 'Failed to update employee';
      }
    });
  }

  deleteEmployee(employee: Employee): void {
    if (confirm(`Are you sure you want to delete ${employee.firstName} ${employee.lastName}?`)) {
      this.employeeService.deleteEmployee(employee.id).subscribe({
        next: () => {
          this.success = 'Employee deleted successfully!';
          this.loadEmployees();
        },
        error: (error) => {
          this.error = error.error?.message || 'Failed to delete employee';
        }
      });
    }
  }

  getDepartmentName(departmentId: string): string {
    const department = this.departments.find(d => d.id === departmentId);
    return department ? department.name : 'Unknown';
  }

  getPositionTitle(positionId: string): string {
    const position = this.positions.find(p => p.id === positionId);
    return position ? position.title : 'Unknown';
  }
}
