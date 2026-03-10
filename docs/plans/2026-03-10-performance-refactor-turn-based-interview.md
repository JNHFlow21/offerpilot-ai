# OfferPilot Performance Refactor + Turn-Based Interview Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Reduce end-to-end latency in `/prepare` by splitting model responsibilities and staged generation, then replace the summary-style interview assist with a real one-question-at-a-time interview session.

**Architecture:** Keep Gemini as the only provider, but split model usage by task. `JD 解析` switches to a faster Flash model, while `简历改写` and `面试评估` stay on Pro. The prepare flow becomes staged: save resume + JD first, return early with analysis/rewrite, then start interview from a dedicated session API instead of bundling interview output into the initial request.

**Tech Stack:** Next.js App Router, Supabase Postgres, Drizzle ORM, Gemini OpenAI-compatible API, Zod, Vitest

---

### Task 1: Split Gemini model configuration by workflow

**Files:**
- Modify: `/Users/fujunhao/Desktop/OfferPilot/lib/ai/clients.ts`
- Modify: `/Users/fujunhao/Desktop/OfferPilot/lib/services/resume-rewrite-service.ts`
- Modify: `/Users/fujunhao/Desktop/OfferPilot/.env.example`
- Test: `/Users/fujunhao/Desktop/OfferPilot/tests/ai/clients.test.ts`

**Step 1: Write the failing test**

Cover:
- JD analysis defaults to a Flash model
- resume rewrite / interview generation default to a Pro model

**Step 2: Run test to verify it fails**

Run: `pnpm test tests/ai/clients.test.ts`

**Step 3: Write minimal implementation**

Add env defaults:
- `GEMINI_JD_MODEL`
- `GEMINI_REWRITE_MODEL`
- `GEMINI_INTERVIEW_MODEL`

Use:
- Flash for JD analysis
- Pro for rewrite and interview evaluation

**Step 4: Run test to verify it passes**

Run: `pnpm test tests/ai/clients.test.ts`

**Step 5: Commit**

```bash
git add lib/ai/clients.ts lib/services/resume-rewrite-service.ts .env.example tests/ai/clients.test.ts
git commit -m "feat: split Gemini models by workflow"
```

### Task 2: Refactor `/prepare` into a staged fast path

**Files:**
- Modify: `/Users/fujunhao/Desktop/OfferPilot/lib/services/prepare-run-service.ts`
- Modify: `/Users/fujunhao/Desktop/OfferPilot/app/api/prepare/run/route.ts`
- Modify: `/Users/fujunhao/Desktop/OfferPilot/components/prepare/prepare-workspace.tsx`
- Test: `/Users/fujunhao/Desktop/OfferPilot/tests/services/prepare-run-service.test.ts`
- Test: `/Users/fujunhao/Desktop/OfferPilot/tests/app/api-prepare-run-route.test.ts`
- Test: `/Users/fujunhao/Desktop/OfferPilot/tests/components/prepare-workspace.test.tsx`

**Step 1: Write the failing tests**

Cover:
- prepare pipeline returns workspace + job + rewrite first
- initial request no longer blocks on interview generation
- UI shows staged status and explicit interview start entry

**Step 2: Run tests to verify they fail**

Run:
- `pnpm test tests/services/prepare-run-service.test.ts`
- `pnpm test tests/app/api-prepare-run-route.test.ts`
- `pnpm test tests/components/prepare-workspace.test.tsx`

**Step 3: Write minimal implementation**

Change flow:
- parse PDF
- save workspace
- save JD
- run JD analysis
- run resume rewrite
- return response

Do not generate interview questions inside the same request.

**Step 4: Run tests to verify they pass**

Run the same three commands.

**Step 5: Commit**

```bash
git add lib/services/prepare-run-service.ts app/api/prepare/run/route.ts components/prepare/prepare-workspace.tsx tests/services/prepare-run-service.test.ts tests/app/api-prepare-run-route.test.ts tests/components/prepare-workspace.test.tsx
git commit -m "feat: stage prepare flow for faster response"
```

### Task 3: Add interview session + turn data model

**Files:**
- Create: `/Users/fujunhao/Desktop/OfferPilot/lib/db/schema/interview-sessions.ts`
- Create: `/Users/fujunhao/Desktop/OfferPilot/lib/db/schema/interview-turns.ts`
- Modify: `/Users/fujunhao/Desktop/OfferPilot/lib/db/schema/index.ts`
- Create: `/Users/fujunhao/Desktop/OfferPilot/supabase/migrations/0006_add_interview_session_tables.sql`
- Test: `/Users/fujunhao/Desktop/OfferPilot/tests/db/schema-phase4-interview.test.ts`

**Step 1: Write the failing test**

Cover:
- interview sessions and turns are exported from schema index
- required columns exist for `jobTargetId`, `workspaceId`, `status`, `question`, `answer`, `score`

**Step 2: Run test to verify it fails**

Run: `pnpm test tests/db/schema-phase4-interview.test.ts`

**Step 3: Write minimal implementation**

Add:
- `interview_sessions`
- `interview_turns`
- migration SQL

**Step 4: Run test to verify it passes**

Run: `pnpm test tests/db/schema-phase4-interview.test.ts`

**Step 5: Commit**

```bash
git add lib/db/schema/interview-sessions.ts lib/db/schema/interview-turns.ts lib/db/schema/index.ts supabase/migrations/0006_add_interview_session_tables.sql tests/db/schema-phase4-interview.test.ts
git commit -m "feat: add interview session data model"
```

### Task 4: Build one-question-at-a-time interview workflow

**Files:**
- Create: `/Users/fujunhao/Desktop/OfferPilot/lib/ai/schemas/interview-session.ts`
- Create: `/Users/fujunhao/Desktop/OfferPilot/lib/ai/prompts/interview-session.ts`
- Create: `/Users/fujunhao/Desktop/OfferPilot/lib/services/interview-session-service.ts`
- Create: `/Users/fujunhao/Desktop/OfferPilot/app/api/interview/start/route.ts`
- Create: `/Users/fujunhao/Desktop/OfferPilot/app/api/interview/turn/route.ts`
- Test: `/Users/fujunhao/Desktop/OfferPilot/tests/services/interview-session-service.test.ts`
- Test: `/Users/fujunhao/Desktop/OfferPilot/tests/app/api-interview-start-route.test.ts`
- Test: `/Users/fujunhao/Desktop/OfferPilot/tests/app/api-interview-turn-route.test.ts`

**Step 1: Write the failing tests**

Cover:
- start route creates session and first question
- turn route stores answer and returns either follow-up or next question
- response carries lightweight feedback and session status

**Step 2: Run tests to verify they fail**

Run:
- `pnpm test tests/services/interview-session-service.test.ts`
- `pnpm test tests/app/api-interview-start-route.test.ts`
- `pnpm test tests/app/api-interview-turn-route.test.ts`

**Step 3: Write minimal implementation**

Build:
- session state machine
- first-question generation
- answer evaluation
- bounded follow-up / next-question logic

**Step 4: Run tests to verify they pass**

Run the same three commands.

**Step 5: Commit**

```bash
git add lib/ai/schemas/interview-session.ts lib/ai/prompts/interview-session.ts lib/services/interview-session-service.ts app/api/interview/start/route.ts app/api/interview/turn/route.ts tests/services/interview-session-service.test.ts tests/app/api-interview-start-route.test.ts tests/app/api-interview-turn-route.test.ts
git commit -m "feat: add turn-based interview workflow"
```

### Task 5: Wire the workspace to the session flow

**Files:**
- Modify: `/Users/fujunhao/Desktop/OfferPilot/components/prepare/prepare-workspace.tsx`
- Test: `/Users/fujunhao/Desktop/OfferPilot/tests/components/prepare-workspace-flow.test.tsx`

**Step 1: Write the failing test**

Cover:
- after prepare finishes, UI shows `开始模拟面试`
- interview panel renders one current question
- submitting an answer advances the session

**Step 2: Run test to verify it fails**

Run: `pnpm test tests/components/prepare-workspace-flow.test.tsx`

**Step 3: Write minimal implementation**

Update UI:
- keep prepare page Chinese and simplified
- add interview session start CTA
- render one question, one answer box, one submit action

**Step 4: Run test to verify it passes**

Run: `pnpm test tests/components/prepare-workspace-flow.test.tsx`

**Step 5: Commit**

```bash
git add components/prepare/prepare-workspace.tsx tests/components/prepare-workspace-flow.test.tsx
git commit -m "feat: add turn-based interview UI"
```

### Task 6: Verification and docs sync

**Files:**
- Modify: `/Users/fujunhao/Desktop/OfferPilot/context/OfferPilot_Project_Journey.md`
- Modify: `/Users/fujunhao/Desktop/OfferPilot/context/OfferPilot_Product_Context.md`

**Step 1: Run full verification**

Run:
- `pnpm test`
- `pnpm build`

**Step 2: Smoke test production**

Verify:
- `/prepare` returns `200`
- staged prepare returns rewrite without interview blocking
- interview start / turn routes work in production

**Step 3: Update docs**

Mark:
- Flash/Pro split in place
- staged prepare flow in place
- one-question-at-a-time interview in place

**Step 4: Commit**

```bash
git add context/OfferPilot_Project_Journey.md context/OfferPilot_Product_Context.md
git commit -m "docs: update journey after performance and interview refactor"
```
