# OfferPilot Phase 4 Single Workspace + Auth + PDF Resume + Interview Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Rebuild the MVP around one Chinese workspace: login, persistent PDF resume, persistent JD with source URL, rewrite suggestions, and interview simulation.

**Architecture:** Keep the existing Next.js + Supabase + Gemini stack, but stop expanding separate user-facing pages. Move the visible experience into a single Chinese workspace and treat knowledge retrieval as a hidden support layer. Auth, PDF parsing, JD persistence, rewrite suggestions, and interview simulation all hang off the same current-user context.

**Tech Stack:** Next.js App Router, Supabase Auth, Supabase Storage, Supabase Postgres, Drizzle ORM, Gemini Files / structured output, Zod, Vitest

---

### Task 1: Add auth and current-user context

**Files:**
- Create: `/Users/fujunhao/Desktop/OfferPilot/lib/supabase/browser-client.ts`
- Create: `/Users/fujunhao/Desktop/OfferPilot/lib/supabase/server-client.ts`
- Create: `/Users/fujunhao/Desktop/OfferPilot/app/login/page.tsx`
- Create: `/Users/fujunhao/Desktop/OfferPilot/components/auth/login-panel.tsx`
- Test: `/Users/fujunhao/Desktop/OfferPilot/tests/app/login-page.test.tsx`

**Step 1: Write the failing test**

Cover:
- login page renders in Chinese
- page includes email / Google / GitHub login entry points

**Step 2: Run test to verify it fails**

Run: `pnpm test tests/app/login-page.test.tsx`

**Step 3: Write minimal implementation**

Add:
- Supabase browser/server client helpers
- Chinese login page
- email + Google + GitHub auth actions

**Step 4: Run test to verify it passes**

Run: `pnpm test tests/app/login-page.test.tsx`

**Step 5: Commit**

```bash
git add app/login components/auth lib/supabase tests/app/login-page.test.tsx
git commit -m "feat: add Chinese login flow"
```

### Task 2: Add persistent PDF resume upload and parsing

**Files:**
- Create: `/Users/fujunhao/Desktop/OfferPilot/lib/ai/schemas/resume-parse.ts`
- Create: `/Users/fujunhao/Desktop/OfferPilot/lib/ai/prompts/resume-parse.ts`
- Create: `/Users/fujunhao/Desktop/OfferPilot/lib/services/resume-file-service.ts`
- Create: `/Users/fujunhao/Desktop/OfferPilot/app/api/resume/upload/route.ts`
- Modify: `/Users/fujunhao/Desktop/OfferPilot/lib/db/schema/resume-workspaces.ts`
- Create: `/Users/fujunhao/Desktop/OfferPilot/supabase/migrations/0006_add_resume_file_fields.sql`
- Test: `/Users/fujunhao/Desktop/OfferPilot/tests/services/resume-file-service.test.ts`
- Test: `/Users/fujunhao/Desktop/OfferPilot/tests/app/api-resume-upload-route.test.ts`

**Step 1: Write the failing tests**

Cover:
- PDF upload persists a file reference
- Gemini parsing returns structured resume fields
- current workspace updates its main resume

**Step 2: Run tests to verify they fail**

Run:
- `pnpm test tests/services/resume-file-service.test.ts`
- `pnpm test tests/app/api-resume-upload-route.test.ts`

**Step 3: Write minimal implementation**

Add:
- Supabase Storage upload
- file metadata on resume workspace
- Gemini structured parse for PDF resume

**Step 4: Run tests to verify they pass**

Run the same two commands.

**Step 5: Commit**

```bash
git add app/api/resume/upload lib/ai/schemas/resume-parse.ts lib/ai/prompts/resume-parse.ts lib/services/resume-file-service.ts lib/db/schema/resume-workspaces.ts supabase/migrations/0006_add_resume_file_fields.sql tests/services/resume-file-service.test.ts tests/app/api-resume-upload-route.test.ts
git commit -m "feat: add PDF resume upload and parsing"
```

### Task 3: Add JD source URL persistence

**Files:**
- Modify: `/Users/fujunhao/Desktop/OfferPilot/lib/db/schema/job-targets.ts`
- Modify: `/Users/fujunhao/Desktop/OfferPilot/lib/services/job-repository.ts`
- Modify: `/Users/fujunhao/Desktop/OfferPilot/app/api/jobs/route.ts`
- Create: `/Users/fujunhao/Desktop/OfferPilot/supabase/migrations/0007_add_job_source_url_required_flow.sql`
- Test: `/Users/fujunhao/Desktop/OfferPilot/tests/app/api-jobs-route.test.ts`

**Step 1: Write the failing test**

Cover:
- route accepts `sourceUrl`
- saved job target returns persisted source URL

**Step 2: Run test to verify it fails**

Run: `pnpm test tests/app/api-jobs-route.test.ts`

**Step 3: Write minimal implementation**

Persist:
- JD source URL
- current-user scoped job targets

**Step 4: Run test to verify it passes**

Run: `pnpm test tests/app/api-jobs-route.test.ts`

**Step 5: Commit**

```bash
git add lib/db/schema/job-targets.ts lib/services/job-repository.ts app/api/jobs/route.ts supabase/migrations/0007_add_job_source_url_required_flow.sql tests/app/api-jobs-route.test.ts
git commit -m "feat: persist JD source URLs"
```

### Task 4: Collapse the main UX into one Chinese workspace

**Files:**
- Modify: `/Users/fujunhao/Desktop/OfferPilot/app/prepare/page.tsx`
- Modify: `/Users/fujunhao/Desktop/OfferPilot/components/prepare/prepare-workspace.tsx`
- Create: `/Users/fujunhao/Desktop/OfferPilot/tests/components/prepare-workspace-flow.test.tsx`

**Step 1: Write the failing test**

Cover:
- workspace labels are Chinese
- sections render in the order: 简历 / 岗位 JD / 改写建议 / 模拟面试
- knowledge config is not exposed in the main flow

**Step 2: Run test to verify it fails**

Run: `pnpm test tests/components/prepare-workspace-flow.test.tsx`

**Step 3: Write minimal implementation**

Refactor:
- all visible text to Chinese
- step-based single workspace flow
- remove primary navigation dependence on `/knowledge` and `/profile`

**Step 4: Run test to verify it passes**

Run: `pnpm test tests/components/prepare-workspace-flow.test.tsx`

**Step 5: Commit**

```bash
git add app/prepare components/prepare tests/components/prepare-workspace-flow.test.tsx
git commit -m "feat: refactor prepare into Chinese single workspace"
```

### Task 5: Add interview session + turn workflow

**Files:**
- Create: `/Users/fujunhao/Desktop/OfferPilot/lib/db/schema/interview-sessions.ts`
- Create: `/Users/fujunhao/Desktop/OfferPilot/lib/db/schema/interview-turns.ts`
- Modify: `/Users/fujunhao/Desktop/OfferPilot/lib/db/schema/index.ts`
- Create: `/Users/fujunhao/Desktop/OfferPilot/supabase/migrations/0008_add_interview_session_tables.sql`
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
- start session creates first question
- answering one turn returns either a follow-up or next question
- response includes lightweight score / feedback

**Step 2: Run tests to verify they fail**

Run:
- `pnpm test tests/services/interview-session-service.test.ts`
- `pnpm test tests/app/api-interview-start-route.test.ts`
- `pnpm test tests/app/api-interview-turn-route.test.ts`

**Step 3: Write minimal implementation**

Build:
- interview session table
- interview turns table
- one bounded interview agent loop

**Step 4: Run tests to verify they pass**

Run the same three commands.

**Step 5: Commit**

```bash
git add lib/db/schema/interview-sessions.ts lib/db/schema/interview-turns.ts lib/db/schema/index.ts supabase/migrations/0008_add_interview_session_tables.sql lib/ai/schemas/interview-session.ts lib/ai/prompts/interview-session.ts lib/services/interview-session-service.ts app/api/interview/start/route.ts app/api/interview/turn/route.ts tests/services/interview-session-service.test.ts tests/app/api-interview-start-route.test.ts tests/app/api-interview-turn-route.test.ts
git commit -m "feat: add interview simulation workflow"
```

### Task 6: Phase verification and docs sync

**Files:**
- Modify: `/Users/fujunhao/Desktop/OfferPilot/context/OfferPilot_Project_Journey.md`
- Modify: `/Users/fujunhao/Desktop/OfferPilot/context/OfferPilot_Product_Context.md`

**Step 1: Run all relevant checks**

Run:
- `pnpm test`
- `pnpm build`

**Step 2: Update docs**

Mark:
- Chinese single workspace in place
- PDF resume upload in place
- auth in place
- interview simulation in place

**Step 3: Commit**

```bash
git add context/OfferPilot_Project_Journey.md context/OfferPilot_Product_Context.md
git commit -m "docs: update journey after single workspace phase"
```
