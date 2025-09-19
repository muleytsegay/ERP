// // src/app/features/payroll/components/table/payroll-table.component.ts
// import { Component, Input, Output, EventEmitter } from '@angular/core';
// import { CommonModule } from '@angular/common';
// import { TableModule } from 'primeng/table';
// import { ButtonModule } from 'primeng/button';
// import { EmployeePayroll } from '../../models/payroll.model';
// import { MessageService } from 'primeng/api';
// import { ToastModule } from 'primeng/toast';

// @Component({
//   selector: 'app-payroll-table',
//   standalone: true,
//   imports: [CommonModule, TableModule, ButtonModule],
//   templateUrl: './payroll-table.component.html',
//   styleUrls: ['./payroll-table.component.css'],
//   providers: [MessageService, ToastModule],
// })
// export class PayrollTableComponent {
//   @Input() employees: EmployeePayroll[] = [];

//   @Output() payslip = new EventEmitter<string>();
//   @Output() approve = new EventEmitter<string>();
//   @Output() reject = new EventEmitter<string>();

//   @Output() lazyLoad = new EventEmitter<any>();
//   // @Output() pay = new EventEmitter<string>();
//   // @Output() cancel = new EventEmitter<string>();

//   // markAsPaid(id: string) {
//   //   this.pay.emit(id);
//   // }

//   // cancelPayroll(id: string) {
//   //   this.cancel.emit(id);
//   // }

//   downloadPayslip(employeeId: string) {
//     this.payslip.emit(employeeId);
//   }

//   loadPayroll(event: any) {
//     // event.first = index of first row
//     // event.rows = number of rows per page
//     const page = event.first / event.rows; // convert first index to page number
//     this.lazyLoad.emit({ page, size: event.rows });
//   }
// }
// src/app/features/payroll/components/table/payroll-table.component.ts
import {
  Component,
  Input,
  Output,
  EventEmitter,
  OnChanges,
  SimpleChanges,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { EmployeePayroll } from '../../models/payroll.model';

@Component({
  selector: 'app-payroll-table',
  standalone: true,
  imports: [CommonModule, TableModule, ButtonModule],
  templateUrl: './payroll-table.component.html',
  styleUrls: ['./payroll-table.component.css'],
})
export class PayrollTableComponent implements OnChanges {
  @Input() employees: EmployeePayroll[] = [];

  @Output() payslip = new EventEmitter<string>();
  @Output() approve = new EventEmitter<string>();
  @Output() reject = new EventEmitter<string>();
  @Output() lazyLoad = new EventEmitter<any>();
  @Output() markAsPaid = new EventEmitter<string>();
  @Output() delete = new EventEmitter<string>();

  // ngOnChanges(changes: SimpleChanges) {
  //   if (changes['employees'] && changes['employees'].currentValue) {
  //     console.log(
  //       'Table received employees:',
  //       changes['employees'].currentValue
  //     );
  //   }
  // }
  // In your payroll-table.component.ts, update the ngOnChanges method
  ngOnChanges(changes: SimpleChanges) {
    if (changes['employees'] && changes['employees'].currentValue) {
      console.log(
        'Table received employees:',
        changes['employees'].currentValue
      );
      console.log(
        'Table employees length:',
        changes['employees'].currentValue.length
      );
    }
  }

  downloadPayslip(employeeId: string) {
    this.payslip.emit(employeeId);
  }

  loadPayroll(event: any) {
    const page = event.first / event.rows;
    this.lazyLoad.emit({ page, size: event.rows });
  }

  onMarkAsPaid(id: string) {
    this.markAsPaid.emit(id);
  }

  onDelete(id: string) {
    this.delete.emit(id);
  }
}
