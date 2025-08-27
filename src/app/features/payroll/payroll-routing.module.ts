import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { PayrollHomeComponent } from './pages/payroll-home.components';

const routes: Routes = [
  { path: '', component: PayrollHomeComponent }, // /payroll
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class PayrollRoutingModule {}
