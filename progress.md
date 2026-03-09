# Progress

## 2026-03-09

- Created phase 1 implementation plan document.
- Started execution workflow for project bootstrap and JD analysis slice.
- Installed project dependencies with `pnpm`.
- Added initial Next.js app shell and passed the first homepage smoke test.
- Added Drizzle schema files and the phase 1 SQL migration.
- Added `JD analysis` zod contracts, OpenAI client wrapper, prompt builder, and job service tests.
- Added first `/jobs/new` and `/jobs/[jobId]` pages plus API handlers.
- Verified the repo with `pnpm test` and `pnpm build`.
- Began cloud wiring phase: aligning persistence strategy with Supabase official docs before replacing the in-memory job store.
- Replaced the temporary job store with a repository layer that supports memory fallback locally and Postgres persistence when `DATABASE_URL` is set.
- Added `.env.example` and a cloud setup doc for Supabase + Vercel deployment.
- Re-verified the repo with `pnpm test` and `pnpm build` after the persistence refactor.
- Switched the default AI provider path to Gemini with OpenAI compatibility fallback.
- Added a dedicated Supabase `DATABASE_URL` setup tutorial and clarified runtime secret placement.
- Set the default Gemini model to `gemini-3.1-pro-preview` and created a local `.env.local` for the current machine.
- Verified the provided Supabase direct connection string is not the right `DATABASE_URL` for the current path, and updated local config/docs to require the transaction pooler string instead.
- Connected to Supabase using the transaction pooler string and applied phase 1 SQL migrations.
- Reproduced a real Gemini output/schema mismatch, added a failing test, and fixed it by normalizing question type labels before schema parse.
- Verified a live Gemini JD analysis call now succeeds with the production model path.
- Attempted to continue with Vercel deployment, but the current machine needs Vercel auth repaired before preview deploy can proceed.
