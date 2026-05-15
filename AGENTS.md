# SME-Pay Agent Instructions

This repository contains SME-Pay, a payroll automation prototype.

## Rules

1. Do not delete files unless explicitly requested.
2. Do not modify .env files.
3. Do not hardcode Philippine statutory contribution values in source code.
4. Store statutory values as seed/reference rows in the database.
5. Use database migrations for schema changes. Place them in `supabase/migrations/`.
6. Use TypeScript strict mode.
7. Use server-side validation for payroll computation.
8. Do not allow edits to finalized payroll records.
9. Add or update tests when implementing business logic.
10. Before each task, produce a short plan and affected files list.
11. After each task, produce verification steps and known issues.

## Architecture

- **Framework:** Next.js App Router with server components and server actions.
- **Database:** PostgreSQL via Supabase with RLS enabled.
- **Auth:** Supabase Auth with cookie-based SSR sessions.
- **Styling:** Tailwind CSS v4 with custom design system.
- **Service-role key** must NEVER be exposed to client/browser code.

## Key Directories

- `src/app/` — Pages and layouts (App Router)
- `src/components/` — Reusable UI components
- `src/features/` — Feature-specific logic and server actions
- `src/lib/` — Shared utilities, Supabase clients, payroll engine
- `src/types/` — TypeScript type definitions
- `supabase/migrations/` — Database migrations
- `supabase/seed/` — Seed data scripts
- `docs/` — Build checklist, schema reference, use cases

## Non-Negotiable Constraints

- No `APPROVED` payroll run status.
- Official payslips only from `FINALIZED` payroll runs + periods.
- Statutory values (SSS, PhilHealth, Pag-IBIG, tax) must be stored in effective-dated reference tables.
- Audit logs must be append-only.
- Finalized payroll data must be protected by database triggers.

## Testing

- Unit tests: `npm run test` (Vitest)
- E2E tests: `npm run test:e2e` (Playwright)
- Type checking: `npm run typecheck`
- Lint: `npm run lint`
