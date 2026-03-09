# OfferPilot Phase 1 Foundation And JD Analysis Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Build the initial OfferPilot engineering foundation and ship the first end-to-end JD analysis path.

**Architecture:** Start with a single Next.js App Router project backed by Supabase Postgres and Drizzle. Implement the smallest vertical slice first: database schema, typed AI output contract, JD analysis service, and the two pages needed to create and view a parsed job target.

**Tech Stack:** Next.js, TypeScript, Tailwind CSS, Supabase, Drizzle ORM, Zod, OpenAI Responses API, Vitest

---

### Task 1: Bootstrap Project

**Files:**
- Create: `/Users/fujunhao/Desktop/OfferPilot/package.json`
- Create: `/Users/fujunhao/Desktop/OfferPilot/tsconfig.json`
- Create: `/Users/fujunhao/Desktop/OfferPilot/next.config.ts`
- Create: `/Users/fujunhao/Desktop/OfferPilot/app/layout.tsx`
- Create: `/Users/fujunhao/Desktop/OfferPilot/app/page.tsx`

**Step 1: Write the failing test**

Create a smoke test that imports the home page and expects the main CTA label.

**Step 2: Run test to verify it fails**

Run: `npm test -- --runInBand`

Expected: fail because the app and test setup do not exist yet.

**Step 3: Write minimal implementation**

Initialize Next.js app files, test runner config, and a minimal homepage shell.

**Step 4: Run test to verify it passes**

Run: `npm test -- --runInBand`

Expected: pass on the smoke test.

**Step 5: Commit**

```bash
git add .
git commit -m "chore: bootstrap Next.js foundation"
```

### Task 2: Add Database Schema And Migrations

**Files:**
- Create: `/Users/fujunhao/Desktop/OfferPilot/drizzle.config.ts`
- Create: `/Users/fujunhao/Desktop/OfferPilot/lib/db/schema/user-profiles.ts`
- Create: `/Users/fujunhao/Desktop/OfferPilot/lib/db/schema/job-targets.ts`
- Create: `/Users/fujunhao/Desktop/OfferPilot/lib/db/schema/jd-analyses.ts`
- Create: `/Users/fujunhao/Desktop/OfferPilot/lib/db/schema/index.ts`
- Create: `/Users/fujunhao/Desktop/OfferPilot/lib/db/client.ts`
- Create: `/Users/fujunhao/Desktop/OfferPilot/supabase/migrations/0001_initial_phase1.sql`
- Test: `/Users/fujunhao/Desktop/OfferPilot/tests/db/schema.test.ts`

**Step 1: Write the failing test**

Write tests asserting the schema exports the three required tables and key fields.

**Step 2: Run test to verify it fails**

Run: `npm test -- tests/db/schema.test.ts`

Expected: fail because schema files do not exist.

**Step 3: Write minimal implementation**

Define Drizzle tables and a matching SQL migration for the phase 1 data model.

**Step 4: Run test to verify it passes**

Run: `npm test -- tests/db/schema.test.ts`

Expected: schema test passes.

**Step 5: Commit**

```bash
git add .
git commit -m "feat: add phase 1 database schema"
```

### Task 3: Add Typed JD Analysis Contracts

**Files:**
- Create: `/Users/fujunhao/Desktop/OfferPilot/lib/ai/schemas/jd-analysis.ts`
- Test: `/Users/fujunhao/Desktop/OfferPilot/tests/ai/jd-analysis-schema.test.ts`

**Step 1: Write the failing test**

Write one test for a valid JD analysis payload and one for an invalid payload missing required fields.

**Step 2: Run test to verify it fails**

Run: `npm test -- tests/ai/jd-analysis-schema.test.ts`

Expected: fail because the schema module does not exist.

**Step 3: Write minimal implementation**

Create `zod` schema and inferred TypeScript type for `JdAnalysisResult`.

**Step 4: Run test to verify it passes**

Run: `npm test -- tests/ai/jd-analysis-schema.test.ts`

Expected: both tests pass.

**Step 5: Commit**

```bash
git add .
git commit -m "feat: add JD analysis schemas"
```

### Task 4: Implement JD Analysis Workflow

**Files:**
- Create: `/Users/fujunhao/Desktop/OfferPilot/lib/ai/prompts/jd-analysis.ts`
- Create: `/Users/fujunhao/Desktop/OfferPilot/lib/ai/clients.ts`
- Create: `/Users/fujunhao/Desktop/OfferPilot/lib/services/job-service.ts`
- Test: `/Users/fujunhao/Desktop/OfferPilot/tests/services/job-service.test.ts`

**Step 1: Write the failing test**

Write a service test that injects a fake AI client and expects normalized JD analysis output.

**Step 2: Run test to verify it fails**

Run: `npm test -- tests/services/job-service.test.ts`

Expected: fail because the service does not exist.

**Step 3: Write minimal implementation**

Implement prompt builder, AI client wrapper, schema validation, and service-level normalization.

**Step 4: Run test to verify it passes**

Run: `npm test -- tests/services/job-service.test.ts`

Expected: pass without live API access.

**Step 5: Commit**

```bash
git add .
git commit -m "feat: add JD analysis workflow"
```

### Task 5: Wire First Page Flow

**Files:**
- Create: `/Users/fujunhao/Desktop/OfferPilot/app/jobs/new/page.tsx`
- Create: `/Users/fujunhao/Desktop/OfferPilot/app/jobs/[jobId]/page.tsx`
- Create: `/Users/fujunhao/Desktop/OfferPilot/app/api/jobs/route.ts`
- Create: `/Users/fujunhao/Desktop/OfferPilot/app/api/jobs/[jobId]/analyze/route.ts`
- Create: `/Users/fujunhao/Desktop/OfferPilot/components/job/jd-form.tsx`
- Create: `/Users/fujunhao/Desktop/OfferPilot/components/job/jd-analysis-view.tsx`
- Test: `/Users/fujunhao/Desktop/OfferPilot/tests/app/jobs.test.tsx`

**Step 1: Write the failing test**

Add page tests that assert the new-job page renders required inputs and the detail view can render a mock parsed result.

**Step 2: Run test to verify it fails**

Run: `npm test -- tests/app/jobs.test.tsx`

Expected: fail because pages and components do not exist.

**Step 3: Write minimal implementation**

Build the first UI path and wire route handlers to the job service.

**Step 4: Run test to verify it passes**

Run: `npm test -- tests/app/jobs.test.tsx`

Expected: pass on the page tests.

**Step 5: Commit**

```bash
git add .
git commit -m "feat: ship JD analysis page flow"
```

### Task 6: Verify Phase 1

**Files:**
- Modify: `/Users/fujunhao/Desktop/OfferPilot/context/OfferPilot_Project_Journey.md`

**Step 1: Run verification**

Run:

```bash
npm test
```

Expected: all tests green.

**Step 2: Update journey doc**

Add the completed phase 1 progress entry and next step.

**Step 3: Commit**

```bash
git add .
git commit -m "docs: update journey after phase 1"
```
