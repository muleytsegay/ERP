// // src/app/features/payroll/components/filter/payroll-filter.component.ts
// import { Component, EventEmitter, Input, Output } from '@angular/core';
// import { CommonModule } from '@angular/common';
// import { DropdownModule } from 'primeng/dropdown';
// import { ButtonModule } from 'primeng/button';
// import { PayrollPeriod } from '../../models/payroll.model';
// import { FormsModule } from '@angular/forms';

// @Component({
//   selector: 'app-payroll-filter',
//   standalone: true,
//   imports: [FormsModule, CommonModule, DropdownModule, ButtonModule],
//   templateUrl: './payroll-filter.component.html',
//   styleUrls: ['./payroll-filter.component.css'],
// })
// export class PayrollFilterComponent {
//   // Input properties - coming from parent component
//   @Input() periods: PayrollPeriod[] = []; // List of payroll periods
//   @Input() selected?: PayrollPeriod; // Currently selected period

//   // Output events - sending data to parent component
//   @Output() change = new EventEmitter<string>();
//   @Output() process = new EventEmitter<string | undefined>();
//   @Output() export = new EventEmitter<string | undefined>();

//   // Triggered when user changes payroll period
//   periodChange() {
//     this.change.emit(this.selected?.value);
//   }
// }
// src/app/features/payroll/components/filter/payroll-filter.component.ts
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DropdownModule } from 'primeng/dropdown';
import { ButtonModule } from 'primeng/button';
import { PayrollPeriod } from '../../models/payroll.model';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-payroll-filter',
  standalone: true,
  imports: [FormsModule, CommonModule, DropdownModule, ButtonModule],
  templateUrl: './payroll-filter.component.html',
  styleUrls: ['./payroll-filter.component.css'],
})
export class PayrollFilterComponent {
  // Input properties - coming from parent component
  @Input() periods: PayrollPeriod[] = []; // List of payroll periods
  @Input() selected?: PayrollPeriod; // Currently selected period

  // Output events - sending data to parent component
  @Output() change = new EventEmitter<string>();
  @Output() process = new EventEmitter<string | undefined>();
  @Output() export = new EventEmitter<string | undefined>();

  // Triggered when user changes payroll period
  periodChange() {
    if (this.selected && this.selected.value) {
      this.change.emit(this.selected.value);
    }
  }

  // Triggered when user clicks process button
  onProcess() {
    this.process.emit(this.selected?.value);
  }

  // Triggered when user clicks export button
  onExport() {
    this.export.emit(this.selected?.value);
  }
}
