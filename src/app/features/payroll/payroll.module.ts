import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { PayrollRoutingModule } from './payroll-routing.module';
import { PayrollHomeComponent } from './pages/payroll-home.components';

@NgModule({
  // declarations: [PayrollHomeComponent],
  imports: [CommonModule, RouterModule, PayrollRoutingModule],
})
export class PayrollModule {}
