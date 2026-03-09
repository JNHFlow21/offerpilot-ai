# Findings

- `OfferPilot` is now an independent git repository rooted at `/Users/fujunhao/Desktop/OfferPilot`.
- No application code exists yet; current repo contains only context and planning documents.
- `pnpm`, `npm`, `bun`, and `node` are available locally.
- `vitest` needs explicit alias config for `@/*` imports in this repo.
- The first homepage smoke test is passing with a minimal Next.js app shell.
- `next build` succeeded and auto-added Next.js TypeScript plugin entries to `tsconfig.json`.
- The first `/jobs` vertical slice works structurally, but job records are temporarily stored in memory rather than Postgres.
