# Employee Management Mini-App

A production-quality employee management app built for a technical assessment: Angular (standalone components) frontend, NestJS backend, PostgreSQL database. Designed to stay fast at 10,000+ employee records via server-side pagination, search, filtering, and SQL aggregation — never by loading the full dataset into memory or the browser.

**Submission date:** 2026-09-02
**Author:** Janani A

## Tech Stack

- **Frontend:** Angular 20 (standalone components, Reactive Forms, signals)
- **Backend:** NestJS 11 (TypeScript)
- **Database:** PostgreSQL
- **ORM:** TypeORM, with hand-written migrations (not `synchronize`) and QueryBuilder for dynamic filtering + raw SQL aggregation

### Why TypeORM over Prisma

Hand-authored migration files map directly to the requirement for a reproducible migration (not just an ORM sync). TypeORM's QueryBuilder composes optional, combinable filters (search + department + status) more naturally than Prisma's `where` object, and the `/employees/summary` aggregation can drop to raw parameterized SQL without leaving the same connection pool. `@nestjs/typeorm` also gives idiomatic Nest controller → service → repository layering via `@InjectRepository`.

## Postgres Version Tested

PostgreSQL **17.6** (Postgres.app / EDB-installer build on macOS).

## Setup

### Prerequisites
- Node.js 20 LTS or newer (tested on Node 24)
- PostgreSQL running locally, with a database created for the app:
  ```sql
  CREATE DATABASE employee_management;
  ```

### Backend
```bash
cd backend
npm install
cp ../.env.example .env   # then fill in your real local Postgres credentials
npm run migration:run     # creates the employees table, enum, and indexes
npm run seed               # inserts 10,500 sample employees (idempotent-safe — skips if the table isn't empty)
npm run start:dev          # http://localhost:3000
```

### Frontend
In a second terminal:
```bash
cd frontend
npm install
npm start                  # http://localhost:4200 (alias for `ng serve`)
```

### Running backend tests
```bash
cd backend
npm test                   # unit tests for the fundamentals utilities
```

## Environment Variables

See [`.env.example`](.env.example) for the full list (placeholders only — real values go in `backend/.env`, which is gitignored and never committed):

| Variable | Purpose |
|---|---|
| `DB_HOST`, `DB_PORT`, `DB_NAME`, `DB_USER`, `DB_PASSWORD` | PostgreSQL connection |
| `BACKEND_PORT` | Port the NestJS server listens on (default 3000) |
| `NODE_ENV` | `development` / `production` — also gates the `?simulateFailure` dev-only query flag |
| `FRONTEND_ORIGIN` | Allowed CORS origin for the Angular dev server |
| `SIMULATE_CREATE_FAILURES` | `true`/`false` — globally enables the intermittent-failure simulation on `POST /employees` (see below) |

## Database

Full schema, index rationale, and verified `EXPLAIN` output live in [`database/README.md`](database/README.md). Summary: a single `employees` table with a migration (`backend/src/database/migrations/`) that creates the status enum, the table, and four indexes — one per real query pattern (email uniqueness/lookup, trigram name/email search, department+status filter, and the exact `joining_date DESC, id ASC` pagination order).

## Architecture Summary

**Backend** — `backend/src/`:
- `employees/` — controller → service → repository layering. DTOs (`class-validator`) validate every input; the repository wraps TypeORM's QueryBuilder for paged/filtered listing and a single SQL aggregation query for `/employees/summary`.
- `common/` — a global exception filter collapses every error into one shape (`{statusCode, message, errors?, timestamp, path}`), a logging interceptor attaches a correlation id and logs request timing, and a structured logger redacts PII by construction (callers can only pass diagnostic fields, never request bodies).
- `fundamentals/` — the "programming fundamentals" utilities and their demo endpoint, kept isolated from the core CRUD surface.
- `config/` — typed, fail-fast (Joi-validated) environment config shared by the app and the TypeORM CLI.

**Frontend** — `frontend/src/app/`:
- `core/` — typed models (no `any`), a typed `EmployeeService`, an `ErrorMessageService` that turns any `HttpErrorResponse` into a non-technical message, and a functional HTTP interceptor for diagnostic logging.
- `shared/components/` — small reusable presentational pieces (loading spinner, empty state, error banner, confirm dialog).
- `employees/employee-list` — a single `switchMap` pipeline: debounced (300ms) search plus department/status filters all reset to page 1 and reload through one cancellable request; `@for(...; track id)` for stable rows; loading/empty/error states with a retry that preserves current filters.
- `employees/employee-form` — Reactive Forms (required/email/positive-number/date validators) shared between add and edit; a `submitting` signal guards against duplicate submissions and the form is never reset on error.

## Programming Fundamentals

Implemented as real, callable code in `backend/src/fundamentals/`, unit-tested (`npm test`), and exposed via `GET /fundamentals/demo?sampleSize=` (default 50, max 500) over a small, bounded sample of real employees:

- `categorizeSalary` — a **plain `for` loop with `if`/`else`** (not map/filter/reduce, per the assessment's explicit requirement): High > 30,000; Medium 20,000–30,000 inclusive; Low < 20,000.
- `computeStats` — total employees, active employees, total salary, average salary, highest salary, and department-wise counts, also via a single `for` loop.
- `dedupeIdsSet` / `dedupeIdsFilter` — two approaches to removing duplicate employee IDs (Set-based, and filter+indexOf for contrast).

**Client-side vs. database aggregation:** the fundamentals demo above is deliberately only run over a small, already-fetched sample — that's fine because the dataset is bounded and the cost is trivial. `GET /employees/summary`, by contrast, must answer over 10,000+ rows, so it is computed entirely with SQL aggregation (`COUNT`, `SUM`, `AVG`, `MAX`, `FILTER`, `GROUP BY`) in a single query and never loads full rows into Node. The rule of thumb this app follows: aggregate/filter/paginate in the database whenever the row count is unbounded or user-controlled; only compute in-memory over data you've already fetched for a small, known-size purpose.

## Error Handling & Debugging Challenge

The scenario: `POST /employees` sometimes fails intermittently.

- **Simulate it:** set `SIMULATE_CREATE_FAILURES=true` in `backend/.env`, or (outside production only) call `POST /employees?simulateFailure=true`. When active, ~30% of creates deliberately fail with a generic 500 before touching the database.
- **Frontend stays usable:** the form shows a plain-language error ("Something went wrong. Please try again." or, for a duplicate email, "An employee with this email already exists") via `ErrorMessageService` — never a raw error or stack trace — and **never resets the form**, so the user's input is never lost.
- **Duplicate-submission protection:** a `submitting` signal disables the submit button for the duration of the request and short-circuits any re-entrant submit call; cleared via `finalize()` regardless of outcome.
- **Safe backend logging:** every 500-level error is logged server-side with a correlation id, error name/message, and timing — but never the request body, so no name/email/salary ever reaches the logs. The client only ever receives the fixed generic message for any 500-level response, regardless of what the underlying error actually was.

## Assumptions

- No authentication/authorization — explicitly out of scope per the assessment brief.
- The department list shown in the frontend's filter/form dropdowns is a fixed constant matching what the seed script generates (`frontend/src/app/employees/employee-list/employee-list.component.ts`); a larger app would fetch this from the API instead.
- `PATCH /employees/:id` is the primary update route (partial updates fit an edit form naturally); `PUT /employees/:id` is aliased to the same handler for spec-literal compliance.
- Salary is stored as `numeric(12,2)` and treated as a plain JSON `number` at the API boundary (converted from TypeORM's string representation) — adequate for this assessment's scale; a system handling currency at larger scale might use a dedicated money type/library instead.

## Known Limitations

- No automated frontend component tests (Angular's default Karma test for the root `App` component was kept minimal; new components were verified manually in a real browser instead of with `.spec.ts` files, due to time constraints). Backend fundamentals utilities do have unit tests (`npm test` in `backend/`).
- No dedicated UI page/widget for `GET /employees/summary` — the endpoint is implemented, SQL-aggregated, and verified (via `curl` and by inspection), but nothing in the Angular app currently displays it, since it wasn't in the "Core Features" list.
- The intermittent-failure simulation's per-request `?simulateFailure=true` override is disabled outside development/test by checking `NODE_ENV`, but the app performing that check is still an intentional, documented debug affordance rather than something hidden behind a stronger gate (e.g., an admin-only flag) — acceptable for this assessment, but not something to ship to a real production system as-is.
- Full-text search on `name`/`email` uses `ILIKE` with a trigram (`pg_trgm`) index; this is fast for substring search at this scale but is not a replacement for a dedicated search engine at much larger scale.
- No rate limiting or request throttling on the API.
