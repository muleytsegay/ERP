import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../../core/services/auth.service';
import { EmployeeService } from '../../employee/services/employee.service';
import { DepartmentService } from '../../department/services/department.service';
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
import { EmployeePayroll } from '../../payroll/models/payroll.model';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    CommonModule,
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
  departmentChartData: any;
  employeeStatusChartData: any;
  chartOptions: any;
  loading = false;

  constructor(
    private authService: AuthService,
    private employeeService: EmployeeService,
    private departmentService: DepartmentService,
    private payrollService: PayrollService
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
    this.authService.currentUser$.subscribe(
      (user) => (this.currentUser = user)
    );
  }

  loadDashboardStats(): void {
    this.loading = true;

    this.employeeService.getEmployees().subscribe({
      next: (response) => {
        const employees = (response as any)?.data || response;
        if (!Array.isArray(employees)) {
          console.error('Employees data is invalid:', employees);
          this.loading = false;
          return;
        }

        this.stats.totalEmployees = employees.length;
        this.stats.activeEmployees = employees.filter(
          (emp) => emp.isActive !== false
        ).length;
        this.stats.inactiveEmployees = employees.filter(
          (emp) => emp.isActive === false
        ).length;

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

        const activeSalaries = employees
          .filter((emp) => emp.isActive && emp.salary)
          .map((emp) => emp.salary || 0);
        this.stats.averageSalary =
          activeSalaries.length > 0
            ? activeSalaries.reduce((sum, salary) => sum + salary, 0) /
              activeSalaries.length
            : 0;

        this.recentEmployees = employees
          .filter((emp) => emp.hireDate)
          .sort(
            (a, b) =>
              new Date(b.hireDate!).getTime() - new Date(a.hireDate!).getTime()
          )
          .slice(0, 5);

        console.log('Dashboard: Processing employees for department stats:', employees);
        console.log('Dashboard: Sample employee structure:', employees[0]);

        const departmentCounts = employees.reduce(
          (acc: Record<string, number>, emp) => {
            console.log('Dashboard: Processing employee department:', emp.department, 'for employee:', emp.firstName, emp.lastName);
            
            // Handle different department field structures
            let departmentName = '';
            
            if (typeof emp.department === 'string' && emp.department.trim()) {
              departmentName = emp.department.trim();
            } else if (emp.department && typeof emp.department === 'object' && emp.department.name) {
              departmentName = emp.department.name.trim();
            } else if (emp.departmentName && emp.departmentName.trim()) {
              departmentName = emp.departmentName.trim();
            }
            
            if (departmentName) {
              acc[departmentName] = (acc[departmentName] || 0) + 1;
              console.log('Dashboard: Added employee to department:', departmentName, 'New count:', acc[departmentName]);
            } else {
              console.log('Dashboard: Employee has no valid department info:', emp);
            }
            
            return acc;
          },
          {}
        );

        console.log('Dashboard: Final department counts:', departmentCounts);

        this.departmentStats = Object.entries(departmentCounts)
          .map(([name, count]) => ({ name, count: count as number }))
          .sort((a, b) => (b.count as number) - (a.count as number));

        this.stats.totalDepartments = this.departmentStats.length;
        
        console.log('Dashboard: Department stats:', this.departmentStats);
        console.log('Dashboard: Total departments:', this.stats.totalDepartments);

        this.updateChartData();
      },
      error: (error) => {
        console.error('Failed to load employee stats', error);
        this.loading = false;
      },
    });

    // Load departments directly from department service as fallback/verification
    this.departmentService.getDepartments().subscribe({
      next: (departments) => {
        console.log('Dashboard: Departments from department service:', departments);
        
        // If we didn't get department stats from employees, use direct department count
        if (this.stats.totalDepartments === 0 && departments && departments.length > 0) {
          console.log('Dashboard: Using direct department count as fallback');
          this.stats.totalDepartments = departments.length;
          
          // Create basic department stats if we have no employee-based stats
          if (this.departmentStats.length === 0) {
            this.departmentStats = departments.map(dept => ({
              name: dept.name,
              count: 0 // We don't have employee counts per department
            }));
            this.updateChartData();
          }
        }
      },
      error: (error) => {
        console.error('Dashboard: Failed to load departments from department service', error);
      }
    });

    // Payroll stats
    this.payrollService.getAllPayrolls().subscribe({
      next: (response: EmployeePayroll[]) => {
        const payrolls = response || [];
        this.stats.totalPayrolls = payrolls.length;
        this.stats.monthlyPayroll = payrolls
          .filter(
            (p) =>
              p.payPeriodStart &&
              this.isCurrentMonth(new Date(p.payPeriodStart))
          )
          .reduce((sum, p) => sum + (p.netSalary || 0), 0);
        this.loading = false;
      },
      error: () => {
        this.stats.totalPayrolls = 0;
        this.stats.monthlyPayroll = 0;
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

  getStatusSeverity(isActive: boolean): string {
    return isActive ? 'success' : 'danger';
  }

  getStatusLabel(isActive: boolean): string {
    return isActive ? 'Active' : 'Inactive';
  }
}
