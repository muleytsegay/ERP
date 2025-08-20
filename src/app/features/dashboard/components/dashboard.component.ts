import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { EmployeeService } from '../../employee/services/employee.service';
import { PayrollService } from '../../payroll/services/payroll.service';
import { User } from '../../auth/profile/models/user.model';
import { Employee } from '../../employee/models/employee.model';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule],
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
    totalDepartments: 0
  };

  recentEmployees: Employee[] = [];
  departmentStats: { name: string; count: number }[] = [];
  
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
      next: (response) => {
        console.log('Dashboard received employees:', response);
        
        // Handle API response format - extract employees array from data property
        const employees = (response as any)?.data || response;
        console.log('Employees length:', employees?.length);
        
        if (!Array.isArray(employees)) {
          console.error('Employees data is not an array:', employees);
          return;
        }
        
        this.stats.totalEmployees = employees.length;
        // Since the backend doesn't have isActive field yet, assume all employees are active
        this.stats.activeEmployees = employees.filter(emp => emp.isActive !== false).length;
        this.stats.inactiveEmployees = employees.filter(emp => emp.isActive === false).length;
        
        console.log('Updated stats:', this.stats);
        
        // Calculate new hires this month
        const currentMonth = new Date().getMonth();
        const currentYear = new Date().getFullYear();
        this.stats.newHiresThisMonth = employees.filter(emp => {
          if (emp.hireDate) {
            const hireDate = new Date(emp.hireDate);
            return hireDate.getMonth() === currentMonth && hireDate.getFullYear() === currentYear;
          }
          return false;
        }).length;

        // Calculate average salary
        const activeSalaries = employees
          .filter(emp => emp.isActive && emp.salary)
          .map(emp => emp.salary || 0);
        this.stats.averageSalary = activeSalaries.length > 0 
          ? activeSalaries.reduce((sum, salary) => sum + salary, 0) / activeSalaries.length
          : 0;

        // Get recent employees (last 5 hired)
        this.recentEmployees = employees
          .filter(emp => emp.hireDate)
          .sort((a, b) => new Date(b.hireDate!).getTime() - new Date(a.hireDate!).getTime())
          .slice(0, 5);

        // Calculate department statistics
        const departmentCounts = employees.reduce((acc, emp) => {
          if (emp.department) {
            acc[emp.department] = (acc[emp.department] || 0) + 1;
          }
          return acc;
        }, {} as Record<string, number>);

        this.departmentStats = Object.entries(departmentCounts)
          .map(([name, count]) => ({ name, count: count as number }))
          .sort((a, b) => b.count - a.count);

        this.stats.totalDepartments = this.departmentStats.length;
      },
      error: (error) => {
        console.error('Failed to load employee stats', error);
        this.loading = false;
      }
    });

    // Load payroll stats (optional - might not be available yet)
    this.payrollService.getPayrolls().subscribe({
      next: (response) => {
        const payrolls = (response as any)?.data || response || [];
        this.stats.totalPayrolls = payrolls.length;
        if (Array.isArray(payrolls)) {
          this.stats.monthlyPayroll = payrolls
            .filter(p => p.payPeriodStart && this.isCurrentMonth(new Date(p.payPeriodStart)))
            .reduce((sum, p) => sum + (p.netSalary || 0), 0);
        }
        this.loading = false;
      },
      error: (error) => {
        console.warn('Payroll stats not available:', error.message);
        // Set default values for payroll stats
        this.stats.totalPayrolls = 0;
        this.stats.monthlyPayroll = 0;
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
