import 'dotenv/config';
import { faker } from '@faker-js/faker';
import dataSource from '../data-source';
import { Employee } from '../../employees/entities/employee.entity';
import { EmployeeStatus } from '../../employees/enums/employee-status.enum';

const TOTAL_EMPLOYEES = 10_500;
const BATCH_SIZE = 1_000;

const DEPARTMENTS = [
  'Engineering',
  'Sales',
  'Marketing',
  'Human Resources',
  'Finance',
  'Operations',
  'Customer Support',
  'Legal',
];

const DESIGNATIONS = [
  'Associate',
  'Senior Associate',
  'Team Lead',
  'Manager',
  'Senior Manager',
  'Director',
  'Vice President',
];

function randomEmployee(index: number) {
  const firstName = faker.person.firstName();
  const lastName = faker.person.lastName();
  // Append the row index to guarantee email uniqueness across 10,000+ generated rows.
  const email = faker.internet
    .email({ firstName, lastName, provider: 'example.com' })
    .toLowerCase()
    .replace('@', `.${index}@`);

  return {
    name: `${firstName} ${lastName}`,
    email,
    department: faker.helpers.arrayElement(DEPARTMENTS),
    designation: faker.helpers.arrayElement(DESIGNATIONS),
    salary: faker.number.int({ min: 15_000, max: 120_000 }).toFixed(2),
    joiningDate: faker.date
      .between({ from: '2015-01-01', to: '2026-09-01' })
      .toISOString()
      .slice(0, 10),
    status: faker.helpers.arrayElement([
      EmployeeStatus.ACTIVE,
      EmployeeStatus.ACTIVE,
      EmployeeStatus.ACTIVE,
      EmployeeStatus.INACTIVE,
    ]),
  };
}

async function seed() {
  await dataSource.initialize();
  const repo = dataSource.getRepository(Employee);

  const existing = await repo.count();
  if (existing > 0) {
    console.log(
      `employees table already has ${existing} rows — skipping seed to avoid duplicates. ` +
        `Truncate the table first if you want to reseed.`,
    );
    await dataSource.destroy();
    return;
  }

  console.log(
    `Seeding ${TOTAL_EMPLOYEES} employees in batches of ${BATCH_SIZE}...`,
  );

  let inserted = 0;
  for (let start = 0; start < TOTAL_EMPLOYEES; start += BATCH_SIZE) {
    const batchCount = Math.min(BATCH_SIZE, TOTAL_EMPLOYEES - start);
    const batch: Partial<Employee>[] = [];
    for (let i = 0; i < batchCount; i++) {
      batch.push(randomEmployee(start + i));
    }
    await repo
      .createQueryBuilder()
      .insert()
      .into(Employee)
      .values(batch)
      .execute();
    inserted += batchCount;
    console.log(`  inserted ${inserted}/${TOTAL_EMPLOYEES}`);
  }

  const finalCount = await repo.count();
  console.log(`Done. employees table now has ${finalCount} rows.`);

  await dataSource.destroy();
}

seed().catch((err) => {
  console.error('Seed failed:', err);
  process.exit(1);
});
