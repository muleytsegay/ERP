
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Employee } from '../models/employee.model';
import { EmployeeService } from '../services/employee.service';
import { TableComponent, TableColumn, TableAction } from '../../../shared/components/ui/table/table.component';
import { ModalComponent } from '../../../shared/components/ui/modal/modal.component';
import { InputComponent } from '../../../shared/components/ui/input/input.component';
import { ButtonComponent } from '../../../shared/components/ui/button/button.component';
import { DropdownComponent } from '../../../shared/components/ui/dropdown/dropdown.component';
import { AlertComponent } from '../../../shared/components/ui/alert/alert.component';

@Component({
  selector: 'app-employee',
  templateUrl: './employee.component.html',
  standalone: true,
  imports: [CommonModule, FormsModule, TableComponent, ModalComponent, InputComponent, ButtonComponent, DropdownComponent, AlertComponent]
})
export class EmployeeComponent implements OnInit {
  newEmployee: any = {
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    address: '',
    departmentId: '',
    positionId: '',
    hireDate: new Date().toISOString().split('T')[0], // Default to today
    salary: 0
  };

  departmentOptions: { label: string; value: string }[] = [];
  positionOptions: { label: string; value: string }[] = [];

  showAddModal = false;
  employees: Employee[] = [];
  loading = false;
  error = '';

  employeeColumns: TableColumn[] = [
    { key: 'fullName', label: 'Name' },
    { key: 'email', label: 'Email' },
    { key: 'department', label: 'Department' },
    { key: 'position', label: 'Position' }
  ];

  employeeActions: TableAction[] = [
    {
      label: 'Edit',
      action: (row) => this.editEmployee(row),
      class: 'btn btn-sm btn-primary'
    },
    {
      label: 'Delete',
      action: (row) => this.deleteEmployee(row.id),
      class: 'btn btn-sm btn-danger'
    }
  ];

  constructor(private employeeService: EmployeeService) {}

  ngOnInit(): void {
    this.getEmployees();
    this.getDepartments();
    this.getPositions();
  }

  getDepartments(): void {
    this.employeeService.getDepartments().subscribe({
      next: (data) => {
        const departments = Array.isArray(data) ? data : (Array.isArray((data as any).data) ? (data as any).data : []);
        this.departmentOptions = departments.map((dept: any) => ({
          label: dept.name,
          value: dept.id
        }));
      },
      error: (err) => {
        console.error('Failed to load departments:', err);
        // Fallback to empty array if API fails
        this.departmentOptions = [];
      }
    });
  }

  getPositions(): void {
    this.employeeService.getPositions().subscribe({
      next: (data) => {
        const positions = Array.isArray(data) ? data : (Array.isArray((data as any).data) ? (data as any).data : []);
        this.positionOptions = positions.map((pos: any) => ({
          label: pos.title,
          value: pos.id
        }));
      },
      error: (err) => {
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
  }

  getEmployees(): void {
    this.loading = true;
    this.employeeService.getEmployees().subscribe({
      next: (data) => {
        const employeesArr = Array.isArray(data) ? data : (Array.isArray((data as any).data) ? (data as any).data : []);
        this.employees = (employeesArr as any[]).map((emp: any) => ({
          ...emp,
          fullName: emp.firstName + ' ' + emp.lastName
        }));
        this.loading = false;
      },
      error: (err) => {
        this.error = 'Failed to load employees.';
        this.loading = false;
      }
    });
  }

  deleteEmployee(id: string): void {
    if (!confirm('Are you sure you want to delete this employee?')) return;
    this.employeeService.deleteEmployee(id).subscribe({
      next: () => {
        this.getEmployees();
      },
      error: () => {
        this.error = 'Failed to delete employee.';
      }
    });
  }

  editEmployee(employee: Employee): void {
    alert('Edit employee: ' + employee.firstName);
  }

  onAddEmployeeSubmit(event?: Event) {
    if (event) {
      event.preventDefault();
    }
    this.loading = true;
    this.error = '';
    this.employeeService.createEmployee(this.newEmployee).subscribe({
      next: () => {
        this.loading = false;
        this.closeAddModal();
        this.getEmployees();
        this.newEmployee = { 
          firstName: '', 
          lastName: '', 
          email: '',
          phone: '',
          address: '',
          departmentId: '', 
          positionId: '',
          hireDate: new Date().toISOString().split('T')[0],
          salary: 0
        };
      },
      error: (err) => {
        this.loading = false;
        this.error = err.error?.message || 'Failed to add employee.';
      }
    });
  }
}
