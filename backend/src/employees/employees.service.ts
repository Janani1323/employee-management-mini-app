import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { QueryFailedError } from 'typeorm';
import { EmployeesRepository } from './employees.repository';
import { Employee } from './entities/employee.entity';
import { CreateEmployeeDto } from './dto/create-employee.dto';
import { UpdateEmployeeDto } from './dto/update-employee.dto';
import { QueryEmployeesDto } from './dto/query-employees.dto';
import { EmployeeResponse, EmployeeSummary, PagedResult, toEmployeeResponse } from './dto/employee-response.dto';

const POSTGRES_UNIQUE_VIOLATION = '23505';

@Injectable()
export class EmployeesService {
  constructor(private readonly employeesRepository: EmployeesRepository) {}

  async findAll(query: QueryEmployeesDto): Promise<PagedResult<EmployeeResponse>> {
    const { items, total } = await this.employeesRepository.findPaged(query);
    return {
      items: items.map(toEmployeeResponse),
      total,
      page: query.page,
      pageSize: query.pageSize,
      totalPages: Math.ceil(total / query.pageSize) || 0,
    };
  }

  async findOne(id: string): Promise<EmployeeResponse> {
    const employee = await this.employeesRepository.findById(id);
    if (!employee) {
      throw new NotFoundException('Employee not found');
    }
    return toEmployeeResponse(employee);
  }

  async create(dto: CreateEmployeeDto): Promise<EmployeeResponse> {
    try {
      const employee = await this.employeesRepository.create(this.toEntityData(dto));
      return toEmployeeResponse(employee);
    } catch (error) {
      throw this.mapWriteError(error);
    }
  }

  async update(id: string, dto: UpdateEmployeeDto): Promise<EmployeeResponse> {
    const employee = await this.employeesRepository.findById(id);
    if (!employee) {
      throw new NotFoundException('Employee not found');
    }
    try {
      const updated = await this.employeesRepository.update(employee, this.toEntityData(dto));
      return toEmployeeResponse(updated);
    } catch (error) {
      throw this.mapWriteError(error);
    }
  }

  async remove(id: string): Promise<void> {
    const employee = await this.employeesRepository.findById(id);
    if (!employee) {
      throw new NotFoundException('Employee not found');
    }
    await this.employeesRepository.delete(id);
  }

  getSummary(): Promise<EmployeeSummary> {
    return this.employeesRepository.getSummary();
  }

  // TypeORM's `numeric` columns are typed as `string` (to avoid float precision loss),
  // while the DTO/API boundary uses `number`; convert only when a salary is present.
  private toEntityData(dto: CreateEmployeeDto | UpdateEmployeeDto): Partial<Employee> {
    const { salary, ...rest } = dto;
    return {
      ...rest,
      ...(salary !== undefined ? { salary: salary.toFixed(2) } : {}),
    };
  }

  private mapWriteError(error: unknown): Error {
    if (
      error instanceof QueryFailedError &&
      (error as unknown as { code?: string }).code === POSTGRES_UNIQUE_VIOLATION
    ) {
      return new ConflictException('An employee with this email already exists');
    }
    return error as Error;
  }
}
