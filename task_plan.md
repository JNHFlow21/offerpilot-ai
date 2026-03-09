# Task Plan

## Goal

Build OfferPilot Phase 1 foundation and ship the first JD analysis vertical slice.

## Phases

| Phase | Status | Notes |
| --- | --- | --- |
| Planning and setup | in_progress | Create implementation plan and working memory files |
| Project bootstrap | in_progress | Next.js, Tailwind, Vitest, baseline app shell is working |
| Data and AI contracts | pending | Drizzle schema, SQL migration, zod contracts |
| JD analysis vertical slice | pending | Job service, routes, pages, tests |
| Verification and push | pending | Run tests, update journey, commit and push |

## Decisions

- Use `pnpm` as package manager because it is available locally and suits a fresh TypeScript repo.
- Keep scope to phase 1 only: foundation plus JD analysis flow.
- Test live OpenAI calls indirectly; service tests will inject a fake client.

## Risks

- Fresh repo means setup friction around Next/Vitest config.
- Supabase credentials are not yet available, so data access code must be environment-safe.
