// // src/app/features/payroll/components/bonus-list/bonus-list.component.ts
// import { Component, OnInit } from '@angular/core';
// import { CommonModule } from '@angular/common';
// import { TableModule } from 'primeng/table';
// import { ButtonModule } from 'primeng/button';
// import { DialogModule } from 'primeng/dialog';
// import { DropdownModule } from 'primeng/dropdown';
// import { InputTextModule } from 'primeng/inputtext';
// import { InputNumberModule } from 'primeng/inputnumber';
// import { CheckboxModule } from 'primeng/checkbox';
// import { CalendarModule } from 'primeng/calendar';
// import { FormsModule } from '@angular/forms';
// import {
//   Bonus,
//   CreateBonusDto,
//   UpdateBonusDto,
// } from '../../models/bonus.model';
// import { PayrollService } from '../../services/payroll.service';
// import { MessageService } from 'primeng/api';
// import { EmployeePayroll } from '../../models/payroll.model';

// @Component({
//   selector: 'app-bonus-list',
//   standalone: true,
//   imports: [
//     CommonModule,
//     FormsModule,
//     TableModule,
//     ButtonModule,
//     DialogModule,
//     InputTextModule,
//     InputNumberModule,
//     DropdownModule,
//     CheckboxModule,
//     CalendarModule,
//   ],
//   templateUrl: './bonus-list.component.html',
//   styleUrls: ['./bonus-list.component.css'],
// })
// export class BonusListComponent implements OnInit {
//   bonuses: Bonus[] = [];
//   employees: EmployeePayroll[] = [];
//   displayDialog: boolean = false;
//   editingBonus: boolean = false;
//   bonus: Bonus = this.emptyBonus();
//   // selectedBonus: Bonus | null = null;

//   constructor(
//     private payrollService: PayrollService,
//     private messageService: MessageService
//   ) {}

//   ngOnInit() {
//     this.loadBonuses();
//     this.loadEmployees();
//   }

//   loadBonuses() {
//     this.payrollService.getAllBonuses().subscribe({
//       next: (bonuses) => {
//         this.bonuses = bonuses;
//       },
//       error: (error) => {
//         console.error('Error loading bonuses:', error);
//         this.messageService.add({
//           severity: 'error',
//           summary: 'Error',
//           detail: 'Failed to load bonuses',
//         });
//       },
//     });
//   }
//   loadEmployees() {
//     this.payrollService.getAllEmployees().subscribe({
//       next: (employees) => {
//         this.employees = employees.map((e: any) => ({
//           id: e.id,
//           name: e.name,
//         }));
//       },
//       error: (err) => console.error('Failed to load employees', err),
//     });
//   }

//   showDialogToAdd() {
//     this.editingBonus = false;
//     this.bonus = this.emptyBonus();
//     this.displayDialog = true;
//   }

//   showDialogToEdit(bonus: Bonus) {
//     this.editingBonus = true;
//     this.bonus = { ...bonus };
//     this.displayDialog = true;
//   }

//   save() {
//     if (this.editingBonus && this.bonus.id) {
//       const updateData: UpdateBonusDto = {
//         name: this.bonus.name,
//         notes: this.bonus.notes,
//         isPercentage: this.bonus.isPercentage,
//         amountOrPercent: this.bonus.amountOrPercent,
//         isRecurring: this.bonus.isRecurring,
//         startUtc: this.bonus.startUtc,
//         endUtc: this.bonus.endUtc,
//       };

//       this.payrollService.updateBonus(this.bonus.id, updateData).subscribe({
//         next: () => {
//           this.messageService.add({
//             severity: 'success',
//             summary: 'Success',
//             detail: 'Bonus updated successfully',
//           });
//           this.loadBonuses();
//           this.displayDialog = false;
//         },
//         error: (error) => {
//           console.error('Error updating bonus:', error);
//           this.messageService.add({
//             severity: 'error',
//             summary: 'Error',
//             detail: 'Failed to update bonus',
//           });
//         },
//       });
//     } else {
//       const createData: CreateBonusDto = {
//         employeeId: this.bonus.employeeId,
//         name: this.bonus.name,
//         notes: this.bonus.notes,
//         isPercentage: this.bonus.isPercentage,
//         amountOrPercent: this.bonus.amountOrPercent,
//         isRecurring: this.bonus.isRecurring,
//         startUtc: this.bonus.startUtc,
//         endUtc: this.bonus.endUtc,
//       };

//       this.payrollService.createBonus(createData).subscribe({
//         next: () => {
//           this.messageService.add({
//             severity: 'success',
//             summary: 'Success',
//             detail: 'Bonus created successfully',
//           });
//           this.loadBonuses();
//           this.displayDialog = false;
//         },
//         error: (error) => {
//           console.error('Error creating bonus:', error);
//           this.messageService.add({
//             severity: 'error',
//             summary: 'Error',
//             detail: 'Failed to create bonus',
//           });
//         },
//       });
//     }
//   }

//   deleteBonus(bonus: Bonus) {
//     if (bonus.id) {
//       this.payrollService.deleteBonus(bonus.id).subscribe({
//         next: () => {
//           this.messageService.add({
//             severity: 'success',
//             summary: 'Success',
//             detail: 'Bonus deleted successfully',
//           });
//           this.loadBonuses();
//         },
//         error: (error) => {
//           console.error('Error deleting bonus:', error);
//           this.messageService.add({
//             severity: 'error',
//             summary: 'Error',
//             detail: 'Failed to delete bonus',
//           });
//         },
//       });
//     }
//   }

//   emptyBonus(): Bonus {
//     return {
//       employeeId: '',
//       name: '',
//       isPercentage: false,
//       amountOrPercent: 0,
//       isRecurring: false,
//     };
//   }
// }
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
  Bonus,
  CreateBonusDto,
  UpdateBonusDto,
} from '../../models/bonus.model';
import { PayrollService } from '../../services/payroll.service';
// import { MessageService } from 'primeng/api';

@Component({
  selector: 'app-bonus-list',
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
  templateUrl: './bonus-list.component.html',
  styleUrls: ['./bonus-list.component.css'],
})
export class BonusListComponent implements OnInit {
  bonuses: Bonus[] = [];
  employees: any[] = []; // Change type to any[]
  displayDialog: boolean = false;
  editingBonus: boolean = false;
  bonus: Bonus = this.emptyBonus();

  constructor(
    private payrollService: PayrollService
  ) // private messageService: MessageService
  {}

  ngOnInit() {
    this.loadBonuses();
    this.loadEmployees();
  }

  loadBonuses() {
    this.payrollService.getAllBonuses().subscribe({
      next: (bonuses) => {
        this.bonuses = bonuses;
      },
      error: (error) => {
        console.error('Error loading bonuses:', error);
        // this.messageService.add({
        //   severity: 'error',
        //   summary: 'Error',
        //   detail: 'Failed to load bonuses',
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
    this.editingBonus = false;
    this.bonus = this.emptyBonus();
    this.displayDialog = true;
  }

  showDialogToEdit(bonus: Bonus) {
    this.editingBonus = true;
    this.bonus = { ...bonus };
    this.displayDialog = true;
  }

  save() {
    if (this.editingBonus && this.bonus.id) {
      const updateData: UpdateBonusDto = {
        name: this.bonus.name,
        notes: this.bonus.notes,
        isPercentage: this.bonus.isPercentage,
        amountOrPercent: this.bonus.amountOrPercent,
        isRecurring: this.bonus.isRecurring,
        startUtc: this.bonus.startUtc,
        endUtc: this.bonus.endUtc,
      };

      this.payrollService.updateBonus(this.bonus.id, updateData).subscribe({
        next: () => {
          // this.messageService.add({
          //   severity: 'success',
          //   summary: 'Success',
          //   detail: 'Bonus updated successfully',
          // });
          this.loadBonuses();
          this.displayDialog = false;
        },
        error: (error) => {
          console.error('Error updating bonus:', error);
          // this.messageService.add({
          //   severity: 'error',
          //   summary: 'Error',
          //   detail: 'Failed to update bonus',
          // });
        },
      });
    } else {
      const createData: CreateBonusDto = {
        employeeId: this.bonus.employeeId,
        name: this.bonus.name,
        notes: this.bonus.notes,
        isPercentage: this.bonus.isPercentage,
        amountOrPercent: this.bonus.amountOrPercent,
        isRecurring: this.bonus.isRecurring,
        startUtc: this.bonus.startUtc,
        endUtc: this.bonus.endUtc,
      };

      this.payrollService.createBonus(createData).subscribe({
        next: () => {
          // this.messageService.add({
          //   severity: 'success',
          //   summary: 'Success',
          //   detail: 'Bonus created successfully',
          // });
          this.loadBonuses();
          this.displayDialog = false;
        },
        error: (error) => {
          console.error('Error creating bonus:', error);
          // this.messageService.add({
          //   severity: 'error',
          //   summary: 'Error',
          //   detail: 'Failed to create bonus',
          // });
        },
      });
    }
  }

  deleteBonus(bonus: Bonus) {
    if (bonus.id) {
      this.payrollService.deleteBonus(bonus.id).subscribe({
        next: () => {
          // this.messageService.add({
          //   severity: 'success',
          //   summary: 'Success',
          //   detail: 'Bonus deleted successfully',
          // });
          this.loadBonuses();
        },
        error: (error) => {
          console.error('Error deleting bonus:', error);
          // this.messageService.add({
          //   severity: 'error',
          //   summary: 'Error',
          //   detail: 'Failed to delete bonus',
          // });
        },
      });
    }
  }

  emptyBonus(): Bonus {
    return {
      employeeId: '',
      name: '',
      isPercentage: false,
      amountOrPercent: 0,
      isRecurring: false,
    };
  }

  // Helper method to get employee name by ID
  getEmployeeName(employeeId: string): string {
    const employee = this.employees.find((emp) => emp.id === employeeId);
    return employee ? employee.name : 'Unknown Employee';
  }
}
