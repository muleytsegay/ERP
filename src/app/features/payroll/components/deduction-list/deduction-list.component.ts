import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { DropdownModule } from 'primeng/dropdown';
import { InputTextModule } from 'primeng/inputtext';
import { InputNumberModule } from 'primeng/inputnumber';
import { CheckboxModule } from 'primeng/checkbox';
import { CalendarModule } from 'primeng/calendar';
import { FormsModule } from '@angular/forms';
import {
  Deduction,
  CreateDeductionDto,
  UpdateDeductionDto,
} from '../../models/deduction.model';
import { PayrollService } from '../../services/payroll.service';
// import { MessageService } from 'primeng/api';

@Component({
  selector: 'app-deduction-list',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    TableModule,
    ButtonModule,
    DialogModule,
    InputTextModule,
    InputNumberModule,
    DropdownModule,
    CheckboxModule,
    CalendarModule,
  ],
  templateUrl: './deduction-list.component.html',
  styleUrls: ['./deduction-list.component.css'],
})
export class DeductionListComponent implements OnInit {
  deductions: Deduction[] = [];
  employees: any[] = []; // Add this property
  displayDialog: boolean = false;
  editingDeduction: boolean = false;
  deduction: Deduction = this.emptyDeduction();

  constructor(
    private payrollService: PayrollService
  ) // private messageService: MessageService
  {}

  ngOnInit() {
    this.loadDeductions();
    this.loadEmployees(); // Call loadEmployees
  }

  loadDeductions() {
    this.payrollService.getAllDeductions().subscribe({
      next: (deductions) => {
        this.deductions = deductions;
      },
      error: (error) => {
        console.error('Error loading deductions:', error);
        // this.messageService.add({
        //   severity: 'error',
        //   summary: 'Error',
        //   detail: 'Failed to load deductions',
        // });
      },
    });
  }

  loadEmployees() {
    this.payrollService.getAllEmployees().subscribe({
      next: (employees) => {
        this.employees = employees;
      },
      error: (err) => {
        console.error('Failed to load employees', err);
        // this.messageService.add({
        //   severity: 'error',
        //   summary: 'Error',
        //   detail: 'Failed to load employees',
        // });
      },
    });
  }

  showDialogToAdd() {
    this.editingDeduction = false;
    this.deduction = this.emptyDeduction();
    this.displayDialog = true;
  }

  showDialogToEdit(deduction: Deduction) {
    this.editingDeduction = true;
    this.deduction = { ...deduction };
    this.displayDialog = true;
  }

  save() {
    if (this.editingDeduction && this.deduction.id) {
      const updateData: UpdateDeductionDto = {
        name: this.deduction.name,
        isPercentage: this.deduction.isPercentage,
        amountOrPercent: this.deduction.amountOrPercent,
        isRecurring: this.deduction.isRecurring,
        startUtc: this.deduction.startUtc,
        endUtc: this.deduction.endUtc,
        notes: this.deduction.notes,
      };

      this.payrollService
        .updateDeduction(this.deduction.id, updateData)
        .subscribe({
          next: () => {
            // this.messageService.add({
            //   severity: 'success',
            //   summary: 'Success',
            //   detail: 'Deduction updated successfully',
            // });
            this.loadDeductions();
            this.displayDialog = false;
          },
          error: (error) => {
            console.error('Error updating deduction:', error);
            // this.messageService.add({
            //   severity: 'error',
            //   summary: 'Error',
            //   detail: 'Failed to update deduction',
            // });
          },
        });
    } else {
      const createData: CreateDeductionDto = {
        employeeId: this.deduction.employeeId,
        name: this.deduction.name,
        isPercentage: this.deduction.isPercentage,
        amountOrPercent: this.deduction.amountOrPercent,
        isRecurring: this.deduction.isRecurring,
        startUtc: this.deduction.startUtc,
        endUtc: this.deduction.endUtc,
        notes: this.deduction.notes,
      };

      this.payrollService.createDeduction(createData).subscribe({
        next: () => {
          // this.messageService.add({
          //   severity: 'success',
          //   summary: 'Success',
          //   detail: 'Deduction created successfully',
          // });
          this.loadDeductions();
          this.displayDialog = false;
        },
        error: (error) => {
          console.error('Error creating deduction:', error);
          // this.messageService.add({
          //   severity: 'error',
          //   summary: 'Error',
          //   detail: 'Failed to create deduction',
          // });
        },
      });
    }
  }

  deleteDeduction(deduction: Deduction) {
    if (deduction.id) {
      this.payrollService.deleteDeduction(deduction.id).subscribe({
        next: () => {
          // this.messageService.add({
          //   severity: 'success',
          //   summary: 'Success',
          //   detail: 'Deduction deleted successfully',
          // });
          this.loadDeductions();
        },
        error: (error) => {
          console.error('Error deleting deduction:', error);
          // this.messageService.add({
          //   severity: 'error',
          //   summary: 'Error',
          //   detail: 'Failed to delete deduction',
          // });
        },
      });
    }
  }

  emptyDeduction(): Deduction {
    return {
      employeeId: '',
      name: '',
      isPercentage: false,
      amountOrPercent: 0,
      isRecurring: false,
    };
  }
}
