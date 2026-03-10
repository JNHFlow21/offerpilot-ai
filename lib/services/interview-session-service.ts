import { and, asc, desc, eq } from "drizzle-orm";
import OpenAI from "openai";
import { zodResponseFormat } from "openai/helpers/zod";

import { getGeminiInterviewModel, getDefaultAiProvider } from "@/lib/ai/clients";
import { buildInterviewTurnEvaluationPrompt } from "@/lib/ai/prompts/interview-session";
import type { InterviewAssistResult } from "@/lib/ai/schemas/interview-assist";
import {
  interviewSessionRecordSchema,
  interviewStartRequestSchema,
  interviewTurnEvaluationSchema,
  interviewTurnRecordSchema,
  interviewTurnRequestSchema,
  type InterviewQuestionOutline,
  type InterviewSessionRecord,
  type InterviewStartRequest,
  type InterviewTurnEvaluation,
  type InterviewTurnRecord,
  type InterviewTurnRequest,
} from "@/lib/ai/schemas/interview-session";
import type { ResumeWorkspaceStore } from "@/lib/services/resume-workspace-service";
import type { JobRepository } from "@/lib/services/job-repository";
import type { ResumeRewriteStore } from "@/lib/services/resume-rewrite-service";
import { generateInterviewAssistForJob, getResumeRewriteStore } from "@/lib/services/resume-rewrite-service";
import { getResumeWorkspaceStore } from "@/lib/services/resume-workspace-service";
import { getJobRepository } from "@/lib/services/job-repository";
import { getDb } from "@/lib/db/client";
import { interviewSessions, interviewTurns } from "@/lib/db/schema";

interface InterviewPlanGeneratorInput {
  jobId: string;
  knowledgeScope?: "all" | "jd" | "resume" | "project" | "interview_note" | "knowledge_note";
}

export interface InterviewSessionStore {
  createSession(input: {
    workspaceId: string;
    jobTargetId: string;
    outline: InterviewQuestionOutline[];
  }): Promise<InterviewSessionRecord>;
  getSessionById(sessionId: string): Promise<InterviewSessionRecord | null>;
  updateSession(
    sessionId: string,
    input: Partial<Pick<InterviewSessionRecord, "status" | "currentTurnIndex" | "outline">>,
  ): Promise<InterviewSessionRecord>;
  createTurn(input: {
    sessionId: string;
    turnIndex: number;
    kind: InterviewTurnRecord["kind"];
    question: string;
  }): Promise<InterviewTurnRecord>;
  listTurns(sessionId: string): Promise<InterviewTurnRecord[]>;
  updateTurn(
    turnId: string,
    input: Partial<Pick<InterviewTurnRecord, "answer" | "feedback" | "score" | "status">>,
  ): Promise<InterviewTurnRecord>;
}

export interface InterviewEvaluatorInput {
  workspace: Awaited<ReturnType<ResumeWorkspaceStore["getCurrentWorkspace"]>>;
  job: Awaited<ReturnType<JobRepository["getJobById"]>>;
  rewrite: Awaited<ReturnType<ResumeRewriteStore["getLatestRewrite"]>>;
  currentTurn: InterviewTurnRecord;
  answer: string;
  outline: InterviewQuestionOutline[];
}

export interface InterviewAnswerEvaluator {
  evaluate(input: InterviewEvaluatorInput): Promise<InterviewTurnEvaluation>;
}

export interface InterviewSessionDependencies {
  workspaceStore: Pick<ResumeWorkspaceStore, "getCurrentWorkspace">;
  jobRepository: Pick<JobRepository, "getJobById">;
  rewriteStore: Pick<ResumeRewriteStore, "getLatestRewrite">;
  store: InterviewSessionStore;
  planGenerator: (input: InterviewPlanGeneratorInput) => Promise<InterviewAssistResult>;
  answerEvaluator: InterviewAnswerEvaluator;
}

export interface InterviewSessionStartResult {
  session: InterviewSessionRecord;
  currentQuestion: InterviewTurnRecord | null;
  progress: {
    current: number;
    total: number;
  };
  overview: string;
}

export interface InterviewTurnResult {
  session: InterviewSessionRecord;
  currentQuestion: InterviewTurnRecord | null;
  lastFeedback: {
    score: number;
    feedback: string;
  };
  progress: {
    current: number;
    total: number;
  };
}

function toOutline(assist: InterviewAssistResult): InterviewQuestionOutline[] {
  return assist.questions.map((question) => ({
    question: question.question,
    followUps: question.followUps,
    answerFramework: question.answerFramework,
  }));
}

function toSessionRecord(row: typeof interviewSessions.$inferSelect) {
  return interviewSessionRecordSchema.parse({
    id: row.id,
    workspaceId: row.workspaceId,
    jobTargetId: row.jobTargetId,
    status: row.status,
    currentTurnIndex: row.currentTurnIndex,
    outline: row.outline,
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
  });
}

function toTurnRecord(row: typeof interviewTurns.$inferSelect) {
  return interviewTurnRecordSchema.parse({
    id: row.id,
    sessionId: row.sessionId,
    turnIndex: row.turnIndex,
    kind: row.kind,
    question: row.question,
    answer: row.answer,
    feedback: row.feedback,
    score: row.score,
    status: row.status,
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
  });
}

const memorySessions = new Map<string, InterviewSessionRecord>();
const memoryTurns = new Map<string, InterviewTurnRecord[]>();

class MemoryInterviewSessionStore implements InterviewSessionStore {
  async createSession(input: {
    workspaceId: string;
    jobTargetId: string;
    outline: InterviewQuestionOutline[];
  }) {
    const now = new Date().toISOString();
    const session = interviewSessionRecordSchema.parse({
      id: crypto.randomUUID(),
      workspaceId: input.workspaceId,
      jobTargetId: input.jobTargetId,
      status: "in_progress",
      currentTurnIndex: 0,
      outline: input.outline,
      createdAt: now,
      updatedAt: now,
    });
    memorySessions.set(session.id, session);
    memoryTurns.set(session.id, []);
    return session;
  }

  async getSessionById(sessionId: string) {
    return memorySessions.get(sessionId) ?? null;
  }

  async updateSession(
    sessionId: string,
    input: Partial<Pick<InterviewSessionRecord, "status" | "currentTurnIndex" | "outline">>,
  ) {
    const current = memorySessions.get(sessionId);
    if (!current) {
      throw new Error("Interview session not found.");
    }
    const updated = interviewSessionRecordSchema.parse({
      ...current,
      ...input,
      updatedAt: new Date().toISOString(),
    });
    memorySessions.set(sessionId, updated);
    return updated;
  }

  async createTurn(input: {
    sessionId: string;
    turnIndex: number;
    kind: InterviewTurnRecord["kind"];
    question: string;
  }) {
    const turns = memoryTurns.get(input.sessionId) ?? [];
    const now = new Date().toISOString();
    const turn = interviewTurnRecordSchema.parse({
      id: crypto.randomUUID(),
      sessionId: input.sessionId,
      turnIndex: input.turnIndex,
      kind: input.kind,
      question: input.question,
      answer: null,
      feedback: null,
      score: null,
      status: "asked",
      createdAt: now,
      updatedAt: now,
    });
    turns.push(turn);
    memoryTurns.set(input.sessionId, turns);
    return turn;
  }

  async listTurns(sessionId: string) {
    return [...(memoryTurns.get(sessionId) ?? [])].sort(
      (left, right) => left.turnIndex - right.turnIndex,
    );
  }

  async updateTurn(
    turnId: string,
    input: Partial<Pick<InterviewTurnRecord, "answer" | "feedback" | "score" | "status">>,
  ) {
    for (const [sessionId, turns] of memoryTurns.entries()) {
      const index = turns.findIndex((turn) => turn.id === turnId);
      if (index === -1) {
        continue;
      }
      const updated = interviewTurnRecordSchema.parse({
        ...turns[index],
        ...input,
        updatedAt: new Date().toISOString(),
      });
      turns[index] = updated;
      memoryTurns.set(sessionId, turns);
      return updated;
    }

    throw new Error("Interview turn not found.");
  }
}

class PostgresInterviewSessionStore implements InterviewSessionStore {
  async createSession(input: {
    workspaceId: string;
    jobTargetId: string;
    outline: InterviewQuestionOutline[];
  }) {
    const db = getDb();
    const [row] = await db
      .insert(interviewSessions)
      .values({
        workspaceId: input.workspaceId,
        jobTargetId: input.jobTargetId,
        outline: input.outline,
      })
      .returning();

    return toSessionRecord(row);
  }

  async getSessionById(sessionId: string) {
    const db = getDb();
    const [row] = await db
      .select()
      .from(interviewSessions)
      .where(eq(interviewSessions.id, sessionId))
      .limit(1);

    return row ? toSessionRecord(row) : null;
  }

  async updateSession(
    sessionId: string,
    input: Partial<Pick<InterviewSessionRecord, "status" | "currentTurnIndex" | "outline">>,
  ) {
    const db = getDb();
    const [row] = await db
      .update(interviewSessions)
      .set({
        status: input.status,
        currentTurnIndex: input.currentTurnIndex,
        outline: input.outline,
        updatedAt: new Date(),
      })
      .where(eq(interviewSessions.id, sessionId))
      .returning();

    return toSessionRecord(row);
  }

  async createTurn(input: {
    sessionId: string;
    turnIndex: number;
    kind: InterviewTurnRecord["kind"];
    question: string;
  }) {
    const db = getDb();
    const [row] = await db
      .insert(interviewTurns)
      .values({
        sessionId: input.sessionId,
        turnIndex: input.turnIndex,
        kind: input.kind,
        question: input.question,
      })
      .returning();

    return toTurnRecord(row);
  }

  async listTurns(sessionId: string) {
    const db = getDb();
    const rows = await db
      .select()
      .from(interviewTurns)
      .where(eq(interviewTurns.sessionId, sessionId))
      .orderBy(asc(interviewTurns.turnIndex), asc(interviewTurns.createdAt));

    return rows.map(toTurnRecord);
  }

  async updateTurn(
    turnId: string,
    input: Partial<Pick<InterviewTurnRecord, "answer" | "feedback" | "score" | "status">>,
  ) {
    const db = getDb();
    const [row] = await db
      .update(interviewTurns)
      .set({
        answer: input.answer,
        feedback: input.feedback,
        score: input.score,
        status: input.status,
        updatedAt: new Date(),
      })
      .where(eq(interviewTurns.id, turnId))
      .returning();

    return toTurnRecord(row);
  }
}

class GeminiInterviewTurnEvaluator implements InterviewAnswerEvaluator {
  private readonly client: OpenAI;
  private readonly model: string;

  constructor(
    apiKey = process.env.GEMINI_API_KEY,
    model = getGeminiInterviewModel(),
  ) {
    if (!apiKey) {
      throw new Error("GEMINI_API_KEY is not set.");
    }

    this.client = new OpenAI({
      apiKey,
      baseURL: "https://generativelanguage.googleapis.com/v1beta/openai/",
    });
    this.model = model;
  }

  async evaluate(input: InterviewEvaluatorInput) {
    const prompt = buildInterviewTurnEvaluationPrompt({
      workspace: input.workspace!,
      job: input.job!,
      rewrite: input.rewrite!,
      currentQuestion: input.currentTurn.question,
      answer: input.answer,
      currentKind: input.currentTurn.kind,
      outline: input.outline,
    });

    const response = await this.client.beta.chat.completions.parse({
      model: this.model,
      messages: [
        {
          role: "system",
          content: "You are a Chinese AI interviewer. Evaluate one answer at a time and decide whether to ask one follow-up.",
        },
        {
          role: "user",
          content: prompt,
        },
      ],
      response_format: zodResponseFormat(
        interviewTurnEvaluationSchema,
        "interview_turn_evaluation",
      ),
    });

    return interviewTurnEvaluationSchema.parse(response.choices[0]?.message.parsed ?? null);
  }
}

class OpenAiInterviewTurnEvaluator implements InterviewAnswerEvaluator {
  private readonly client: OpenAI;
  private readonly model: string;

  constructor(
    apiKey = process.env.OPENAI_API_KEY,
    model = process.env.OPENAI_MODEL ?? "gpt-4o-mini",
  ) {
    if (!apiKey) {
      throw new Error("OPENAI_API_KEY is not set.");
    }

    this.client = new OpenAI({ apiKey });
    this.model = model;
  }

  async evaluate(input: InterviewEvaluatorInput) {
    const prompt = buildInterviewTurnEvaluationPrompt({
      workspace: input.workspace!,
      job: input.job!,
      rewrite: input.rewrite!,
      currentQuestion: input.currentTurn.question,
      answer: input.answer,
      currentKind: input.currentTurn.kind,
      outline: input.outline,
    });

    const response = await this.client.responses.create({
      model: this.model,
      input: prompt,
      text: {
        format: {
          type: "json_schema",
          name: "interview_turn_evaluation",
          strict: true,
          schema: {
            type: "object",
            additionalProperties: false,
            properties: {
              score: { type: "integer", minimum: 1, maximum: 5 },
              feedback: { type: "string" },
              shouldAskFollowUp: { type: "boolean" },
              followUpQuestion: { type: "string" },
            },
            required: ["score", "feedback", "shouldAskFollowUp"],
          },
        },
      },
    });

    return interviewTurnEvaluationSchema.parse(JSON.parse(response.output_text));
  }
}

const memoryStore = new MemoryInterviewSessionStore();

export function getInterviewSessionStore(): InterviewSessionStore {
  if (process.env.DATABASE_URL) {
    return new PostgresInterviewSessionStore();
  }

  if (process.env.NODE_ENV === "production" || process.env.VERCEL) {
    throw new Error("DATABASE_URL is required in production environments.");
  }

  return memoryStore;
}

export function createDefaultInterviewAnswerEvaluator(): InterviewAnswerEvaluator {
  const provider = getDefaultAiProvider();

  if (provider === "gemini") {
    return new GeminiInterviewTurnEvaluator();
  }

  if (provider === "openai") {
    return new OpenAiInterviewTurnEvaluator();
  }

  throw new Error("No AI provider key found. Set GEMINI_API_KEY or OPENAI_API_KEY.");
}

export async function startInterviewSession(
  input: InterviewStartRequest,
  providedDependencies?: Partial<InterviewSessionDependencies>,
): Promise<InterviewSessionStartResult> {
  const parsed = interviewStartRequestSchema.parse(input);
  const dependencies: InterviewSessionDependencies = {
    workspaceStore: providedDependencies?.workspaceStore ?? getResumeWorkspaceStore(),
    jobRepository: providedDependencies?.jobRepository ?? getJobRepository(),
    rewriteStore: providedDependencies?.rewriteStore ?? getResumeRewriteStore(),
    store: providedDependencies?.store ?? getInterviewSessionStore(),
    planGenerator:
      providedDependencies?.planGenerator ??
      ((planInput) =>
        generateInterviewAssistForJob({
          jobId: planInput.jobId,
          knowledgeScope: planInput.knowledgeScope ?? "all",
        })),
    answerEvaluator:
      providedDependencies?.answerEvaluator ?? createDefaultInterviewAnswerEvaluator(),
  };

  const workspace = await dependencies.workspaceStore.getCurrentWorkspace();
  if (!workspace) {
    throw new Error("Resume workspace not found.");
  }

  const job = await dependencies.jobRepository.getJobById(parsed.jobId);
  if (!job) {
    throw new Error("Job target not found.");
  }

  const rewrite = await dependencies.rewriteStore.getLatestRewrite(workspace.id, parsed.jobId);
  if (!rewrite) {
    throw new Error("Resume rewrite not found.");
  }

  const assist = await dependencies.planGenerator({
    jobId: parsed.jobId,
    knowledgeScope: parsed.knowledgeScope,
  });
  const outline = toOutline(assist);

  if (outline.length === 0) {
    throw new Error("Interview outline is empty.");
  }

  const session = await dependencies.store.createSession({
    workspaceId: workspace.id,
    jobTargetId: parsed.jobId,
    outline,
  });
  const firstTurn = await dependencies.store.createTurn({
    sessionId: session.id,
    turnIndex: 0,
    kind: "primary",
    question: outline[0].question,
  });

  return {
    session,
    currentQuestion: firstTurn,
    progress: {
      current: 1,
      total: outline.length,
    },
    overview: assist.overview,
  };
}

export async function answerInterviewTurn(
  input: InterviewTurnRequest,
  providedDependencies?: Partial<InterviewSessionDependencies>,
): Promise<InterviewTurnResult> {
  const parsed = interviewTurnRequestSchema.parse(input);
  const dependencies: InterviewSessionDependencies = {
    workspaceStore: providedDependencies?.workspaceStore ?? getResumeWorkspaceStore(),
    jobRepository: providedDependencies?.jobRepository ?? getJobRepository(),
    rewriteStore: providedDependencies?.rewriteStore ?? getResumeRewriteStore(),
    store: providedDependencies?.store ?? getInterviewSessionStore(),
    planGenerator:
      providedDependencies?.planGenerator ??
      ((planInput) =>
        generateInterviewAssistForJob({
          jobId: planInput.jobId,
          knowledgeScope: planInput.knowledgeScope ?? "all",
        })),
    answerEvaluator:
      providedDependencies?.answerEvaluator ?? createDefaultInterviewAnswerEvaluator(),
  };

  const session = await dependencies.store.getSessionById(parsed.sessionId);
  if (!session) {
    throw new Error("Interview session not found.");
  }

  const workspace = await dependencies.workspaceStore.getCurrentWorkspace();
  if (!workspace) {
    throw new Error("Resume workspace not found.");
  }

  const job = await dependencies.jobRepository.getJobById(session.jobTargetId);
  if (!job) {
    throw new Error("Job target not found.");
  }

  const rewrite = await dependencies.rewriteStore.getLatestRewrite(workspace.id, session.jobTargetId);
  if (!rewrite) {
    throw new Error("Resume rewrite not found.");
  }

  const turns = await dependencies.store.listTurns(session.id);
  const currentTurn = [...turns].sort((left, right) => right.turnIndex - left.turnIndex)[0];

  if (!currentTurn || currentTurn.status !== "asked") {
    throw new Error("No active interview turn found.");
  }

  const evaluation = await dependencies.answerEvaluator.evaluate({
    workspace,
    job,
    rewrite,
    currentTurn,
    answer: parsed.answer,
    outline: session.outline,
  });

  const shouldAskFollowUp =
    currentTurn.kind === "primary" &&
    evaluation.shouldAskFollowUp &&
    Boolean(evaluation.followUpQuestion);

  await dependencies.store.updateTurn(currentTurn.id, {
    answer: parsed.answer,
    feedback: evaluation.feedback,
    score: evaluation.score,
    status: shouldAskFollowUp ? "answered" : "completed",
  });

  const nextTurnIndex = turns.length;
  const primaryAskedCount = turns.filter((turn) => turn.kind === "primary").length;

  if (shouldAskFollowUp) {
    const followUpTurn = await dependencies.store.createTurn({
      sessionId: session.id,
      turnIndex: nextTurnIndex,
      kind: "follow_up",
      question: evaluation.followUpQuestion!,
    });

    const updatedSession = await dependencies.store.updateSession(session.id, {
      currentTurnIndex: primaryAskedCount - 1,
    });

    return {
      session: updatedSession,
      currentQuestion: followUpTurn,
      lastFeedback: {
        score: evaluation.score,
        feedback: evaluation.feedback,
      },
      progress: {
        current: updatedSession.currentTurnIndex + 1,
        total: updatedSession.outline.length,
      },
    };
  }

  const nextPrimaryIndex = primaryAskedCount;

  if (nextPrimaryIndex >= session.outline.length) {
    const completedSession = await dependencies.store.updateSession(session.id, {
      status: "completed",
      currentTurnIndex: session.outline.length,
    });

    return {
      session: completedSession,
      currentQuestion: null,
      lastFeedback: {
        score: evaluation.score,
        feedback: evaluation.feedback,
      },
      progress: {
        current: completedSession.outline.length,
        total: completedSession.outline.length,
      },
    };
  }

  const nextTurn = await dependencies.store.createTurn({
    sessionId: session.id,
    turnIndex: nextTurnIndex,
    kind: "primary",
    question: session.outline[nextPrimaryIndex].question,
  });

  const updatedSession = await dependencies.store.updateSession(session.id, {
    currentTurnIndex: nextPrimaryIndex,
  });

  return {
    session: updatedSession,
    currentQuestion: nextTurn,
    lastFeedback: {
      score: evaluation.score,
      feedback: evaluation.feedback,
    },
    progress: {
      current: nextPrimaryIndex + 1,
      total: updatedSession.outline.length,
    },
  };
}

export function resetMemoryInterviewSessionStore() {
  memorySessions.clear();
  memoryTurns.clear();
}
