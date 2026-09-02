import { Module } from '@nestjs/common';
import { EmployeesModule } from '../employees/employees.module';
import { FundamentalsController } from './fundamentals.controller';
import { FundamentalsService } from './fundamentals.service';

@Module({
  imports: [EmployeesModule],
  controllers: [FundamentalsController],
  providers: [FundamentalsService],
})
export class FundamentalsModule {}
