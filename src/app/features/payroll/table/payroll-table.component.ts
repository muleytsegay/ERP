import { Component } from '@angular/core';

@Component({
  selector: 'app-payroll-table',
  templateUrl: './payroll-table.component.html',
})
export class PayrollTableComponent {
  payrolls = [
    {
      employee: 'John Doe',
      role: 'Software Engineer',
      salary: 5500,
      status: 'Paid',
    },
    {
      employee: 'Sarah Lee',
      role: 'HR Manager',
      salary: 4500,
      status: 'Pending',
    },
    {
      employee: 'Mike Smith',
      role: 'Accountant',
      salary: 5000,
      status: 'Paid',
    },
    {
      employee: 'Anna Paul',
      role: 'UI/UX Designer',
      salary: 4200,
      status: 'Overdue',
    },
  ];

  getStatusColor(status: string) {
    switch (status) {
      case 'Paid':
        return 'success';
      case 'Pending':
        return 'warning';
      case 'Overdue':
        return 'danger';
      default:
        return 'info';
    }
  }
}
