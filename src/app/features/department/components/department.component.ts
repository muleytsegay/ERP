import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { DepartmentService } from '../services/department.service';
import { EmployeeService } from '../../employee/services/employee.service';
import { Department, Position, Employee } from '../../employee/models/employee.model';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { InputTextModule } from 'primeng/inputtext';
import { CardModule } from 'primeng/card';
import { ToastModule } from 'primeng/toast';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { MessageModule } from 'primeng/message';
import { CheckboxModule } from 'primeng/checkbox';
import { MessageService, ConfirmationService } from 'primeng/api';

@Component({
  selector: 'app-department',
  standalone: true,
  imports: [
    CommonModule, 
    ReactiveFormsModule, 
    FormsModule, 
    RouterModule, 
    TableModule,
    ButtonModule,
    DialogModule,
    InputTextModule,
    CardModule,
    ToastModule,
    ConfirmDialogModule,
    MessageModule,
    CheckboxModule
  ],
  providers: [MessageService, ConfirmationService],
  templateUrl: './department.component.html',
})
export class DepartmentComponent implements OnInit {
  departments: Department[] = [];
  positions: Position[] = [];
  employees: Employee[] = [];
  filteredDepartments: Department[] = [];
  transformedDepartments: any[] = [];
  transformedPositions: any[] = [];
  selectedDepartment: Department | null = null;
  departmentEmployees: Employee[] = [];
  
  departmentForm: FormGroup;
  positionForm: FormGroup;
  searchTerm = '';
  activeTab = 'departments';
  activeTabIndex = 0; // For PrimeNG TabView
  
  // Dropdown options for PrimeNG
  employeeOptions: any[] = [];
  departmentOptions: any[] = [];
  
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

  departmentActions = [
    { label: 'View', action: (row: any) => this.viewDepartment(row), class: 'btn btn-sm btn-info' },
    { label: 'Positions', action: (row: any) => this.manageDepartmentPositions(row), class: 'btn btn-sm btn-secondary' },
    { label: 'Edit', action: (row: any) => this.openEditDepartmentModal(row), class: 'btn btn-sm btn-primary' },
    { label: 'Delete', action: (row: any) => this.deleteDepartment(row), class: 'btn btn-sm btn-danger' }
  ];

  positionActions = [
    { label: 'Edit', action: (row: any) => this.openEditPositionModal(row), class: 'btn btn-sm btn-primary' },
    { label: 'Delete', action: (row: any) => this.deletePosition(row), class: 'btn btn-sm btn-danger' }
  ];

  constructor(
    private departmentService: DepartmentService,
    private employeeService: EmployeeService,
    private formBuilder: FormBuilder,
    private messageService: MessageService,
    private confirmationService: ConfirmationService
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
    this.setupDropdownOptions();
  }

  setupDropdownOptions(): void {
    // Setup employee options for dropdown
    this.employeeOptions = this.employees.map(emp => ({
      label: `${emp.firstName} ${emp.lastName}`,
      value: emp.id
    }));

    // Setup department options for dropdown
    this.departmentOptions = this.departments.map(dept => ({
      label: dept.name,
      value: dept.id
    }));
  }

  loadDepartments(): void {
    this.loading = true;
    this.departmentService.getDepartments().subscribe({
      next: (departments) => {
        this.departments = departments;
        this.filteredDepartments = departments;
        this.setupDropdownOptions();
        this.updateTransformedDepartments();
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
        this.updateTransformedPositions();
      },
      error: (error) => {
        console.error('Failed to load positions', error);
      }
    });
  }

  updateTransformedDepartments(): void {
    this.transformedDepartments = this.filteredDepartments.map(dept => ({
      ...dept,
      manager: this.getManagerName(dept.managerId),
      employeeCount: this.getEmployeeCountForDepartment(dept.id),
      positionCount: this.getPositionsForDepartment(dept.id).length,
      isActive: dept.isActive ? 'Yes' : 'No'
    }));
  }

  updateTransformedPositions(): void {
    this.transformedPositions = this.positions.map(pos => ({
      ...pos,
      departmentName: this.getDepartmentName(pos.departmentId),
      baseSalary: this.formatCurrency(pos.baseSalary),
      isActive: pos.isActive ? 'Yes' : 'No'
    }));
  }

  loadEmployees(): void {
    this.employeeService.getEmployees().subscribe({
      next: (employees) => {
        this.employees = employees;
        this.setupDropdownOptions();
        this.updateTransformedDepartments();
        this.updateTransformedPositions();
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
    this.updateTransformedDepartments();
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

  manageDepartmentPositions(department: Department): void {
    this.setActiveTab('positions');
    // Filter positions for this department (you could add a filter property if needed)
    this.clearMessages();
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
        this.messageService.add({
          severity: 'success',
          summary: 'Success',
          detail: 'Department created successfully!'
        });
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
        this.messageService.add({
          severity: 'success',
          summary: 'Success',
          detail: 'Department updated successfully!'
        });
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
        this.messageService.add({
          severity: 'success',
          summary: 'Success',
          detail: 'Position created successfully!'
        });
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
        this.messageService.add({
          severity: 'success',
          summary: 'Success',
          detail: 'Position updated successfully!'
        });
        this.loadPositions();
        this.closePositionModal();
      },
      error: (error) => {
        this.loading = false;
        this.error = error.error?.message || 'Failed to update position';
      }
    });
  }

  // PrimeNG specific methods
  editDepartment(department: Department): void {
    this.openEditDepartmentModal(department);
  }

  editPosition(position: Position): void {
    this.openEditPositionModal(position);
  }

  getDepartmentEmployeeCount(departmentId: string): number {
    return this.employees.filter(e => e.department === departmentId).length;
  }

  // Update delete methods to use PrimeNG confirmation dialog
  deleteDepartment(departmentId: string): void {
    const department = this.departments.find(d => d.id === departmentId);
    if (!department) return;

    this.confirmationService.confirm({
      message: `Are you sure you want to delete the department "${department.name}"?`,
      header: 'Delete Confirmation',
      icon: 'pi pi-exclamation-triangle',
      accept: () => {
        this.departmentService.deleteDepartment(departmentId).subscribe({
          next: () => {
            this.messageService.add({
              severity: 'success',
              summary: 'Success',
              detail: 'Department deleted successfully!'
            });
            this.loadDepartments();
          },
          error: (error) => {
            this.messageService.add({
              severity: 'error',
              summary: 'Error',
              detail: error.error?.message || 'Failed to delete department'
            });
          }
        });
      }
    });
  }

  deletePosition(positionId: string): void {
    const position = this.positions.find(p => p.id === positionId);
    if (!position) return;

    this.confirmationService.confirm({
      message: `Are you sure you want to delete the position "${position.title}"?`,
      header: 'Delete Confirmation',
      icon: 'pi pi-exclamation-triangle',
      accept: () => {
        this.departmentService.deletePosition(positionId).subscribe({
          next: () => {
            this.messageService.add({
              severity: 'success',
              summary: 'Success',
              detail: 'Position deleted successfully!'
            });
            this.loadPositions();
          },
          error: (error) => {
            this.messageService.add({
              severity: 'error',
              summary: 'Error',
              detail: error.error?.message || 'Failed to delete position'
            });
          }
        });
      }
    });
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
