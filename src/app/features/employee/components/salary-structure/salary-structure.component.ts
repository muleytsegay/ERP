import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { InputNumberModule } from 'primeng/inputnumber';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { DividerModule } from 'primeng/divider';

@Component({
  selector: 'app-salary-structure',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    InputNumberModule,
    ButtonModule,
    CardModule,
    DividerModule
  ],
  template: `
    <p-card header="Salary Structure">
      <form [formGroup]="salaryForm" class="p-4">
        <div class="grid">
          <div class="col-12 md:col-6">
            <label for="basicSalary" class="block text-900 font-medium mb-2">Basic Salary *</label>
            <p-inputNumber
              id="basicSalary"
              formControlName="basicSalary"
              mode="currency"
              currency="USD"
              locale="en-US"
              [min]="0"
              class="w-full"
              (onInput)="calculateTotal()">
            </p-inputNumber>
            <small 
              class="p-error" 
              *ngIf="salaryForm.get('basicSalary')?.invalid && salaryForm.get('basicSalary')?.touched">
              Basic salary is required
            </small>
          </div>

          <div class="col-12 md:col-6">
            <label for="housingAllowance" class="block text-900 font-medium mb-2">Housing Allowance</label>
            <p-inputNumber
              id="housingAllowance"
              formControlName="housingAllowance"
              mode="currency"
              currency="USD"
              locale="en-US"
              [min]="0"
              class="w-full"
              (onInput)="calculateTotal()">
            </p-inputNumber>
          </div>

          <div class="col-12 md:col-6">
            <label for="transportAllowance" class="block text-900 font-medium mb-2">Transport Allowance</label>
            <p-inputNumber
              id="transportAllowance"
              formControlName="transportAllowance"
              mode="currency"
              currency="USD"
              locale="en-US"
              [min]="0"
              class="w-full"
              (onInput)="calculateTotal()">
            </p-inputNumber>
          </div>

          <div class="col-12 md:col-6">
            <label for="otherAllowance" class="block text-900 font-medium mb-2">Other Allowance</label>
            <p-inputNumber
              id="otherAllowance"
              formControlName="otherAllowance"
              mode="currency"
              currency="USD"
              locale="en-US"
              [min]="0"
              class="w-full"
              (onInput)="calculateTotal()">
            </p-inputNumber>
          </div>

          <div class="col-12">
            <p-divider></p-divider>
            <div class="flex justify-content-between align-items-center">
              <h4 class="text-lg font-semibold text-900 m-0">Total Salary:</h4>
              <h4 class="text-lg font-bold text-primary m-0">{{ totalSalary | currency:'USD':'symbol':'1.2-2' }}</h4>
            </div>
          </div>
        </div>
      </form>
    </p-card>
  `,
  styles: [`
    :host {
      display: block;
    }
  `]
})
export class SalaryStructureComponent implements OnInit {
  @Input() initialData: any = null;
  @Output() dataChange = new EventEmitter<any>();
  @Output() validChange = new EventEmitter<boolean>();

  salaryForm: FormGroup;
  totalSalary = 0;

  constructor(private fb: FormBuilder) {
    this.salaryForm = this.fb.group({
      basicSalary: [0, [Validators.required, Validators.min(0)]],
      housingAllowance: [0, [Validators.min(0)]],
      transportAllowance: [0, [Validators.min(0)]],
      otherAllowance: [0, [Validators.min(0)]]
    });
  }

  ngOnInit() {
    if (this.initialData) {
      this.salaryForm.patchValue(this.initialData);
    }

    this.salaryForm.valueChanges.subscribe(value => {
      this.dataChange.emit(value);
      this.validChange.emit(this.salaryForm.valid);
    });

    this.calculateTotal();
  }

  calculateTotal() {
    const values = this.salaryForm.value;
    this.totalSalary = (values.basicSalary || 0) + 
                      (values.housingAllowance || 0) + 
                      (values.transportAllowance || 0) + 
                      (values.otherAllowance || 0);
  }

  getSalaryData() {
    return this.salaryForm.value;
  }

  isValid() {
    return this.salaryForm.valid;
  }
}
