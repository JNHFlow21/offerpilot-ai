# Auth And Continuous Interview Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Turn OfferPilot into a login-gated product with a protected Chinese workspace, then upgrade the interview flow into an ongoing one-question-at-a-time session with feedback and reference answers.

**Architecture:** Use Supabase SSR middleware to refresh auth state and redirect unauthenticated users away from protected product routes. Route handlers will verify the current user and pass `userId` into the core services for workspace and job persistence. The interview flow will keep the staged `/prepare` fast path, but the session engine will no longer stop after a short outline: it will return feedback, a reference answer, and generate the next primary question when the initial outline is exhausted.

**Tech Stack:** Next.js App Router, Supabase SSR/Auth, Drizzle ORM, Gemini Flash + Pro, Vitest.

---

### Task 1: Protect product routes with Supabase middleware

**Files:**
- Create: `/Users/fujunhao/Desktop/OfferPilot/middleware.ts`
- Create: `/Users/fujunhao/Desktop/OfferPilot/lib/auth/route-protection.ts`
- Test: `/Users/fujunhao/Desktop/OfferPilot/tests/middleware-auth.test.ts`

**Step 1: Write the failing test**

Cover:
- unauthenticated request to `/prepare` redirects to `/login`
- authenticated request to `/login` redirects to `/prepare`
- public routes `/` and `/login` stay accessible

**Step 2: Run test to verify it fails**

Run: `pnpm test tests/middleware-auth.test.ts`

**Step 3: Write minimal implementation**

Implement middleware with `createServerClient`, call `auth.getUser()`, then:
- redirect unauthenticated users from `/prepare`, `/profile`, `/knowledge`, `/jobs`
- redirect authenticated users away from `/login`

**Step 4: Run test to verify it passes**

Run: `pnpm test tests/middleware-auth.test.ts`

**Step 5: Commit**

```bash
git add middleware.ts lib/auth/route-protection.ts tests/middleware-auth.test.ts
git commit -m "feat: protect app routes with auth middleware"
```

### Task 2: Add current-user auth helpers for route handlers

**Files:**
- Create: `/Users/fujunhao/Desktop/OfferPilot/lib/auth/current-user.ts`
- Modify: `/Users/fujunhao/Desktop/OfferPilot/app/api/prepare/run/route.ts`
- Modify: `/Users/fujunhao/Desktop/OfferPilot/app/api/interview/start/route.ts`
- Modify: `/Users/fujunhao/Desktop/OfferPilot/app/api/interview/turn/route.ts`
- Test: `/Users/fujunhao/Desktop/OfferPilot/tests/app/api-prepare-run-route.test.ts`
- Test: `/Users/fujunhao/Desktop/OfferPilot/tests/app/api-interview-start-route.test.ts`
- Test: `/Users/fujunhao/Desktop/OfferPilot/tests/app/api-interview-turn-route.test.ts`

**Step 1: Write the failing test**

Cover:
- unauthenticated API request returns `401`
- authenticated API request still works

**Step 2: Run tests to verify they fail**

Run: `pnpm test tests/app/api-prepare-run-route.test.ts tests/app/api-interview-start-route.test.ts tests/app/api-interview-turn-route.test.ts`

**Step 3: Write minimal implementation**

Add helpers:
- `getCurrentUser()`
- `requireCurrentUser()`

Use them inside the three core route handlers and pass `userId` into services.

**Step 4: Run tests to verify they pass**

Run: `pnpm test tests/app/api-prepare-run-route.test.ts tests/app/api-interview-start-route.test.ts tests/app/api-interview-turn-route.test.ts`

**Step 5: Commit**

```bash
git add lib/auth/current-user.ts app/api/prepare/run/route.ts app/api/interview/start/route.ts app/api/interview/turn/route.ts tests/app/api-prepare-run-route.test.ts tests/app/api-interview-start-route.test.ts tests/app/api-interview-turn-route.test.ts
git commit -m "feat: require auth on core product APIs"
```

### Task 3: Scope workspace and jobs to the current user

**Files:**
- Modify: `/Users/fujunhao/Desktop/OfferPilot/lib/services/resume-workspace-service.ts`
- Modify: `/Users/fujunhao/Desktop/OfferPilot/lib/services/job-repository.ts`
- Modify: `/Users/fujunhao/Desktop/OfferPilot/lib/services/prepare-run-service.ts`
- Modify: `/Users/fujunhao/Desktop/OfferPilot/app/prepare/page.tsx`
- Test: `/Users/fujunhao/Desktop/OfferPilot/tests/services/resume-workspace-service.test.ts`
- Test: `/Users/fujunhao/Desktop/OfferPilot/tests/services/job-repository.test.ts`
- Test: `/Users/fujunhao/Desktop/OfferPilot/tests/services/prepare-run-service.test.ts`

**Step 1: Write the failing test**

Cover:
- current workspace lookup accepts `userId`
- job list/create accepts `userId`
- prepare pipeline persists data under the authenticated user

**Step 2: Run tests to verify they fail**

Run: `pnpm test tests/services/resume-workspace-service.test.ts tests/services/job-repository.test.ts tests/services/prepare-run-service.test.ts`

**Step 3: Write minimal implementation**

Thread `userId` through the core prepare path and save owned rows instead of anonymous rows.

**Step 4: Run tests to verify they pass**

Run: `pnpm test tests/services/resume-workspace-service.test.ts tests/services/job-repository.test.ts tests/services/prepare-run-service.test.ts`

**Step 5: Commit**

```bash
git add lib/services/resume-workspace-service.ts lib/services/job-repository.ts lib/services/prepare-run-service.ts app/prepare/page.tsx tests/services/resume-workspace-service.test.ts tests/services/job-repository.test.ts tests/services/prepare-run-service.test.ts
git commit -m "feat: scope prepare data to current user"
```

### Task 4: Extend interview evaluation with reference answers

**Files:**
- Modify: `/Users/fujunhao/Desktop/OfferPilot/lib/ai/schemas/interview-session.ts`
- Modify: `/Users/fujunhao/Desktop/OfferPilot/lib/ai/prompts/interview-session.ts`
- Modify: `/Users/fujunhao/Desktop/OfferPilot/lib/services/interview-session-service.ts`
- Test: `/Users/fujunhao/Desktop/OfferPilot/tests/services/interview-session-service.test.ts`

**Step 1: Write the failing test**

Cover:
- evaluation returns `feedback`
- evaluation returns `referenceAnswer`
- turn result exposes both to the UI

**Step 2: Run test to verify it fails**

Run: `pnpm test tests/services/interview-session-service.test.ts`

**Step 3: Write minimal implementation**

Extend evaluation schema and prompt so every answered turn returns:
- `score`
- `feedback`
- `referenceAnswer`
- optional `followUpQuestion`

**Step 4: Run test to verify it passes**

Run: `pnpm test tests/services/interview-session-service.test.ts`

**Step 5: Commit**

```bash
git add lib/ai/schemas/interview-session.ts lib/ai/prompts/interview-session.ts lib/services/interview-session-service.ts tests/services/interview-session-service.test.ts
git commit -m "feat: add interview feedback and reference answers"
```

### Task 5: Remove the fixed interview length and continue asking

**Files:**
- Modify: `/Users/fujunhao/Desktop/OfferPilot/lib/ai/prompts/interview-session.ts`
- Modify: `/Users/fujunhao/Desktop/OfferPilot/lib/services/interview-session-service.ts`
- Test: `/Users/fujunhao/Desktop/OfferPilot/tests/services/interview-session-service.test.ts`
- Test: `/Users/fujunhao/Desktop/OfferPilot/tests/app/api-interview-turn-route.test.ts`

**Step 1: Write the failing test**

Cover:
- when the initial outline is exhausted, the service generates a fresh next primary question
- session does not auto-stop after three questions

**Step 2: Run tests to verify they fail**

Run: `pnpm test tests/services/interview-session-service.test.ts tests/app/api-interview-turn-route.test.ts`

**Step 3: Write minimal implementation**

Add a next-question generation step that uses the interview context and prior turns to append a new primary question onto the session outline instead of ending the session immediately.

**Step 4: Run tests to verify they pass**

Run: `pnpm test tests/services/interview-session-service.test.ts tests/app/api-interview-turn-route.test.ts`

**Step 5: Commit**

```bash
git add lib/ai/prompts/interview-session.ts lib/services/interview-session-service.ts tests/services/interview-session-service.test.ts tests/app/api-interview-turn-route.test.ts
git commit -m "feat: allow continuous interview questioning"
```

### Task 6: Update the Chinese workspace UI for authenticated usage

**Files:**
- Modify: `/Users/fujunhao/Desktop/OfferPilot/components/prepare/prepare-workspace.tsx`
- Modify: `/Users/fujunhao/Desktop/OfferPilot/app/prepare/page.tsx`
- Modify: `/Users/fujunhao/Desktop/OfferPilot/components/auth/login-panel.tsx`
- Test: `/Users/fujunhao/Desktop/OfferPilot/tests/components/prepare-workspace-flow.test.tsx`
- Test: `/Users/fujunhao/Desktop/OfferPilot/tests/app/prepare-page.test.tsx`
- Test: `/Users/fujunhao/Desktop/OfferPilot/tests/app/login-page.test.tsx`

**Step 1: Write the failing test**

Cover:
- logged-in workspace shows current account context
- interview panel shows feedback + reference answer
- interview continues to the next generated question

**Step 2: Run tests to verify they fail**

Run: `pnpm test tests/components/prepare-workspace-flow.test.tsx tests/app/prepare-page.test.tsx tests/app/login-page.test.tsx`

**Step 3: Write minimal implementation**

Update the UI to:
- show current user email / sign-out affordance
- show feedback and reference answer after each answer
- keep the interview open-ended instead of implying a three-question cap

**Step 4: Run tests to verify they pass**

Run: `pnpm test tests/components/prepare-workspace-flow.test.tsx tests/app/prepare-page.test.tsx tests/app/login-page.test.tsx`

**Step 5: Commit**

```bash
git add components/prepare/prepare-workspace.tsx app/prepare/page.tsx components/auth/login-panel.tsx tests/components/prepare-workspace-flow.test.tsx tests/app/prepare-page.test.tsx tests/app/login-page.test.tsx
git commit -m "feat: wire authenticated workspace and continuous interview UI"
```

### Task 7: Verification, docs, deploy

**Files:**
- Modify: `/Users/fujunhao/Desktop/OfferPilot/context/OfferPilot_Project_Journey.md`
- Modify: `/Users/fujunhao/Desktop/OfferPilot/context/OfferPilot_Product_Context.md`

**Step 1: Run full verification**

Run:
- `pnpm test`
- `pnpm build`

**Step 2: Update docs**

Record:
- login gating is active
- main product flow requires auth
- interview now supports ongoing turns plus feedback/reference answers

**Step 3: Commit and push**

```bash
git add context/OfferPilot_Project_Journey.md context/OfferPilot_Product_Context.md
git commit -m "docs: update journey after auth and interview overhaul"
git push origin main
```
