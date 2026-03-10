import { and, desc, eq } from "drizzle-orm";

import type { JdAnalysisResult } from "@/lib/ai/schemas/jd-analysis";
import { jdAnalysisSchema } from "@/lib/ai/schemas/jd-analysis";
import { getDb } from "@/lib/db/client";
import { jdAnalyses, jobTargets } from "@/lib/db/schema";

export interface JobRecordInput {
  userId?: string;
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
  listJobs(userId?: string): Promise<JobRecord[]>;
  getJobById(jobId: string, userId?: string): Promise<JobRecord | null>;
  saveAnalysis(jobId: string, analysis: JdAnalysisResult, userId?: string): Promise<JobRecord | null>;
}

const memoryJobs = new Map<string, JobRecord & { userId?: string }>();

class MemoryJobRepository implements JobRepository {
  async createJob(input: JobRecordInput) {
    const record: JobRecord & { userId?: string } = {
      id: crypto.randomUUID(),
      createdAt: new Date().toISOString(),
      userId: input.userId,
      companyName: input.companyName,
      roleName: input.roleName,
      jdText: input.jdText,
      sourceUrl: input.sourceUrl,
    };

    memoryJobs.set(record.id, record);

    return record;
  }

  async listJobs(userId?: string) {
    return [...memoryJobs.values()]
      .filter((job) => (userId ? job.userId === userId : true))
      .sort((left, right) => right.createdAt.localeCompare(left.createdAt));
  }

  async getJobById(jobId: string, userId?: string) {
    const job = memoryJobs.get(jobId) ?? null;

    if (!job) {
      return null;
    }

    if (userId && job.userId !== userId) {
      return null;
    }

    return job;
  }

  async saveAnalysis(jobId: string, analysis: JdAnalysisResult, userId?: string) {
    const record = await this.getJobById(jobId, userId);

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
        userId: input.userId ?? null,
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

  async listJobs(userId?: string) {
    const db = getDb();
    const query = db
      .select()
      .from(jobTargets)
      .orderBy(desc(jobTargets.updatedAt), desc(jobTargets.createdAt));

    const jobs = userId
      ? await query.where(eq(jobTargets.userId, userId)).limit(12)
      : await query.limit(12);

    return jobs.map((job) => ({
      id: job.id,
      companyName: job.companyName ?? undefined,
      roleName: job.roleName,
      jdText: job.jdText,
      sourceUrl: job.jobSourceUrl ?? undefined,
      createdAt: job.createdAt.toISOString(),
    }));
  }

  async getJobById(jobId: string, userId?: string) {
    const db = getDb();
    const [job] = await db
      .select()
      .from(jobTargets)
      .where(userId ? and(eq(jobTargets.id, jobId), eq(jobTargets.userId, userId)) : eq(jobTargets.id, jobId))
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

  async saveAnalysis(jobId: string, analysis: JdAnalysisResult, userId?: string) {
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

    return this.getJobById(jobId, userId);
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
