import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class PayrollService {
  private apiUrl = '/api/payroll'; // to be replaced with actual backend API when ready

  constructor(private http: HttpClient) {}

  /**
   * Get payroll statistics
   * For now → return dummy data
   * Later → replace with real API call
   */
  getPayrollStats(): Observable<{
    totalPayrolls: number;
    monthlyPayroll: number;
  }> {
    // ✅ Dummy data for now
    const dummyStats = {
      totalPayrolls: 125,
      monthlyPayroll: 48000,
    };

    // TODO: Replace the line below with the API call when backend is ready
    // return this.http.get<{ totalPayrolls: number; monthlyPayroll: number }>(`${this.apiUrl}/stats`);
    return of(dummyStats);
  }
}
