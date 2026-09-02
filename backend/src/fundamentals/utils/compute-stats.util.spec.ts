import { computeStats } from './compute-stats.util';
import { EmployeeStatus } from '../../employees/enums/employee-status.enum';
import { FundamentalsEmployee } from './types';

const employees: FundamentalsEmployee[] = [
  { id: '1', salary: 50_000, status: EmployeeStatus.ACTIVE, department: 'Engineering' },
  { id: '2', salary: 30_000, status: EmployeeStatus.INACTIVE, department: 'Sales' },
  { id: '3', salary: 70_000, status: EmployeeStatus.ACTIVE, department: 'Engineering' },
];

describe('computeStats', () => {
  it('computes totals, active count, sum, average, and highest salary', () => {
    const result = computeStats(employees);
    expect(result.totalEmployees).toBe(3);
    expect(result.activeEmployees).toBe(2);
    expect(result.totalSalary).toBe(150_000);
    expect(result.averageSalary).toBeCloseTo(50_000);
    expect(result.highestSalary).toBe(70_000);
  });

  it('computes department-wise counts', () => {
    const result = computeStats(employees);
    expect(result.departmentCounts).toEqual({ Engineering: 2, Sales: 1 });
  });

  it('handles an empty array without dividing by zero', () => {
    const result = computeStats([]);
    expect(result).toEqual({
      totalEmployees: 0,
      activeEmployees: 0,
      totalSalary: 0,
      averageSalary: 0,
      highestSalary: 0,
      departmentCounts: {},
    });
  });
});
