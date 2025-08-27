import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { PayrollRoutingModule } from './payroll-routing.module';
import { PayrollHomeComponent } from './pages/payroll-home.components';

import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { DropdownModule } from 'primeng/dropdown';
import { TagModule } from 'primeng/tag';

@NgModule({
  // declarations: [PayrollHomeComponent],
  imports: [
    CommonModule,
    RouterModule,
    PayrollRoutingModule,
    CommonModule,
    TableModule,
    ButtonModule,
    InputTextModule,
    DropdownModule,
    TagModule,
  ],
})
export class PayrollModule {}
