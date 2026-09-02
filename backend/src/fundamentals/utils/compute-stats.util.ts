import { EmployeeStatus } from '../../employees/enums/employee-status.enum';
import { FundamentalsEmployee } from './types';

export interface EmployeeStats {
  totalEmployees: number;
  activeEmployees: number;
  totalSalary: number;
  averageSalary: number;
  highestSalary: number;
  departmentCounts: Record<string, number>;
}

/**
 * Demo/in-memory version of the same aggregation /employees/summary computes in
 * SQL. Deliberately implemented with a single plain for loop + if/else (not
 * map/filter/reduce) over the given array — see README "Programming
 * Fundamentals" for why this is fine here (a small, already-fetched sample)
 * but would be wrong for the real summary endpoint at 10,000+ rows.
 */
export function computeStats(employees: FundamentalsEmployee[]): EmployeeStats {
  let activeEmployees = 0;
  let totalSalary = 0;
  let highestSalary = 0;
  const departmentCounts: Record<string, number> = {};

  for (let i = 0; i < employees.length; i++) {
    const employee = employees[i];

    if (employee.status === EmployeeStatus.ACTIVE) {
      activeEmployees++;
    }

    totalSalary += employee.salary;

    if (employee.salary > highestSalary) {
      highestSalary = employee.salary;
    }

    if (departmentCounts[employee.department] === undefined) {
      departmentCounts[employee.department] = 1;
    } else {
      departmentCounts[employee.department]++;
    }
  }

  const totalEmployees = employees.length;
  return {
    totalEmployees,
    activeEmployees,
    totalSalary,
    averageSalary: totalEmployees > 0 ? totalSalary / totalEmployees : 0,
    highestSalary,
    departmentCounts,
  };
}
