import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { EmployeeService } from '../../employee/services/employee.service';
import { PayrollService } from '../../payroll/services/payroll.service';
import { User } from '../../auth/profile/models/user.model';
import { Employee } from '../../employee/models/employee.model';
import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import { TableModule } from 'primeng/table';
import { ChartModule } from 'primeng/chart';
import { TagModule } from 'primeng/tag';
import { ProgressBarModule } from 'primeng/progressbar';
import { AvatarModule } from 'primeng/avatar';
import { DividerModule } from 'primeng/divider';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    CardModule,
    ButtonModule,
    TableModule,
    ChartModule,
    TagModule,
    ProgressBarModule,
    AvatarModule,
    DividerModule,
  ],
  templateUrl: './dashboard.component.html',
})
export class DashboardComponent implements OnInit {
  currentUser: User | null = null;
  stats = {
    totalEmployees: 0,
    activeEmployees: 0,
    inactiveEmployees: 0,
    newHiresThisMonth: 0,
    totalPayrolls: 0,
    monthlyPayroll: 0,
    averageSalary: 0,
    totalDepartments: 0,
  };

  recentEmployees: Employee[] = [];
  departmentStats: { name: string; count: number }[] = [];

  // Chart data for PrimeNG Charts
  departmentChartData: any;
  employeeStatusChartData: any;
  chartOptions: any;

  loading = false;

  constructor(
    private authService: AuthService,
    private employeeService: EmployeeService,
    private PayrollService: PayrollService
  ) {}

  ngOnInit(): void {
    this.loadCurrentUser();
    this.loadDashboardStats();
    this.initializeCharts();
  }

  initializeCharts(): void {
    this.chartOptions = {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          position: 'bottom',
        },
      },
    };
  }

  updateChartData(): void {
    // Department distribution chart
    this.departmentChartData = {
      labels: this.departmentStats.map((d) => d.name),
      datasets: [
        {
          data: this.departmentStats.map((d) => d.count),
          backgroundColor: [
            '#FF6384',
            '#36A2EB',
            '#FFCE56',
            '#4BC0C0',
            '#9966FF',
            '#FF9F40',
          ],
        },
      ],
    };

    // Employee status chart
    this.employeeStatusChartData = {
      labels: ['Active', 'Inactive'],
      datasets: [
        {
          data: [this.stats.activeEmployees, this.stats.inactiveEmployees],
          backgroundColor: ['#4CAF50', '#F44336'],
        },
      ],
    };
  }

  loadCurrentUser(): void {
    this.authService.currentUser$.subscribe((user) => {
      this.currentUser = user;
    });
  }

  loadDashboardStats(): void {
    this.loading = true;

    this.employeeService.getEmployees().subscribe({
      next: (response) => {
        const employees = (response as any)?.data || response;

        if (!Array.isArray(employees)) {
          console.error('Employees data is not an array:', employees);
          this.loading = false;
          return;
        }

        // Total employees count
        this.stats.totalEmployees = employees.length;

        // Active vs inactive employees
        this.stats.activeEmployees = employees.filter(
          (emp) => emp.isActive !== false
        ).length;
        this.stats.inactiveEmployees = employees.filter(
          (emp) => emp.isActive === false
        ).length;

        // New hires this month
        const currentMonth = new Date().getMonth();
        const currentYear = new Date().getFullYear();
        this.stats.newHiresThisMonth = employees.filter((emp) => {
          if (emp.hireDate) {
            const hireDate = new Date(emp.hireDate);
            return (
              hireDate.getMonth() === currentMonth &&
              hireDate.getFullYear() === currentYear
            );
          }
          return false;
        }).length;

        // Average salary
        const activeSalaries = employees
          .filter((emp) => emp.isActive && emp.salary)
          .map((emp) => emp.salary || 0);
        this.stats.averageSalary =
          activeSalaries.length > 0
            ? activeSalaries.reduce((sum, salary) => sum + salary, 0) /
              activeSalaries.length
            : 0;

        // Recent employees (latest 5 hired)
        this.recentEmployees = employees
          .filter((emp) => emp.hireDate)
          .sort(
            (a, b) =>
              new Date(b.hireDate!).getTime() - new Date(a.hireDate!).getTime()
          )
          .slice(0, 5);

        // Department statistics
        const departmentCounts = employees.reduce((acc, emp) => {
          if (emp.department) {
            acc[emp.department] = (acc[emp.department] || 0) + 1;
          }
          return acc;
        }, {} as Record<string, number>);

        this.departmentStats = Object.keys(departmentCounts).map((dept) => ({
          name: dept,
          count: departmentCounts[dept],
        }));
        this.stats.totalDepartments = this.departmentStats.length;

        // Update chart data
        this.updateChartData();
      },
      error: (error) => {
        console.error('Failed to load employee stats', error);
        this.loading = false;
      },
    });

    // Load payroll stats (optional - might not be available yet)
    this.payrollService.getPayrolls().subscribe({
      next: (response) => {
        const payrolls = (response as any)?.data || response || [];
        this.stats.totalPayrolls = payrolls.length;
        if (Array.isArray(payrolls)) {
          this.stats.monthlyPayroll = payrolls
            .filter(
              (p) =>
                p.payPeriodStart &&
                this.isCurrentMonth(new Date(p.payPeriodStart))
            )
            .reduce((sum, p) => sum + (p.netSalary || 0), 0);
        }
        this.loading = false;
      },
      error: (err) => {
        console.error('Error fetching employees:', err);
        this.loading = false;
      },
    });
  }

  private isCurrentMonth(date: Date): boolean {
    const now = new Date();
    return (
      date.getMonth() === now.getMonth() &&
      date.getFullYear() === now.getFullYear()
    );
  }

  formatCurrency(amount: number): string {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  }

  getGreeting(): string {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  }

  getStatusSeverity(isActive: boolean): string {
    return isActive ? 'success' : 'danger';
  }

  getStatusLabel(isActive: boolean): string {
    return isActive ? 'Active' : 'Inactive';
  }
}
