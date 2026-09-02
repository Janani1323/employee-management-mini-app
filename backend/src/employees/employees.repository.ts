import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Employee } from './entities/employee.entity';
import { QueryEmployeesDto } from './dto/query-employees.dto';
import { EmployeeSummary } from './dto/employee-response.dto';

export interface PagedEmployees {
  items: Employee[];
  total: number;
}

@Injectable()
export class EmployeesRepository {
  constructor(
    @InjectRepository(Employee)
    private readonly repo: Repository<Employee>,
  ) {}

  async findPaged(query: QueryEmployeesDto): Promise<PagedEmployees> {
    const { page, pageSize, search, department, status } = query;

    const qb = this.repo.createQueryBuilder('employee');

    if (search) {
      qb.andWhere('(employee.name ILIKE :search OR employee.email ILIKE :search)', {
        search: `%${search}%`,
      });
    }
    if (department) {
      qb.andWhere('employee.department = :department', { department });
    }
    if (status) {
      qb.andWhere('employee.status = :status', { status });
    }

    // Deterministic order matching idx_employees_pagination exactly.
    qb.orderBy('employee.joiningDate', 'DESC').addOrderBy('employee.id', 'ASC');
    qb.skip((page - 1) * pageSize).take(pageSize);

    const [items, total] = await qb.getManyAndCount();
    return { items, total };
  }

  findById(id: string): Promise<Employee | null> {
    return this.repo.findOne({ where: { id } });
  }

  findByEmail(email: string): Promise<Employee | null> {
    return this.repo.findOne({ where: { email } });
  }

  /**
   * A small, bounded sample for the fundamentals demo endpoint — never the
   * full table. Ordered by id for a stable, arbitrary-but-repeatable sample.
   */
  findSample(limit: number): Promise<Employee[]> {
    return this.repo.find({ order: { id: 'ASC' }, take: limit });
  }

  create(data: Partial<Employee>): Promise<Employee> {
    const employee = this.repo.create(data);
    return this.repo.save(employee);
  }

  async update(employee: Employee, data: Partial<Employee>): Promise<Employee> {
    Object.assign(employee, data);
    return this.repo.save(employee);
  }

  async delete(id: string): Promise<void> {
    await this.repo.delete(id);
  }

  /**
   * Single SQL aggregation query — never loads the full employees table into Node.
   */
  async getSummary(): Promise<EmployeeSummary> {
    const totals = await this.repo
      .createQueryBuilder('employee')
      .select('COUNT(*)', 'totalEmployees')
      .addSelect(`COUNT(*) FILTER (WHERE employee.status = 'Active')`, 'activeEmployees')
      .addSelect('COALESCE(SUM(employee.salary), 0)', 'totalSalary')
      .addSelect('COALESCE(AVG(employee.salary), 0)', 'averageSalary')
      .addSelect('COALESCE(MAX(employee.salary), 0)', 'highestSalary')
      .getRawOne<{
        totalEmployees: string;
        activeEmployees: string;
        totalSalary: string;
        averageSalary: string;
        highestSalary: string;
      }>();

    const departmentRows = await this.repo
      .createQueryBuilder('employee')
      .select('employee.department', 'department')
      .addSelect('COUNT(*)', 'count')
      .groupBy('employee.department')
      .getRawMany<{ department: string; count: string }>();

    const departmentCounts: Record<string, number> = {};
    for (const row of departmentRows) {
      departmentCounts[row.department] = parseInt(row.count, 10);
    }

    return {
      totalEmployees: parseInt(totals?.totalEmployees ?? '0', 10),
      activeEmployees: parseInt(totals?.activeEmployees ?? '0', 10),
      totalSalary: parseFloat(totals?.totalSalary ?? '0'),
      averageSalary: parseFloat(totals?.averageSalary ?? '0'),
      highestSalary: parseFloat(totals?.highestSalary ?? '0'),
      departmentCounts,
    };
  }
}
