export interface EmployeeSummary {
  totalEmployees: number;
  activeEmployees: number;
  totalSalary: number;
  averageSalary: number;
  highestSalary: number;
  departmentCounts: Record<string, number>;
}
