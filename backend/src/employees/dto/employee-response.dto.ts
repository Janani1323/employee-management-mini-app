import { Employee } from '../entities/employee.entity';
import { EmployeeStatus } from '../enums/employee-status.enum';

export interface EmployeeResponse {
  id: string;
  name: string;
  email: string;
  department: string;
  designation: string;
  salary: number;
  joiningDate: string;
  status: EmployeeStatus;
  createdAt: Date;
  updatedAt: Date;
}

export function toEmployeeResponse(employee: Employee): EmployeeResponse {
  return {
    id: employee.id,
    name: employee.name,
    email: employee.email,
    department: employee.department,
    designation: employee.designation,
    // TypeORM returns `numeric` columns as strings to avoid float precision loss on the
    // way in/out of Postgres; convert to a number here at the API boundary.
    salary: parseFloat(employee.salary),
    joiningDate: employee.joiningDate,
    status: employee.status,
    createdAt: employee.createdAt,
    updatedAt: employee.updatedAt,
  };
}

export interface PagedResult<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export interface EmployeeSummary {
  totalEmployees: number;
  activeEmployees: number;
  totalSalary: number;
  averageSalary: number;
  highestSalary: number;
  departmentCounts: Record<string, number>;
}
