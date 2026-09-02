# Database

Schema and seed data live inside the backend (they need TypeORM's CLI/data-source context to run):

- Migration: [`backend/src/database/migrations/`](../backend/src/database/migrations/)
- Seed script: [`backend/src/database/seed/seed-employees.ts`](../backend/src/database/seed/seed-employees.ts)

Run from `backend/`:
```
npm run migration:run
npm run seed
```

## Schema (summary)

Single table `employees`:

| Column | Type | Notes |
|---|---|---|
| id | uuid, PK | `gen_random_uuid()` |
| name | varchar(255), NOT NULL | |
| email | varchar(255), NOT NULL, UNIQUE | |
| department | varchar(100), NOT NULL | |
| designation | varchar(100), NOT NULL | |
| salary | numeric(12,2), NOT NULL | `CHECK (salary > 0)` |
| joining_date | date, NOT NULL | |
| status | enum('Active','Inactive'), NOT NULL | default `'Active'` |
| created_at / updated_at | timestamptz, NOT NULL | default `now()` |

Indexes (see migration file for the authoritative DDL and inline comments):
1. Unique index on `email` — uniqueness + fast exact-match lookup.
2. GIN trigram index on `name` (`pg_trgm`) — fast `ILIKE '%term%'` search at 10k+ rows.
3. Composite btree on `(department, status)` — supports the combined filter and department-only filter.
4. Composite btree on `(joining_date DESC, id ASC)` — supports the deterministic pagination order without a full sort per page.

_This file is a pointer/summary — filled in fully once the migration (Phase 2) lands._
