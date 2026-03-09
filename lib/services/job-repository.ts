import { desc, eq } from "drizzle-orm";

import type { JdAnalysisResult } from "@/lib/ai/schemas/jd-analysis";
import { jdAnalysisSchema } from "@/lib/ai/schemas/jd-analysis";
import { getDb } from "@/lib/db/client";
import { jdAnalyses, jobTargets } from "@/lib/db/schema";

export interface JobRecordInput {
  companyName?: string;
  roleName: string;
  jdText: string;
  sourceUrl?: string;
}

export interface JobRecord extends JobRecordInput {
  id: string;
  createdAt: string;
  analysis?: JdAnalysisResult;
}

export interface JobRepository {
  createJob(input: JobRecordInput): Promise<JobRecord>;
  listJobs(): Promise<JobRecord[]>;
  getJobById(jobId: string): Promise<JobRecord | null>;
  saveAnalysis(jobId: string, analysis: JdAnalysisResult): Promise<JobRecord | null>;
}

const memoryJobs = new Map<string, JobRecord>();

class MemoryJobRepository implements JobRepository {
  async createJob(input: JobRecordInput) {
    const record: JobRecord = {
      id: crypto.randomUUID(),
      createdAt: new Date().toISOString(),
      ...input,
    };

    memoryJobs.set(record.id, record);

    return record;
  }

  async listJobs() {
    return [...memoryJobs.values()].sort((left, right) =>
      right.createdAt.localeCompare(left.createdAt),
    );
  }

  async getJobById(jobId: string) {
    return memoryJobs.get(jobId) ?? null;
  }

  async saveAnalysis(jobId: string, analysis: JdAnalysisResult) {
    const record = memoryJobs.get(jobId);

    if (!record) {
      return null;
    }

    const updated = {
      ...record,
      analysis,
    };

    memoryJobs.set(jobId, updated);
    return updated;
  }
}

class PostgresJobRepository implements JobRepository {
  async createJob(input: JobRecordInput) {
    const db = getDb();
    const [created] = await db
      .insert(jobTargets)
      .values({
        companyName: input.companyName ?? null,
        roleName: input.roleName,
        jdText: input.jdText,
        jobSourceUrl: input.sourceUrl ?? null,
        userId: null,
      })
      .returning();

    return {
      id: created.id,
      companyName: created.companyName ?? undefined,
      roleName: created.roleName,
      jdText: created.jdText,
      sourceUrl: created.jobSourceUrl ?? undefined,
      createdAt: created.createdAt.toISOString(),
    };
  }

  async listJobs() {
    const db = getDb();
    const jobs = await db
      .select()
      .from(jobTargets)
      .orderBy(desc(jobTargets.updatedAt), desc(jobTargets.createdAt))
      .limit(12);

    return jobs.map((job) => ({
      id: job.id,
      companyName: job.companyName ?? undefined,
      roleName: job.roleName,
      jdText: job.jdText,
      sourceUrl: job.jobSourceUrl ?? undefined,
      createdAt: job.createdAt.toISOString(),
    }));
  }

  async getJobById(jobId: string) {
    const db = getDb();
    const [job] = await db
      .select()
      .from(jobTargets)
      .where(eq(jobTargets.id, jobId))
      .limit(1);

    if (!job) {
      return null;
    }

    const [analysisRow] = await db
      .select()
      .from(jdAnalyses)
      .where(eq(jdAnalyses.jobTargetId, jobId))
      .orderBy(desc(jdAnalyses.createdAt))
      .limit(1);

    return {
      id: job.id,
      companyName: job.companyName ?? undefined,
      roleName: job.roleName,
      jdText: job.jdText,
      sourceUrl: job.jobSourceUrl ?? undefined,
      createdAt: job.createdAt.toISOString(),
      analysis: analysisRow
        ? jdAnalysisSchema.parse({
            keywords: analysisRow.keywords,
            capabilityDimensions: analysisRow.capabilityDimensions,
            questionTypeWeights: analysisRow.questionTypeWeights,
            recommendedTopics: analysisRow.recommendedTopics,
            recommendedActions: analysisRow.recommendedActions,
            overallSummary: analysisRow.overallSummary,
          })
        : undefined,
    };
  }

  async saveAnalysis(jobId: string, analysis: JdAnalysisResult) {
    const db = getDb();
    await db.insert(jdAnalyses).values({
      jobTargetId: jobId,
      keywords: analysis.keywords,
      capabilityDimensions: analysis.capabilityDimensions,
      questionTypeWeights: analysis.questionTypeWeights,
      recommendedTopics: analysis.recommendedTopics,
      recommendedActions: analysis.recommendedActions,
      overallSummary: analysis.overallSummary,
      rawResult: analysis,
    });

    return this.getJobById(jobId);
  }
}

const memoryRepository = new MemoryJobRepository();

export function getJobRepository(): JobRepository {
  if (process.env.DATABASE_URL) {
    return new PostgresJobRepository();
  }

  if (process.env.NODE_ENV === "production" || process.env.VERCEL) {
    throw new Error("DATABASE_URL is required in production environments.");
  }

  return memoryRepository;
}

export function resetMemoryJobRepository() {
  memoryJobs.clear();
}
