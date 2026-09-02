export type EmployeeStatus = 'Active' | 'Inactive';

export interface Employee {
  id: string;
  name: string;
  email: string;
  department: string;
  designation: string;
  salary: number;
  joiningDate: string;
  status: EmployeeStatus;
  createdAt: string;
  updatedAt: string;
}

export interface CreateEmployeeRequest {
  name: string;
  email: string;
  department: string;
  designation: string;
  salary: number;
  joiningDate: string;
  status?: EmployeeStatus;
}

export type UpdateEmployeeRequest = Partial<CreateEmployeeRequest>;
