# Task Plan

## Goal

Build OfferPilot Phase 1 foundation and ship the first JD analysis vertical slice.

## Phases

| Phase | Status | Notes |
| --- | --- | --- |
| Planning and setup | complete | Plan and working memory files are in place |
| Project bootstrap | complete | Next.js app, Vitest, and build pipeline are working |
| Data and AI contracts | complete | Drizzle schema, SQL migration, and JD zod contracts are added |
| JD analysis vertical slice | complete | Service, routes, and first pages now support DB-backed repository selection |
| Verification and push | in_progress | Full test run and build passed after repository refactor |

## Decisions

- Use `pnpm` as package manager because it is available locally and suits a fresh TypeScript repo.
- Keep scope to phase 1 only: foundation plus JD analysis flow.
- Test live OpenAI calls indirectly; service tests will inject a fake client.

## Risks

- Fresh repo means setup friction around Next/Vitest config.
- Supabase credentials are not yet available, so data access code must be environment-safe.
- Current `/jobs` flow uses an in-memory store as a bridge until real DB persistence is wired.
- Cloud deployment is still blocked on real env values for `DATABASE_URL` and `OPENAI_API_KEY`.
