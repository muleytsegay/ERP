import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Department, Position } from '../models/employee.model';

@Injectable({
  providedIn: 'root'
})
export class DepartmentService {
  private apiUrl = 'http://localhost:3000/api';

  constructor(private http: HttpClient) {}

  // Department CRUD operations
  getDepartments(): Observable<Department[]> {
    return this.http.get<Department[]>(`${this.apiUrl}/departments`);
  }

  getDepartment(id: string): Observable<Department> {
    return this.http.get<Department>(`${this.apiUrl}/departments/${id}`);
  }

  createDepartment(department: Omit<Department, 'id'>): Observable<Department> {
    return this.http.post<Department>(`${this.apiUrl}/departments`, department);
  }

  updateDepartment(id: string, department: Partial<Department>): Observable<Department> {
    return this.http.put<Department>(`${this.apiUrl}/departments/${id}`, department);
  }

  deleteDepartment(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/departments/${id}`);
  }

  // Position CRUD operations
  getPositions(): Observable<Position[]> {
    return this.http.get<Position[]>(`${this.apiUrl}/positions`);
  }

  getPositionsByDepartment(departmentId: string): Observable<Position[]> {
    return this.http.get<Position[]>(`${this.apiUrl}/positions/department/${departmentId}`);
  }

  getPosition(id: string): Observable<Position> {
    return this.http.get<Position>(`${this.apiUrl}/positions/${id}`);
  }

  createPosition(position: Omit<Position, 'id'>): Observable<Position> {
    return this.http.post<Position>(`${this.apiUrl}/positions`, position);
  }

  updatePosition(id: string, position: Partial<Position>): Observable<Position> {
    return this.http.put<Position>(`${this.apiUrl}/positions/${id}`, position);
  }

  deletePosition(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/positions/${id}`);
  }

  // Department statistics
  getDepartmentStatistics(departmentId: string): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/departments/${departmentId}/statistics`);
  }

  getDepartmentEmployees(departmentId: string): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/departments/${departmentId}/employees`);
  }
}
