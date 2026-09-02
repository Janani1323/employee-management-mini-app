import { EmployeeStatus } from '../../employees/enums/employee-status.enum';

// A minimal, plain-object shape so these utilities take arrays of data, not
// TypeORM entities — trivial to unit test and reusable outside this app.
export interface FundamentalsEmployee {
  id: string;
  salary: number;
  status: EmployeeStatus;
  department: string;
}
