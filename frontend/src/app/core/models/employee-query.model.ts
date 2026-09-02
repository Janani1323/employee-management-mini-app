import { EmployeeStatus } from './employee.model';

export interface EmployeeQuery {
  page: number;
  pageSize: number;
  search?: string;
  department?: string;
  status?: EmployeeStatus;
}
