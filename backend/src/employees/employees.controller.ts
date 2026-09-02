import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Put,
  Query,
  Req,
} from '@nestjs/common';
import { Request } from 'express';
import { EmployeesService } from './employees.service';
import { CreateEmployeeDto } from './dto/create-employee.dto';
import { UpdateEmployeeDto } from './dto/update-employee.dto';
import { QueryEmployeesDto } from './dto/query-employees.dto';

@Controller('employees')
export class EmployeesController {
  constructor(private readonly employeesService: EmployeesService) {}

  // Declared before ':id' so 'summary' is never parsed as a UUID path param.
  @Get('summary')
  getSummary() {
    return this.employeesService.getSummary();
  }

  @Get()
  findAll(@Query() query: QueryEmployeesDto) {
    return this.employeesService.findAll(query);
  }

  @Get(':id')
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.employeesService.findOne(id);
  }

  // ?simulateFailure=true is a dev-only affordance for the error-handling challenge
  // (see README) — EmployeesService only honors it outside production.
  @Post()
  create(
    @Body() dto: CreateEmployeeDto,
    @Req() req: Request & { correlationId?: string },
    @Query('simulateFailure') simulateFailure?: string,
  ) {
    return this.employeesService.create(dto, {
      correlationId: req.correlationId,
      forceSimulateFailure: simulateFailure === 'true',
    });
  }

  // PATCH is primary (partial updates from an edit form); PUT is aliased to the
  // same handler for spec-literal compliance since both fully replace-or-merge here.
  @Patch(':id')
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateEmployeeDto,
  ) {
    return this.employeesService.update(id, dto);
  }

  @Put(':id')
  replace(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateEmployeeDto,
  ) {
    return this.employeesService.update(id, dto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(@Param('id', ParseUUIDPipe) id: string): Promise<void> {
    await this.employeesService.remove(id);
  }
}
