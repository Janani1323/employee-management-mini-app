import { categorizeSalary } from './categorize-salary.util';
import { EmployeeStatus } from '../../employees/enums/employee-status.enum';
import { FundamentalsEmployee } from './types';

function employee(id: string, salary: number): FundamentalsEmployee {
  return { id, salary, status: EmployeeStatus.ACTIVE, department: 'Engineering' };
}

describe('categorizeSalary', () => {
  it('categorizes salaries above 30,000 as High', () => {
    const result = categorizeSalary([employee('1', 30_001), employee('2', 100_000)]);
    expect(result.map((r) => r.category)).toEqual(['High', 'High']);
  });

  it('categorizes salaries from 20,000 to 30,000 inclusive as Medium', () => {
    const result = categorizeSalary([employee('1', 20_000), employee('2', 30_000)]);
    expect(result.map((r) => r.category)).toEqual(['Medium', 'Medium']);
  });

  it('categorizes salaries below 20,000 as Low', () => {
    const result = categorizeSalary([employee('1', 19_999.99), employee('2', 0.01)]);
    expect(result.map((r) => r.category)).toEqual(['Low', 'Low']);
  });

  it('preserves id and salary alongside the category', () => {
    const result = categorizeSalary([employee('abc', 25_000)]);
    expect(result).toEqual([{ id: 'abc', salary: 25_000, category: 'Medium' }]);
  });

  it('returns an empty array for an empty input', () => {
    expect(categorizeSalary([])).toEqual([]);
  });
});
