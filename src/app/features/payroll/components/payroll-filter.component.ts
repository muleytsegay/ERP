import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DropdownModule } from 'primeng/dropdown';
import { ButtonModule } from 'primeng/button';
import { PayrollPeriod } from '../models/payroll.model';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-payroll-filter',
  standalone: true,
  imports: [FormsModule, CommonModule, DropdownModule, ButtonModule],
  template: `
    <div class="toolbar">
      <p-dropdown
        [options]="periods"
        [(ngModel)]="selected"
        optionLabel="label"
        placeholder="Select period"
        (onChange)="periodChange()"
      ></p-dropdown>

      <div class="actions">
        <button
          style="color: #000;"
          pButton
          type="button"
          label="Export Payroll"
          icon="pi pi-download"
          class="p-button-secondary bg-white"
          (click)="export.emit(selected?.value)"
        ></button>
        <button
          style="color: #000;"
          pButton
          type="button"
          label="Generate Reports"
          icon="pi pi-file"
          (click)="process.emit(selected?.value)"
          class="p-button-secondary bg-white"
        ></button>
        <!-- <button
          pButton
          type="button"
          label="Process Payroll"
          icon="pi pi-play"
          class="p-button-success"
          (click)="process.emit(selected?.value)"
        ></button> -->
      </div>
    </div>
  `,
  styles: [
    `
      .toolbar {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 12px;
        margin: 20px 0;
        color: #000;
        background: #fff;
        padding: 25px 16px;
        border-radius: 8px;
        // box-shadow: 0 1px 6px rgba(0, 0, 0, 0.06);
      }
      p-dropdown {
        width: 220px;
      }
      .actions {
        display: flex;
        gap: 10px;
        align-items: center;
      }
    `,
  ],
})
export class PayrollFilterComponent {
  @Input() periods: PayrollPeriod[] = [];
  @Input() selected?: PayrollPeriod;
  @Output() change = new EventEmitter<string>();
  @Output() process = new EventEmitter<string | undefined>();
  @Output() export = new EventEmitter<string | undefined>();

  periodChange() {
    this.change.emit(this.selected?.value);
  }
}
