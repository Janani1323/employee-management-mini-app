import { Controller, Get, Query } from '@nestjs/common';
import { FundamentalsService } from './fundamentals.service';
import { FundamentalsQueryDto } from './dto/fundamentals-query.dto';

@Controller('fundamentals')
export class FundamentalsController {
  constructor(private readonly fundamentalsService: FundamentalsService) {}

  @Get('demo')
  getDemo(@Query() query: FundamentalsQueryDto) {
    return this.fundamentalsService.getDemo(query.sampleSize);
  }
}
