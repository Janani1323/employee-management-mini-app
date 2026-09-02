import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { CreateEmployeeRequest, Employee, UpdateEmployeeRequest } from '../models/employee.model';
import { EmployeeQuery } from '../models/employee-query.model';
import { EmployeeSummary } from '../models/employee-summary.model';
import { PagedResult } from '../models/paged-result.model';

@Injectable({ providedIn: 'root' })
export class EmployeeService {
  private readonly baseUrl = `${environment.apiBaseUrl}/employees`;

  constructor(private readonly http: HttpClient) {}

  list(query: EmployeeQuery): Observable<PagedResult<Employee>> {
    let params = new HttpParams().set('page', query.page).set('pageSize', query.pageSize);
    if (query.search) {
      params = params.set('search', query.search);
    }
    if (query.department) {
      params = params.set('department', query.department);
    }
    if (query.status) {
      params = params.set('status', query.status);
    }
    return this.http.get<PagedResult<Employee>>(this.baseUrl, { params });
  }

  getOne(id: string): Observable<Employee> {
    return this.http.get<Employee>(`${this.baseUrl}/${id}`);
  }

  create(dto: CreateEmployeeRequest): Observable<Employee> {
    return this.http.post<Employee>(this.baseUrl, dto);
  }

  update(id: string, dto: UpdateEmployeeRequest): Observable<Employee> {
    return this.http.patch<Employee>(`${this.baseUrl}/${id}`, dto);
  }

  delete(id: string): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`);
  }

  getSummary(): Observable<EmployeeSummary> {
    return this.http.get<EmployeeSummary>(`${this.baseUrl}/summary`);
  }
}
