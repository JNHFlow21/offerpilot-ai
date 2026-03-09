# OfferPilot Phase 2 Profile + Knowledge Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Build the second MVP closed loop: `profile -> knowledge source ingestion -> retrieval-based QA`.

**Architecture:** Keep the same pattern as phase 1. Add minimal schema and APIs first, then wire a narrow UI flow. Do not introduce generic chat or a broad agent runtime. The knowledge module must stay source-bounded and return citations.

**Tech Stack:** Next.js App Router, TypeScript, Drizzle ORM, Supabase Postgres, Gemini, Zod, Vitest

---

### Task 1: Add phase 2 schema and migrations

**Files:**
- Create: `/Users/fujunhao/Desktop/OfferPilot/lib/db/schema/knowledge-sources.ts`
- Create: `/Users/fujunhao/Desktop/OfferPilot/lib/db/schema/knowledge-chunks.ts`
- Modify: `/Users/fujunhao/Desktop/OfferPilot/lib/db/schema/index.ts`
- Create: `/Users/fujunhao/Desktop/OfferPilot/supabase/migrations/0003_add_profile_and_knowledge_tables.sql`
- Test: `/Users/fujunhao/Desktop/OfferPilot/tests/db/schema-phase2.test.ts`

**Step 1: Write the failing test**

Assert the new schema exports exist and contain `knowledge_sources` / `knowledge_chunks`.

**Step 2: Run test to verify it fails**

Run: `pnpm test tests/db/schema-phase2.test.ts`

**Step 3: Write minimal implementation**

Add:
- `knowledge_sources`
- `knowledge_chunks`
- any missing `user_profiles` compatibility fields only if strictly needed

**Step 4: Run test to verify it passes**

Run: `pnpm test tests/db/schema-phase2.test.ts`

**Step 5: Commit**

```bash
git add lib/db/schema supabase/migrations tests/db/schema-phase2.test.ts
git commit -m "feat: add profile and knowledge schema"
```

### Task 2: Add profile repository and API

**Files:**
- Create: `/Users/fujunhao/Desktop/OfferPilot/lib/services/profile-service.ts`
- Create: `/Users/fujunhao/Desktop/OfferPilot/app/api/profile/route.ts`
- Create: `/Users/fujunhao/Desktop/OfferPilot/lib/ai/schemas/profile.ts`
- Test: `/Users/fujunhao/Desktop/OfferPilot/tests/app/api-profile-route.test.ts`

**Step 1: Write the failing test**

Cover:
- `GET /api/profile` returns empty state when no profile exists
- `POST /api/profile` upserts background fields

**Step 2: Run test to verify it fails**

Run: `pnpm test tests/app/api-profile-route.test.ts`

**Step 3: Write minimal implementation**

Persist:
- `displayName`
- `targetRoles`
- `targetCity`
- `resumeText`
- `resumeSummary`
- `selfIntroDraft`

**Step 4: Run test to verify it passes**

Run: `pnpm test tests/app/api-profile-route.test.ts`

**Step 5: Commit**

```bash
git add app/api/profile lib/services/profile-service.ts lib/ai/schemas/profile.ts tests/app/api-profile-route.test.ts
git commit -m "feat: add profile API and persistence"
```

### Task 3: Build `/profile` page

**Files:**
- Create: `/Users/fujunhao/Desktop/OfferPilot/app/profile/page.tsx`
- Create: `/Users/fujunhao/Desktop/OfferPilot/components/profile/profile-form.tsx`
- Test: `/Users/fujunhao/Desktop/OfferPilot/tests/app/profile-page.test.tsx`
- Test: `/Users/fujunhao/Desktop/OfferPilot/tests/components/profile-form.test.tsx`

**Step 1: Write the failing test**

Cover:
- form fields render
- submit posts to `/api/profile`
- success state is shown

**Step 2: Run test to verify it fails**

Run:
- `pnpm test tests/app/profile-page.test.tsx`
- `pnpm test tests/components/profile-form.test.tsx`

**Step 3: Write minimal implementation**

Build a simple profile editor for:
- target role
- city
- resume text
- project / self intro summary

**Step 4: Run test to verify it passes**

Run the same two test commands.

**Step 5: Commit**

```bash
git add app/profile components/profile tests/app/profile-page.test.tsx tests/components/profile-form.test.tsx
git commit -m "feat: add profile page"
```

### Task 4: Add knowledge ingestion service

**Files:**
- Create: `/Users/fujunhao/Desktop/OfferPilot/lib/services/knowledge-service.ts`
- Create: `/Users/fujunhao/Desktop/OfferPilot/app/api/knowledge/sources/route.ts`
- Create: `/Users/fujunhao/Desktop/OfferPilot/lib/ai/schemas/knowledge-answer.ts`
- Test: `/Users/fujunhao/Desktop/OfferPilot/tests/services/knowledge-service.test.ts`
- Test: `/Users/fujunhao/Desktop/OfferPilot/tests/app/api-knowledge-sources-route.test.ts`

**Step 1: Write the failing test**

Cover:
- source creation
- chunk creation
- source type validation

**Step 2: Run test to verify it fails**

Run:
- `pnpm test tests/services/knowledge-service.test.ts`
- `pnpm test tests/app/api-knowledge-sources-route.test.ts`

**Step 3: Write minimal implementation**

Support source types:
- `jd`
- `resume`
- `project`
- `interview_note`
- `knowledge_note`

Chunk by simple deterministic text splitting first. Do not add embeddings yet in this task.

**Step 4: Run test to verify it passes**

Run the same two test commands.

**Step 5: Commit**

```bash
git add lib/services/knowledge-service.ts app/api/knowledge/sources tests/services/knowledge-service.test.ts tests/app/api-knowledge-sources-route.test.ts
git commit -m "feat: add knowledge source ingestion"
```

### Task 5: Add retrieval + answer API

**Files:**
- Create: `/Users/fujunhao/Desktop/OfferPilot/app/api/knowledge/ask/route.ts`
- Modify: `/Users/fujunhao/Desktop/OfferPilot/lib/services/knowledge-service.ts`
- Test: `/Users/fujunhao/Desktop/OfferPilot/tests/app/api-knowledge-ask-route.test.ts`
- Test: `/Users/fujunhao/Desktop/OfferPilot/tests/ai/knowledge-answer-schema.test.ts`

**Step 1: Write the failing test**

Cover:
- request validation
- answer shape
- citation presence
- empty-source fallback

**Step 2: Run test to verify it fails**

Run:
- `pnpm test tests/app/api-knowledge-ask-route.test.ts`
- `pnpm test tests/ai/knowledge-answer-schema.test.ts`

**Step 3: Write minimal implementation**

Use a narrow retrieval path:
- load candidate chunks
- pass bounded context to Gemini
- return `answer + citations + scope notice`

**Step 4: Run test to verify it passes**

Run the same two test commands.

**Step 5: Commit**

```bash
git add app/api/knowledge/ask lib/services/knowledge-service.ts tests/app/api-knowledge-ask-route.test.ts tests/ai/knowledge-answer-schema.test.ts
git commit -m "feat: add knowledge retrieval answer API"
```

### Task 6: Build `/knowledge` page

**Files:**
- Create: `/Users/fujunhao/Desktop/OfferPilot/app/knowledge/page.tsx`
- Create: `/Users/fujunhao/Desktop/OfferPilot/components/knowledge/knowledge-workspace.tsx`
- Test: `/Users/fujunhao/Desktop/OfferPilot/tests/app/knowledge-page.test.tsx`
- Test: `/Users/fujunhao/Desktop/OfferPilot/tests/components/knowledge-workspace.test.tsx`

**Step 1: Write the failing test**

Cover:
- source list area renders
- question input renders
- cited answer renders

**Step 2: Run test to verify it fails**

Run:
- `pnpm test tests/app/knowledge-page.test.tsx`
- `pnpm test tests/components/knowledge-workspace.test.tsx`

**Step 3: Write minimal implementation**

Build a bounded QA workspace:
- left side: source summary
- right side: ask question
- answer card with citations

**Step 4: Run test to verify it passes**

Run the same two test commands.

**Step 5: Commit**

```bash
git add app/knowledge components/knowledge tests/app/knowledge-page.test.tsx tests/components/knowledge-workspace.test.tsx
git commit -m "feat: add knowledge workspace page"
```

### Task 7: Phase verification

**Files:**
- Modify: `/Users/fujunhao/Desktop/OfferPilot/context/OfferPilot_Project_Journey.md`

**Step 1: Run all relevant checks**

Run:
- `pnpm test`
- `pnpm build`

**Step 2: Manual product verification**

Verify:
- `/profile` saves data
- `/knowledge` can ingest at least one source
- asking a question returns a cited answer

**Step 3: Commit**

```bash
git add context/OfferPilot_Project_Journey.md
git commit -m "docs: update phase 2 progress"
```
