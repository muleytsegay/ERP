import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { DepartmentService } from '../../shared/services/department.service';
import { EmployeeService } from '../../shared/services/employee.service';
import { Department, Position, Employee } from '../../shared/models/employee.model';

@Component({
  selector: 'app-department',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule, RouterModule],
  templateUrl: './department.component.html',
  styleUrl: './department.component.css'
})
export class DepartmentComponent implements OnInit {
  departments: Department[] = [];
  positions: Position[] = [];
  employees: Employee[] = [];
  filteredDepartments: Department[] = [];
  selectedDepartment: Department | null = null;
  departmentEmployees: Employee[] = [];
  
  departmentForm: FormGroup;
  positionForm: FormGroup;
  searchTerm = '';
  activeTab = 'departments';
  
  isDepartmentModalOpen = false;
  isPositionModalOpen = false;
  isViewModalOpen = false;
  isEditingDepartment = false;
  isEditingPosition = false;
  editingDepartmentId = '';
  editingPositionId = '';
  
  loading = false;
  error = '';
  success = '';

  constructor(
    private departmentService: DepartmentService,
    private employeeService: EmployeeService,
    private formBuilder: FormBuilder
  ) {
    this.departmentForm = this.formBuilder.group({
      name: ['', [Validators.required, Validators.minLength(2)]],
      description: ['', [Validators.required]],
      managerId: [''],
      isActive: [true]
    });

    this.positionForm = this.formBuilder.group({
      title: ['', [Validators.required, Validators.minLength(2)]],
      departmentId: ['', [Validators.required]],
      baseSalary: ['', [Validators.required, Validators.min(0)]],
      description: ['', [Validators.required]],
      isActive: [true]
    });
  }

  ngOnInit(): void {
    this.loadDepartments();
    this.loadPositions();
    this.loadEmployees();
  }

  loadDepartments(): void {
    this.loading = true;
    this.departmentService.getDepartments().subscribe({
      next: (departments) => {
        this.departments = departments;
        this.filteredDepartments = departments;
        this.loading = false;
      },
      error: (error) => {
        this.error = 'Failed to load departments';
        this.loading = false;
      }
    });
  }

  loadPositions(): void {
    this.departmentService.getPositions().subscribe({
      next: (positions) => {
        this.positions = positions;
      },
      error: (error) => {
        console.error('Failed to load positions', error);
      }
    });
  }

  loadEmployees(): void {
    this.employeeService.getEmployees().subscribe({
      next: (employees) => {
        this.employees = employees;
      },
      error: (error) => {
        console.error('Failed to load employees', error);
      }
    });
  }

  get df() {
    return this.departmentForm.controls;
  }

  get pf() {
    return this.positionForm.controls;
  }

  setActiveTab(tab: string): void {
    this.activeTab = tab;
    this.clearMessages();
  }

  filterDepartments(): void {
    this.filteredDepartments = this.departments.filter(dept => 
      dept.name.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
      dept.description.toLowerCase().includes(this.searchTerm.toLowerCase())
    );
  }

  openDepartmentModal(): void {
    this.isDepartmentModalOpen = true;
    this.isEditingDepartment = false;
    this.departmentForm.reset({ isActive: true });
    this.clearMessages();
  }

  openEditDepartmentModal(department: Department): void {
    this.isDepartmentModalOpen = true;
    this.isEditingDepartment = true;
    this.editingDepartmentId = department.id;
    
    this.departmentForm.patchValue({
      name: department.name,
      description: department.description,
      managerId: department.managerId || '',
      isActive: department.isActive
    });
    
    this.clearMessages();
  }

  closeDepartmentModal(): void {
    this.isDepartmentModalOpen = false;
    this.isEditingDepartment = false;
    this.editingDepartmentId = '';
    this.departmentForm.reset();
    this.clearMessages();
  }

  openPositionModal(): void {
    this.isPositionModalOpen = true;
    this.isEditingPosition = false;
    this.positionForm.reset({ isActive: true });
    this.clearMessages();
  }

  openEditPositionModal(position: Position): void {
    this.isPositionModalOpen = true;
    this.isEditingPosition = true;
    this.editingPositionId = position.id;
    
    this.positionForm.patchValue({
      title: position.title,
      departmentId: position.departmentId,
      baseSalary: position.baseSalary,
      description: position.description,
      isActive: position.isActive
    });
    
    this.clearMessages();
  }

  closePositionModal(): void {
    this.isPositionModalOpen = false;
    this.isEditingPosition = false;
    this.editingPositionId = '';
    this.positionForm.reset();
    this.clearMessages();
  }

  viewDepartment(department: Department): void {
    this.selectedDepartment = department;
    this.isViewModalOpen = true;
    this.loadDepartmentEmployees(department.id);
  }

  closeViewModal(): void {
    this.isViewModalOpen = false;
    this.selectedDepartment = null;
    this.departmentEmployees = [];
  }

  loadDepartmentEmployees(departmentId: string): void {
    this.employeeService.getEmployeesByDepartment(departmentId).subscribe({
      next: (employees) => {
        this.departmentEmployees = employees;
      },
      error: (error) => {
        console.error('Failed to load department employees', error);
      }
    });
  }

  clearMessages(): void {
    this.error = '';
    this.success = '';
  }

  onSubmitDepartment(): void {
    if (this.departmentForm.invalid) {
      return;
    }

    this.loading = true;
    this.clearMessages();

    if (this.isEditingDepartment) {
      this.updateDepartment();
    } else {
      this.createDepartment();
    }
  }

  createDepartment(): void {
    const departmentData = {
      ...this.departmentForm.value,
      managerId: this.departmentForm.value.managerId || null
    };

    this.departmentService.createDepartment(departmentData).subscribe({
      next: (department) => {
        this.loading = false;
        this.success = 'Department created successfully!';
        this.loadDepartments();
        this.closeDepartmentModal();
      },
      error: (error) => {
        this.loading = false;
        this.error = error.error?.message || 'Failed to create department';
      }
    });
  }

  updateDepartment(): void {
    const departmentData = {
      ...this.departmentForm.value,
      managerId: this.departmentForm.value.managerId || null
    };

    this.departmentService.updateDepartment(this.editingDepartmentId, departmentData).subscribe({
      next: (department) => {
        this.loading = false;
        this.success = 'Department updated successfully!';
        this.loadDepartments();
        this.closeDepartmentModal();
      },
      error: (error) => {
        this.loading = false;
        this.error = error.error?.message || 'Failed to update department';
      }
    });
  }

  onSubmitPosition(): void {
    if (this.positionForm.invalid) {
      return;
    }

    this.loading = true;
    this.clearMessages();

    if (this.isEditingPosition) {
      this.updatePosition();
    } else {
      this.createPosition();
    }
  }

  createPosition(): void {
    this.departmentService.createPosition(this.positionForm.value).subscribe({
      next: (position) => {
        this.loading = false;
        this.success = 'Position created successfully!';
        this.loadPositions();
        this.closePositionModal();
      },
      error: (error) => {
        this.loading = false;
        this.error = error.error?.message || 'Failed to create position';
      }
    });
  }

  updatePosition(): void {
    this.departmentService.updatePosition(this.editingPositionId, this.positionForm.value).subscribe({
      next: (position) => {
        this.loading = false;
        this.success = 'Position updated successfully!';
        this.loadPositions();
        this.closePositionModal();
      },
      error: (error) => {
        this.loading = false;
        this.error = error.error?.message || 'Failed to update position';
      }
    });
  }

  deleteDepartment(department: Department): void {
    if (confirm(`Are you sure you want to delete the department "${department.name}"?`)) {
      this.departmentService.deleteDepartment(department.id).subscribe({
        next: () => {
          this.success = 'Department deleted successfully!';
          this.loadDepartments();
        },
        error: (error) => {
          this.error = error.error?.message || 'Failed to delete department';
        }
      });
    }
  }

  deletePosition(position: Position): void {
    if (confirm(`Are you sure you want to delete the position "${position.title}"?`)) {
      this.departmentService.deletePosition(position.id).subscribe({
        next: () => {
          this.success = 'Position deleted successfully!';
          this.loadPositions();
        },
        error: (error) => {
          this.error = error.error?.message || 'Failed to delete position';
        }
      });
    }
  }

  getDepartmentName(departmentId: string): string {
    const department = this.departments.find(d => d.id === departmentId);
    return department ? department.name : 'Unknown';
  }

  getManagerName(managerId: string): string {
    const manager = this.employees.find(e => e.id === managerId);
    return manager ? `${manager.firstName} ${manager.lastName}` : 'No Manager Assigned';
  }

  getPositionsForDepartment(departmentId: string): Position[] {
    return this.positions.filter(p => p.departmentId === departmentId);
  }

  getEmployeeCountForDepartment(departmentId: string): number {
    return this.employees.filter(e => e.department === departmentId).length;
  }

  formatCurrency(amount: number): string {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  }
}
