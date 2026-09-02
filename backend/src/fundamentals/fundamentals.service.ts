import { Injectable } from '@nestjs/common';
import { EmployeesRepository } from '../employees/employees.repository';
import { categorizeSalary } from './utils/categorize-salary.util';
import { computeStats } from './utils/compute-stats.util';
import { dedupeIdsFilter, dedupeIdsSet } from './utils/dedupe-ids.util';
import { FundamentalsEmployee } from './utils/types';

export interface FundamentalsDemoResult {
  sampleSize: number;
  categorized: ReturnType<typeof categorizeSalary>;
  stats: ReturnType<typeof computeStats>;
  dedupeDemo: {
    input: string[];
    viaSet: string[];
    viaFilter: string[];
  };
}

@Injectable()
export class FundamentalsService {
  constructor(private readonly employeesRepository: EmployeesRepository) {}

  async getDemo(sampleSize: number): Promise<FundamentalsDemoResult> {
    const sample = await this.employeesRepository.findSample(sampleSize);
    const asFundamentalsEmployees: FundamentalsEmployee[] = sample.map((e) => ({
      id: e.id,
      salary: parseFloat(e.salary),
      status: e.status,
      department: e.department,
    }));

    // Build a small id list with intentional duplicates (first 5 ids, each
    // appearing twice) purely to give the dedupe demo something to remove.
    const idsWithDuplicates = sample.slice(0, 5).flatMap((e) => [e.id, e.id]);

    return {
      sampleSize: asFundamentalsEmployees.length,
      categorized: categorizeSalary(asFundamentalsEmployees),
      stats: computeStats(asFundamentalsEmployees),
      dedupeDemo: {
        input: idsWithDuplicates,
        viaSet: dedupeIdsSet(idsWithDuplicates),
        viaFilter: dedupeIdsFilter(idsWithDuplicates),
      },
    };
  }
}
