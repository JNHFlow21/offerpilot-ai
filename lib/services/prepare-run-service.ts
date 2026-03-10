import type { ResumeRewriteRecord } from "@/lib/ai/schemas/resume-rewrite";
import type { ResumeWorkspaceRecord } from "@/lib/ai/schemas/resume-workspace";
import type { JobRecord, JobRepository } from "@/lib/services/job-repository";
import { getJobRepository } from "@/lib/services/job-repository";
import { getKnowledgeStore } from "@/lib/services/knowledge-service";
import {
  getResumeRewriteStore,
  rewriteResumeForJob,
  type ResumeRewriteDependencies,
} from "@/lib/services/resume-rewrite-service";
import { getResumeWorkspaceStore } from "@/lib/services/resume-workspace-service";
import { runJdAnalysisForJob } from "@/lib/services/job-service";

export interface PrepareRunInput {
  userId?: string;
  companyName?: string;
  roleName: string;
  jdText: string;
  sourceUrl?: string;
  resumeText: string;
}

export interface PrepareRunResult {
  workspace: ResumeWorkspaceRecord;
  job: JobRecord;
  rewrite: ResumeRewriteRecord;
  status: "rewrite_ready";
}

export interface PrepareRunDependencies {
  workspaceStore: {
    upsertCurrentWorkspace(userId: string | undefined, input: {
      rawResumeText: string;
      resumeSummary?: string;
      keyProjectBullets?: string[];
      rewriteFocus?: string;
    }): Promise<ResumeWorkspaceRecord>;
    getCurrentWorkspace?(userId?: string): Promise<ResumeWorkspaceRecord | null>;
  };
  jobRepository: Pick<JobRepository, "createJob" | "getJobById" | "saveAnalysis">;
  knowledgeStore: ResumeRewriteDependencies["knowledgeStore"];
  rewriteStore: ResumeRewriteDependencies["rewriteStore"];
  analyzeJob: (
    jobId: string,
    repository: Pick<JobRepository, "getJobById" | "saveAnalysis">,
  ) => Promise<JobRecord>;
  rewriteResume: typeof rewriteResumeForJob;
}

function defaultDependencies(): PrepareRunDependencies {
  const workspaceStore = getResumeWorkspaceStore();
  const jobRepository = getJobRepository();

  return {
    workspaceStore,
    jobRepository,
    knowledgeStore: getKnowledgeStore(),
    rewriteStore: getResumeRewriteStore(),
    analyzeJob: runJdAnalysisForJob,
    rewriteResume: rewriteResumeForJob,
  };
}

export async function runPreparePipeline(
  input: PrepareRunInput,
  providedDependencies?: Partial<PrepareRunDependencies>,
): Promise<PrepareRunResult> {
  const dependencies = {
    ...defaultDependencies(),
    ...providedDependencies,
  } as PrepareRunDependencies;

  const workspace = await dependencies.workspaceStore.upsertCurrentWorkspace(input.userId, {
    rawResumeText: input.resumeText,
  });

  const createdJob = await dependencies.jobRepository.createJob({
    userId: input.userId,
    companyName: input.companyName,
    roleName: input.roleName,
    jdText: input.jdText,
    sourceUrl: input.sourceUrl,
  });

  const job = await dependencies.analyzeJob(createdJob.id, dependencies.jobRepository);

  const rewrite = await dependencies.rewriteResume(
    {
      jobId: createdJob.id,
      knowledgeScope: "all",
    },
    {
      workspaceStore: {
        getCurrentWorkspace: () =>
          dependencies.workspaceStore.getCurrentWorkspace?.(input.userId) ?? Promise.resolve(null),
      },
      jobRepository: {
        getJobById: (jobId) => dependencies.jobRepository.getJobById(jobId, input.userId),
      } as ResumeRewriteDependencies["jobRepository"],
      knowledgeStore: dependencies.knowledgeStore,
      rewriteStore: dependencies.rewriteStore,
    },
  );

  return {
    workspace,
    job,
    rewrite,
    status: "rewrite_ready",
  };
}
