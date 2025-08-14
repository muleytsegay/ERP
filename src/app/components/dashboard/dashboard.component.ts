import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { AuthService } from '../../shared/services/auth.service';
import { EmployeeService } from '../../shared/services/employee.service';
import { PayrollService } from '../../shared/services/payroll.service';
import { User } from '../../shared/models/user.model';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements OnInit {
  currentUser: User | null = null;
  stats = {
    totalEmployees: 0,
    activeEmployees: 0,
    totalPayrolls: 0,
    monthlyPayroll: 0
  };
  
  loading = false;

  constructor(
    private authService: AuthService,
    private employeeService: EmployeeService,
    private payrollService: PayrollService
  ) {}

  ngOnInit(): void {
    this.loadCurrentUser();
    this.loadDashboardStats();
  }

  loadCurrentUser(): void {
    this.authService.currentUser$.subscribe(user => {
      this.currentUser = user;
    });
  }

  loadDashboardStats(): void {
    this.loading = true;
    
    // Load employee stats
    this.employeeService.getEmployees().subscribe({
      next: (employees) => {
        this.stats.totalEmployees = employees.length;
        this.stats.activeEmployees = employees.filter(emp => emp.isActive).length;
      },
      error: (error) => {
        console.error('Failed to load employee stats', error);
      }
    });

    // Load payroll stats
    this.payrollService.getPayrolls().subscribe({
      next: (payrolls) => {
        this.stats.totalPayrolls = payrolls.length;
        this.stats.monthlyPayroll = payrolls
          .filter(p => this.isCurrentMonth(new Date(p.payPeriodStart)))
          .reduce((sum, p) => sum + p.netSalary, 0);
        this.loading = false;
      },
      error: (error) => {
        console.error('Failed to load payroll stats', error);
        this.loading = false;
      }
    });
  }

  private isCurrentMonth(date: Date): boolean {
    const now = new Date();
    return date.getMonth() === now.getMonth() && date.getFullYear() === now.getFullYear();
  }

  formatCurrency(amount: number): string {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  }

  getGreeting(): string {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  }
}
