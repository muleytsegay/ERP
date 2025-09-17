import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { tap, catchError } from 'rxjs/operators';
import { BankAccount, CreateBankAccountRequest } from '../models/bank-account.model';

@Injectable({
  providedIn: 'root'
})
export class BankAccountService {
  private apiUrl = 'https://gateway-microservice.onrender.com/payroll/api/v1';

  constructor(private http: HttpClient) {}

  createBankAccount(request: CreateBankAccountRequest): Observable<BankAccount> {
    console.log('BankAccountService: Creating bank account:', request);
    console.log('BankAccountService: POST request to:', `${this.apiUrl}/bank-accounts`);
    
    return this.http.post<BankAccount>(`${this.apiUrl}/bank-accounts`, request).pipe(
      tap(response => {
        console.log('BankAccountService: Bank account created successfully:', response);
      }),
      catchError((error: HttpErrorResponse) => {
        console.error('BankAccountService: Failed to create bank account:', {
          status: error.status,
          statusText: error.statusText,
          message: error.message,
          error: error.error,
          url: error.url,
          requestData: request
        });
        return throwError(() => error);
      })
    );
  }

  getBankAccountsByEmployee(employeeId: string): Observable<BankAccount[]> {
    console.log('BankAccountService: Getting bank accounts for employee:', employeeId);
    console.log('BankAccountService: GET request to:', `${this.apiUrl}/bank-accounts/employee/${employeeId}`);
    
    return this.http.get<BankAccount[]>(`${this.apiUrl}/bank-accounts/employee/${employeeId}`).pipe(
      tap(response => {
        console.log('BankAccountService: Bank accounts retrieved successfully:', response);
      }),
      catchError((error: HttpErrorResponse) => {
        console.error('BankAccountService: Failed to get bank accounts:', {
          status: error.status,
          statusText: error.statusText,
          message: error.message,
          error: error.error,
          url: error.url,
          employeeId
        });
        return throwError(() => error);
      })
    );
  }

  updateBankAccount(id: string, bankAccount: Partial<BankAccount>): Observable<BankAccount> {
    console.log('BankAccountService: Updating bank account:', id, 'with data:', bankAccount);
    console.log('BankAccountService: PUT request to:', `${this.apiUrl}/bank-accounts/${id}`);
    
    return this.http.put<BankAccount>(`${this.apiUrl}/bank-accounts/${id}`, bankAccount).pipe(
      tap(response => {
        console.log('BankAccountService: Bank account updated successfully:', response);
      }),
      catchError((error: HttpErrorResponse) => {
        console.error('BankAccountService: Failed to update bank account:', {
          status: error.status,
          statusText: error.statusText,
          message: error.message,
          error: error.error,
          url: error.url,
          bankAccountId: id,
          updateData: bankAccount
        });
        return throwError(() => error);
      })
    );
  }

  deleteBankAccount(id: string): Observable<void> {
    console.log('BankAccountService: Deleting bank account:', id);
    console.log('BankAccountService: DELETE request to:', `${this.apiUrl}/bank-accounts/${id}`);
    
    return this.http.delete<void>(`${this.apiUrl}/bank-accounts/${id}`).pipe(
      tap(() => {
        console.log('BankAccountService: Bank account deleted successfully:', id);
      }),
      catchError((error: HttpErrorResponse) => {
        console.error('BankAccountService: Failed to delete bank account:', {
          status: error.status,
          statusText: error.statusText,
          message: error.message,
          error: error.error,
          url: error.url,
          bankAccountId: id
        });
        return throwError(() => error);
      })
    );
  }
}
