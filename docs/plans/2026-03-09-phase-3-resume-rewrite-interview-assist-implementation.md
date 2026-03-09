# OfferPilot Phase 3 Resume Rewrite + Interview Assist Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Build the current MVP core path: `resume input -> JD parsing -> resume rewrite -> interview assist`.

**Architecture:** Reuse the existing Next.js + Supabase + Gemini stack. Keep the system narrow: one active resume workspace, one target JD, one rewrite result, one interview-assist output set. Treat platform knowledge as a bounded retrieval layer that supports rewrite and prep, not as a freeform chat product.

**Tech Stack:** Next.js App Router, TypeScript, Drizzle ORM, Supabase Postgres, Gemini, Zod, Vitest

---

### Task 1: Add resume workspace schema

**Files:**
- Create: `/Users/fujunhao/Desktop/OfferPilot/lib/db/schema/resume-workspaces.ts`
- Create: `/Users/fujunhao/Desktop/OfferPilot/lib/db/schema/resume-rewrites.ts`
- Modify: `/Users/fujunhao/Desktop/OfferPilot/lib/db/schema/index.ts`
- Create: `/Users/fujunhao/Desktop/OfferPilot/supabase/migrations/0005_add_resume_rewrite_tables.sql`
- Test: `/Users/fujunhao/Desktop/OfferPilot/tests/db/schema-phase3.test.ts`

**Step 1: Write the failing test**

Assert the schema exports `resume_workspaces` and `resume_rewrites`.

**Step 2: Run test to verify it fails**

Run: `pnpm test tests/db/schema-phase3.test.ts`

**Step 3: Write minimal implementation**

Add:
- `resume_workspaces`
- `resume_rewrites`
- only the minimum fields needed for one current rewrite flow

**Step 4: Run test to verify it passes**

Run: `pnpm test tests/db/schema-phase3.test.ts`

**Step 5: Commit**

```bash
git add lib/db/schema supabase/migrations tests/db/schema-phase3.test.ts
git commit -m "feat: add resume rewrite schema"
```

### Task 2: Add resume workspace API

**Files:**
- Create: `/Users/fujunhao/Desktop/OfferPilot/lib/ai/schemas/resume-workspace.ts`
- Create: `/Users/fujunhao/Desktop/OfferPilot/lib/services/resume-workspace-service.ts`
- Create: `/Users/fujunhao/Desktop/OfferPilot/app/api/resume/route.ts`
- Test: `/Users/fujunhao/Desktop/OfferPilot/tests/services/resume-workspace-service.test.ts`
- Test: `/Users/fujunhao/Desktop/OfferPilot/tests/app/api-resume-route.test.ts`

**Step 1: Write the failing test**

Cover:
- empty state
- create / update current resume workspace
- structured fields persist

**Step 2: Run test to verify it fails**

Run:
- `pnpm test tests/services/resume-workspace-service.test.ts`
- `pnpm test tests/app/api-resume-route.test.ts`

**Step 3: Write minimal implementation**

Persist:
- raw resume text
- extracted summary
- key project bullets
- notes about rewrite focus

**Step 4: Run test to verify it passes**

Run the same two test commands.

**Step 5: Commit**

```bash
git add app/api/resume lib/ai/schemas/resume-workspace.ts lib/services/resume-workspace-service.ts tests/services/resume-workspace-service.test.ts tests/app/api-resume-route.test.ts
git commit -m "feat: add resume workspace API"
```

### Task 3: Add resume rewrite workflow

**Files:**
- Create: `/Users/fujunhao/Desktop/OfferPilot/lib/ai/schemas/resume-rewrite.ts`
- Create: `/Users/fujunhao/Desktop/OfferPilot/lib/ai/prompts/resume-rewrite.ts`
- Create: `/Users/fujunhao/Desktop/OfferPilot/lib/services/resume-rewrite-service.ts`
- Create: `/Users/fujunhao/Desktop/OfferPilot/app/api/resume/rewrite/route.ts`
- Test: `/Users/fujunhao/Desktop/OfferPilot/tests/services/resume-rewrite-service.test.ts`
- Test: `/Users/fujunhao/Desktop/OfferPilot/tests/app/api-resume-rewrite-route.test.ts`

**Step 1: Write the failing test**

Cover:
- request validation
- rewrite result shape
- rewrite includes reasons and linked interview angles

**Step 2: Run test to verify it fails**

Run:
- `pnpm test tests/services/resume-rewrite-service.test.ts`
- `pnpm test tests/app/api-resume-rewrite-route.test.ts`

**Step 3: Write minimal implementation**

Input:
- current resume workspace
- current job target
- bounded retrieved knowledge chunks

Output:
- rewrite summary
- section-level suggestions
- revised bullets
- likely interview points triggered by each change

**Step 4: Run test to verify it passes**

Run the same two test commands.

**Step 5: Commit**

```bash
git add app/api/resume/rewrite lib/ai/schemas/resume-rewrite.ts lib/ai/prompts/resume-rewrite.ts lib/services/resume-rewrite-service.ts tests/services/resume-rewrite-service.test.ts tests/app/api-resume-rewrite-route.test.ts
git commit -m "feat: add resume rewrite workflow"
```

### Task 4: Add interview assist workflow

**Files:**
- Create: `/Users/fujunhao/Desktop/OfferPilot/lib/ai/schemas/interview-assist.ts`
- Create: `/Users/fujunhao/Desktop/OfferPilot/lib/ai/prompts/interview-assist.ts`
- Create: `/Users/fujunhao/Desktop/OfferPilot/app/api/interview/assist/route.ts`
- Modify: `/Users/fujunhao/Desktop/OfferPilot/lib/services/resume-rewrite-service.ts`
- Test: `/Users/fujunhao/Desktop/OfferPilot/tests/ai/interview-assist-schema.test.ts`
- Test: `/Users/fujunhao/Desktop/OfferPilot/tests/app/api-interview-assist-route.test.ts`

**Step 1: Write the failing test**

Cover:
- question set shape
- follow-up points
- answer guidance and citation range

**Step 2: Run test to verify it fails**

Run:
- `pnpm test tests/ai/interview-assist-schema.test.ts`
- `pnpm test tests/app/api-interview-assist-route.test.ts`

**Step 3: Write minimal implementation**

Generate:
- high-probability questions
- likely follow-ups
- answer framing points
- supporting citations or scope notes

**Step 4: Run test to verify it passes**

Run the same two test commands.

**Step 5: Commit**

```bash
git add app/api/interview/assist lib/ai/schemas/interview-assist.ts lib/ai/prompts/interview-assist.ts lib/services/resume-rewrite-service.ts tests/ai/interview-assist-schema.test.ts tests/app/api-interview-assist-route.test.ts
git commit -m "feat: add interview assist workflow"
```

### Task 5: Build the resume rewrite workspace page

**Files:**
- Create: `/Users/fujunhao/Desktop/OfferPilot/app/prepare/page.tsx`
- Create: `/Users/fujunhao/Desktop/OfferPilot/components/prepare/prepare-workspace.tsx`
- Test: `/Users/fujunhao/Desktop/OfferPilot/tests/app/prepare-page.test.tsx`
- Test: `/Users/fujunhao/Desktop/OfferPilot/tests/components/prepare-workspace.test.tsx`

**Step 1: Write the failing test**

Cover:
- resume input renders
- job target selection / paste area renders
- rewrite result area renders
- interview assist area renders

**Step 2: Run test to verify it fails**

Run:
- `pnpm test tests/app/prepare-page.test.tsx`
- `pnpm test tests/components/prepare-workspace.test.tsx`

**Step 3: Write minimal implementation**

Build one bounded workspace:
- left: resume and target job input
- center: rewrite suggestions and revised bullets
- right: interview assist cards

**Step 4: Run test to verify it passes**

Run the same two test commands.

**Step 5: Commit**

```bash
git add app/prepare components/prepare tests/app/prepare-page.test.tsx tests/components/prepare-workspace.test.tsx
git commit -m "feat: add resume rewrite workspace"
```

### Task 6: Phase verification

**Files:**
- Modify: `/Users/fujunhao/Desktop/OfferPilot/context/OfferPilot_Project_Journey.md`

**Step 1: Run all relevant checks**

Run:
- `pnpm test`
- `pnpm build`

**Step 2: Update docs**

Mark the new MVP alignment and implementation status in:
- `OfferPilot_Project_Journey.md`
- `OfferPilot_Product_Context.md` if needed

**Step 3: Commit**

```bash
git add context/OfferPilot_Project_Journey.md context/OfferPilot_Product_Context.md
git commit -m "docs: update journey after resume rewrite phase"
```
