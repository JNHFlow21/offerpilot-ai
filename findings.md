# Findings

- `OfferPilot` is now an independent git repository rooted at `/Users/fujunhao/Desktop/OfferPilot`.
- No application code exists yet; current repo contains only context and planning documents.
- `pnpm`, `npm`, `bun`, and `node` are available locally.
- `vitest` needs explicit alias config for `@/*` imports in this repo.
- The first homepage smoke test is passing with a minimal Next.js app shell.
- `next build` succeeded and auto-added Next.js TypeScript plugin entries to `tsconfig.json`.
- The first `/jobs` vertical slice works structurally, but job records are temporarily stored in memory rather than Postgres.
- Supabase official docs support pairing Supabase Postgres with `Drizzle ORM` and direct Postgres connections for server-side access.
- For the current phase, the right order is server-side Postgres persistence first, then Supabase Auth, then Vercel deployment with env vars.
- Current shell environment does not expose `DATABASE_URL`, `OPENAI_API_KEY`, or Supabase public/service keys yet.
- The Vercel MCP documentation tool currently requires auth in this environment, so Vercel doc lookup needs to fall back to official web docs.
- `job_targets.user_id` must stay nullable until Supabase Auth is added; otherwise phase 1 JD persistence cannot work without a signed-in user.
- The repository layer now uses Postgres automatically when `DATABASE_URL` exists, and fails fast in production if it does not.
- There is no Supabase MCP or authenticated Supabase control plane access in this environment, so Supabase project creation still requires one manual user step.
- The AI layer now defaults to Gemini when `GEMINI_API_KEY` is present and only falls back to OpenAI if Gemini is absent.
- Runtime secrets for this app should live in `Vercel Environment Variables`, not GitHub repository secrets, unless GitHub Actions is later introduced.
- Google official Gemini 3 documentation explicitly lists `gemini-3.1-pro-preview` as a valid model and migration target from deprecated `gemini-3-pro-preview`.
- The Supabase direct connection string supplied from Project Overview failed to resolve in this environment, which matches Supabase docs that direct connections are IPv6-oriented and not the right default for serverless/transient runtimes.
