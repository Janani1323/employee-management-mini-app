import { FundamentalsEmployee } from './types';

export type SalaryCategory = 'High' | 'Medium' | 'Low';

export interface CategorizedEmployee {
  id: string;
  salary: number;
  category: SalaryCategory;
}

const HIGH_THRESHOLD = 30_000;
const MEDIUM_THRESHOLD = 20_000;

/**
 * Iterates the employee array with a plain for loop and if/else — High > 30,000;
 * Medium 20,000-30,000 inclusive; Low < 20,000 — per the assessment's explicit
 * requirement to demonstrate this pattern rather than map/filter/reduce.
 */
export function categorizeSalary(
  employees: FundamentalsEmployee[],
): CategorizedEmployee[] {
  const result: CategorizedEmployee[] = [];

  for (let i = 0; i < employees.length; i++) {
    const employee = employees[i];
    let category: SalaryCategory;

    if (employee.salary > HIGH_THRESHOLD) {
      category = 'High';
    } else if (employee.salary >= MEDIUM_THRESHOLD) {
      category = 'Medium';
    } else {
      category = 'Low';
    }

    result.push({ id: employee.id, salary: employee.salary, category });
  }

  return result;
}
