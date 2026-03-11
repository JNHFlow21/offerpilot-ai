import { and, desc, eq } from "drizzle-orm";
import OpenAI from "openai";
import { zodResponseFormat } from "openai/helpers/zod";

import {
  getDefaultAiProvider,
  getGeminiInterviewModel,
  getGeminiRewriteModel,
} from "@/lib/ai/clients";
import { buildInterviewAssistPrompt } from "@/lib/ai/prompts/interview-assist";
import { buildResumeRewritePrompt } from "@/lib/ai/prompts/resume-rewrite";
import {
  interviewAssistJsonSchema,
  interviewAssistRequestSchema,
  interviewAssistSchema,
  type InterviewAssistRequest,
  type InterviewAssistResult,
} from "@/lib/ai/schemas/interview-assist";
import type {
  KnowledgeChunkContext,
  KnowledgeScope,
} from "@/lib/ai/schemas/knowledge-source";
import {
  resumeRewriteJsonSchema,
  resumeRewriteModelSchema,
  resumeRewriteRecordSchema,
  resumeRewriteRequestSchema,
  resumeRewriteSchema,
  type ResumeRewriteRecord,
  type ResumeRewriteRequest,
  type ResumeRewriteResult,
} from "@/lib/ai/schemas/resume-rewrite";
import type { ResumeWorkspaceStore } from "@/lib/services/resume-workspace-service";
import { getDb } from "@/lib/db/client";
import { resumeRewrites } from "@/lib/db/schema";
import type { JobRepository, JobRecord } from "@/lib/services/job-repository";
import { getJobRepository } from "@/lib/services/job-repository";
import type { KnowledgeStore } from "@/lib/services/knowledge-service";
import { getKnowledgeStore } from "@/lib/services/knowledge-service";
import { getResumeWorkspaceStore } from "@/lib/services/resume-workspace-service";

export interface ResumeRewriteClient {
  rewrite(input: { prompt: string }): Promise<ResumeRewriteResult | unknown>;
}

export interface InterviewAssistClient {
  generate(input: { prompt: string }): Promise<InterviewAssistResult | unknown>;
}

export interface ResumeRewriteStore {
  saveRewrite(
    workspaceId: string,
    jobId: string,
    rewrite: ResumeRewriteResult,
  ): Promise<ResumeRewriteRecord>;
  getLatestRewrite(
    workspaceId: string,
    jobId: string,
  ): Promise<ResumeRewriteRecord | null>;
}

export interface ResumeRewriteDependencies {
  workspaceStore: Pick<ResumeWorkspaceStore, "getCurrentWorkspace">;
  jobRepository: Pick<JobRepository, "getJobById">;
  knowledgeStore: Pick<KnowledgeStore, "listChunkContexts">;
  rewriteStore: ResumeRewriteStore;
}

function clampText(value: string, max: number) {
  const normalized = value.replace(/\s+/g, " ").trim();

  if (normalized.length <= max) {
    return normalized;
  }

  return `${normalized.slice(0, Math.max(0, max - 1)).trimEnd()}…`;
}

function normalizeResumeRewrite(raw: unknown): ResumeRewriteResult {
  const parsed = resumeRewriteModelSchema.parse(raw);

  return resumeRewriteSchema.parse({
    rewriteSummary: clampText(parsed.rewriteSummary, 400),
    sectionSuggestions: parsed.sectionSuggestions.map((section) => ({
      sectionTitle: clampText(section.sectionTitle, 120),
      currentIssue: clampText(section.currentIssue, 280),
      recommendedChange: clampText(section.recommendedChange, 320),
      jdAlignmentReason: clampText(section.jdAlignmentReason, 320),
    })),
    revisedBullets: parsed.revisedBullets.map((group) => ({
      sectionTitle: clampText(group.sectionTitle, 120),
      bullets: group.bullets.map((bullet) => clampText(bullet, 280)),
    })),
    interviewAngles: parsed.interviewAngles.map((angle) => ({
      sectionTitle: clampText(angle.sectionTitle, 120),
      likelyQuestion: clampText(angle.likelyQuestion, 220),
      rationale: clampText(angle.rationale, 280),
      answerFocus: clampText(angle.answerFocus, 320),
    })),
  });
}

function tokenize(value: string) {
  return value
    .toLowerCase()
    .split(/[^a-z0-9\u4e00-\u9fa5]+/u)
    .map((token) => token.trim())
    .filter((token) => token.length >= 2);
}

function scoreChunk(query: string, chunk: KnowledgeChunkContext) {
  const queryTokens = tokenize(query);
  const chunkTokens = new Set(
    tokenize(`${chunk.sourceTitle} ${chunk.sourceType} ${chunk.content}`),
  );

  return queryTokens.reduce((score, token) => score + Number(chunkTokens.has(token)), 0);
}

function selectTopRewriteChunks(job: JobRecord, chunks: KnowledgeChunkContext[], limit = 4) {
  const query = [
    job.companyName ?? "",
    job.roleName,
    job.jdText,
    ...(job.analysis?.keywords ?? []),
    ...(job.analysis?.recommendedActions ?? []),
  ].join(" ");

  return [...chunks]
    .map((chunk) => ({
      chunk,
      score: scoreChunk(query, chunk),
    }))
    .sort((left, right) => right.score - left.score)
    .slice(0, limit)
    .map((entry) => entry.chunk);
}

function toResumeRewriteRecord(row: typeof resumeRewrites.$inferSelect) {
  return resumeRewriteRecordSchema.parse({
    id: row.id,
    workspaceId: row.workspaceId,
    jobTargetId: row.jobTargetId,
    rewriteSummary: row.rewriteSummary,
    sectionSuggestions: row.sectionSuggestions,
    revisedBullets: row.revisedBullets,
    interviewAngles: row.interviewAngles,
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
  });
}

const memoryRewrites = new Map<string, ResumeRewriteRecord>();

class MemoryResumeRewriteStore implements ResumeRewriteStore {
  async saveRewrite(
    workspaceId: string,
    jobId: string,
    rewrite: ResumeRewriteResult,
  ) {
    const latest = await this.getLatestRewrite(workspaceId, jobId);
    const now = new Date().toISOString();
    const record = resumeRewriteRecordSchema.parse({
      id: latest?.id ?? crypto.randomUUID(),
      workspaceId,
      jobTargetId: jobId,
      createdAt: latest?.createdAt ?? now,
      updatedAt: now,
      ...rewrite,
    });

    memoryRewrites.set(`${workspaceId}:${jobId}`, record);
    return record;
  }

  async getLatestRewrite(workspaceId: string, jobId: string) {
    return memoryRewrites.get(`${workspaceId}:${jobId}`) ?? null;
  }
}

class PostgresResumeRewriteStore implements ResumeRewriteStore {
  async saveRewrite(
    workspaceId: string,
    jobId: string,
    rewrite: ResumeRewriteResult,
  ) {
    const db = getDb();
    const existing = await this.getLatestRewrite(workspaceId, jobId);

    if (!existing) {
      const [created] = await db
        .insert(resumeRewrites)
        .values({
          workspaceId,
          jobTargetId: jobId,
          rewriteSummary: rewrite.rewriteSummary,
          sectionSuggestions: rewrite.sectionSuggestions,
          revisedBullets: rewrite.revisedBullets,
          interviewAngles: rewrite.interviewAngles,
          rawResult: rewrite,
        })
        .returning();

      return toResumeRewriteRecord(created);
    }

    const [updated] = await db
      .update(resumeRewrites)
      .set({
        rewriteSummary: rewrite.rewriteSummary,
        sectionSuggestions: rewrite.sectionSuggestions,
        revisedBullets: rewrite.revisedBullets,
        interviewAngles: rewrite.interviewAngles,
        rawResult: rewrite,
        updatedAt: new Date(),
      })
      .where(eq(resumeRewrites.id, existing.id))
      .returning();

    return toResumeRewriteRecord(updated);
  }

  async getLatestRewrite(workspaceId: string, jobId: string) {
    const db = getDb();
    const [row] = await db
      .select()
      .from(resumeRewrites)
      .where(
        and(
          eq(resumeRewrites.workspaceId, workspaceId),
          eq(resumeRewrites.jobTargetId, jobId),
        ),
      )
      .orderBy(desc(resumeRewrites.updatedAt))
      .limit(1);

    return row ? toResumeRewriteRecord(row) : null;
  }
}

class GeminiResumeRewriteClient implements ResumeRewriteClient {
  private readonly client: OpenAI;
  private readonly model: string;

  constructor(
    apiKey = process.env.GEMINI_API_KEY,
    model = getGeminiRewriteModel(),
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

  async rewrite(input: { prompt: string }) {
    const response = await this.client.beta.chat.completions.parse({
      model: this.model,
      messages: [
        {
          role: "system",
          content:
            "You are an AI job-prep copilot. Improve resume positioning faithfully and never invent experience.",
        },
        {
          role: "user",
          content: input.prompt,
        },
      ],
      response_format: zodResponseFormat(resumeRewriteModelSchema, "resume_rewrite"),
    });

    return response.choices[0]?.message.parsed ?? null;
  }
}

class OpenAiResumeRewriteClient implements ResumeRewriteClient {
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

  async rewrite(input: { prompt: string }) {
    const response = await this.client.responses.create({
      model: this.model,
      input: input.prompt,
      text: {
        format: {
          type: "json_schema",
          name: "resume_rewrite",
          strict: true,
          schema: resumeRewriteJsonSchema,
        },
      },
    });

    return JSON.parse(response.output_text);
  }
}

class GeminiInterviewAssistClient implements InterviewAssistClient {
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

  async generate(input: { prompt: string }) {
    const response = await this.client.beta.chat.completions.parse({
      model: this.model,
      messages: [
        {
          role: "system",
          content:
            "You are an interview-prep copilot. Generate realistic questions, follow-ups, and answer framing grounded in supplied evidence.",
        },
        {
          role: "user",
          content: input.prompt,
        },
      ],
      response_format: zodResponseFormat(interviewAssistSchema, "interview_assist"),
    });

    return response.choices[0]?.message.parsed ?? null;
  }
}

class OpenAiInterviewAssistClient implements InterviewAssistClient {
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

  async generate(input: { prompt: string }) {
    const response = await this.client.responses.create({
      model: this.model,
      input: input.prompt,
      text: {
        format: {
          type: "json_schema",
          name: "interview_assist",
          strict: true,
          schema: interviewAssistJsonSchema,
        },
      },
    });

    return JSON.parse(response.output_text);
  }
}

const memoryRewriteStore = new MemoryResumeRewriteStore();

export function getResumeRewriteStore(): ResumeRewriteStore {
  if (process.env.DATABASE_URL) {
    return new PostgresResumeRewriteStore();
  }

  if (process.env.NODE_ENV === "production" || process.env.VERCEL) {
    throw new Error("DATABASE_URL is required in production environments.");
  }

  return memoryRewriteStore;
}

export function createDefaultResumeRewriteClient(): ResumeRewriteClient {
  const provider = getDefaultAiProvider();

  if (provider === "gemini") {
    return new GeminiResumeRewriteClient();
  }

  if (provider === "openai") {
    return new OpenAiResumeRewriteClient();
  }

  throw new Error("No AI provider key found. Set GEMINI_API_KEY or OPENAI_API_KEY.");
}

export function createDefaultInterviewAssistClient(): InterviewAssistClient {
  const provider = getDefaultAiProvider();

  if (provider === "gemini") {
    return new GeminiInterviewAssistClient();
  }

  if (provider === "openai") {
    return new OpenAiInterviewAssistClient();
  }

  throw new Error("No AI provider key found. Set GEMINI_API_KEY or OPENAI_API_KEY.");
}

export async function rewriteResumeForJob(
  input: ResumeRewriteRequest,
  dependencies: ResumeRewriteDependencies = {
    workspaceStore: getResumeWorkspaceStore(),
    jobRepository: getJobRepository(),
    knowledgeStore: getKnowledgeStore(),
    rewriteStore: getResumeRewriteStore(),
  },
  client: ResumeRewriteClient = createDefaultResumeRewriteClient(),
) {
  const parsed = resumeRewriteRequestSchema.parse(input);
  const workspace = await dependencies.workspaceStore.getCurrentWorkspace();

  if (!workspace) {
    throw new Error("Resume workspace not found.");
  }

  const job = await dependencies.jobRepository.getJobById(parsed.jobId);

  if (!job) {
    throw new Error("Job target not found.");
  }

  const chunks = await dependencies.knowledgeStore.listChunkContexts(
    parsed.knowledgeScope as KnowledgeScope,
  );
  const selectedChunks = selectTopRewriteChunks(job, chunks);
  const prompt = buildResumeRewritePrompt({
    workspace,
    job,
    knowledgeChunks: selectedChunks,
  });
  const rawRewrite = await client.rewrite({ prompt });
  const rewrite = normalizeResumeRewrite(rawRewrite);

  return dependencies.rewriteStore.saveRewrite(workspace.id, parsed.jobId, rewrite);
}

export async function generateInterviewAssistForJob(
  input: InterviewAssistRequest,
  dependencies: ResumeRewriteDependencies = {
    workspaceStore: getResumeWorkspaceStore(),
    jobRepository: getJobRepository(),
    knowledgeStore: getKnowledgeStore(),
    rewriteStore: getResumeRewriteStore(),
  },
  client: InterviewAssistClient = createDefaultInterviewAssistClient(),
) {
  const parsed = interviewAssistRequestSchema.parse(input);
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

  const chunks = await dependencies.knowledgeStore.listChunkContexts(
    parsed.knowledgeScope as KnowledgeScope,
  );
  const selectedChunks = selectTopRewriteChunks(job, chunks);
  const prompt = buildInterviewAssistPrompt({
    workspace,
    job,
    rewrite,
    knowledgeChunks: selectedChunks,
  });
  const rawAssist = await client.generate({ prompt });

  return interviewAssistSchema.parse(rawAssist);
}

export function resetMemoryResumeRewriteStore() {
  memoryRewrites.clear();
}
