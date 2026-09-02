import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateEmployeesTable1788322167575 implements MigrationInterface {
  name = 'CreateEmployeesTable1788322167575';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Needed for gen_random_uuid() (PK default) and trigram search on name.
    await queryRunner.query(`CREATE EXTENSION IF NOT EXISTS pgcrypto`);
    await queryRunner.query(`CREATE EXTENSION IF NOT EXISTS pg_trgm`);

    await queryRunner.query(`
      CREATE TYPE "employee_status_enum" AS ENUM ('Active', 'Inactive')
    `);

    await queryRunner.query(`
      CREATE TABLE "employees" (
        "id" uuid NOT NULL DEFAULT gen_random_uuid(),
        "name" varchar(255) NOT NULL,
        "email" varchar(255) NOT NULL,
        "department" varchar(100) NOT NULL,
        "designation" varchar(100) NOT NULL,
        "salary" numeric(12,2) NOT NULL,
        "joining_date" date NOT NULL,
        "status" "employee_status_enum" NOT NULL DEFAULT 'Active',
        "created_at" timestamptz NOT NULL DEFAULT now(),
        "updated_at" timestamptz NOT NULL DEFAULT now(),
        CONSTRAINT "PK_employees_id" PRIMARY KEY ("id"),
        CONSTRAINT "UQ_employees_email" UNIQUE ("email"),
        CONSTRAINT "CHK_employees_salary_positive" CHECK ("salary" > 0)
      )
    `);

    // Unique index on email is created implicitly by the UNIQUE constraint above;
    // it also serves fast exact-match lookups on GET /employees?search=.

    // Substring/partial search on name (ILIKE '%term%') without a full table scan at 10k+ rows.
    await queryRunner.query(`
      CREATE INDEX "idx_employees_name_trgm" ON "employees" USING gin ("name" gin_trgm_ops)
    `);

    // Combined "filter by department + status" query, and department-only filters
    // (leading column of a composite btree can serve a prefix match on its own).
    await queryRunner.query(`
      CREATE INDEX "idx_employees_dept_status" ON "employees" ("department", "status")
    `);

    // Matches the deterministic pagination order (ORDER BY joining_date DESC, id ASC)
    // exactly, including per-column sort direction, so Postgres can walk the index
    // instead of sorting every page at 10k+ rows.
    await queryRunner.query(`
      CREATE INDEX "idx_employees_pagination" ON "employees" ("joining_date" DESC, "id" ASC)
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP INDEX IF EXISTS "idx_employees_pagination"`);
    await queryRunner.query(`DROP INDEX IF EXISTS "idx_employees_dept_status"`);
    await queryRunner.query(`DROP INDEX IF EXISTS "idx_employees_name_trgm"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "employees"`);
    await queryRunner.query(`DROP TYPE IF EXISTS "employee_status_enum"`);
    // Extensions are left in place — dropping them could affect other objects/databases.
  }
}
