import {
  createDefaultJdAnalysisClient,
  OpenAiJdAnalysisClient,
  type JdAnalysisClient,
} from "@/lib/ai/clients";
import { buildJdAnalysisPrompt } from "@/lib/ai/prompts/jd-analysis";
import {
  jdAnalysisSchema,
  type QuestionType,
  type JdAnalysisResult,
} from "@/lib/ai/schemas/jd-analysis";
import type { JobRepository } from "@/lib/services/job-repository";

export interface AnalyzeJobDescriptionInput {
  companyName?: string;
  roleName: string;
  jdText: string;
}

const questionTypeAliasMap: Record<string, QuestionType> = {
  motivation: "motivation",
  "motivation and fit": "motivation",
  "candidate motivation": "motivation",
  "technical ai knowledge": "ai_foundation",
  "ai fundamentals": "ai_foundation",
  "ai foundation": "ai_foundation",
  "product sense and strategy": "product_design",
  "product strategy": "product_design",
  "product design": "product_design",
  "project deep dive": "project_deep_dive",
  "project deep-dive": "project_deep_dive",
  "project walkthrough": "project_deep_dive",
  "experimentation and analytics": "metrics_evaluation",
  experimentation: "metrics_evaluation",
  analytics: "metrics_evaluation",
  "metrics and evaluation": "metrics_evaluation",
  "business case": "business_case",
  "business judgment": "business_case",
};

function emptyQuestionTypeWeights(): Record<QuestionType, number> {
  return {
    motivation: 0,
    ai_foundation: 0,
    project_deep_dive: 0,
    product_design: 0,
    metrics_evaluation: 0,
    business_case: 0,
  };
}

function normalizeQuestionTypeWeights(rawValue: unknown) {
  const normalized = emptyQuestionTypeWeights();

  if (!rawValue || typeof rawValue !== "object") {
    return normalized;
  }

  for (const [key, value] of Object.entries(rawValue as Record<string, unknown>)) {
    const normalizedKey =
      questionTypeAliasMap[key.trim().toLowerCase()] ??
      (key in normalized ? (key as QuestionType) : null);

    if (!normalizedKey) {
      continue;
    }

    if (typeof value === "number" && Number.isFinite(value)) {
      normalized[normalizedKey] = value;
    }
  }

  return normalized;
}

function normalizeJdAnalysisResult(rawResult: unknown) {
  if (!rawResult || typeof rawResult !== "object") {
    return rawResult;
  }

  const result = rawResult as Record<string, unknown>;

  return {
    ...result,
    questionTypeWeights: normalizeQuestionTypeWeights(result.questionTypeWeights),
  };
}

export async function analyzeJobDescription(
  input: AnalyzeJobDescriptionInput,
  client: JdAnalysisClient = createDefaultJdAnalysisClient(),
): Promise<JdAnalysisResult> {
  const prompt = buildJdAnalysisPrompt(input);
  const rawResult = await client.analyzeJd({
    ...input,
    prompt,
  });

  return jdAnalysisSchema.parse(normalizeJdAnalysisResult(rawResult));
}

export async function runJdAnalysisForJob(
  jobId: string,
  repository: Pick<JobRepository, "getJobById" | "saveAnalysis">,
  client: JdAnalysisClient = createDefaultJdAnalysisClient(),
) {
  const job = await repository.getJobById(jobId);

  if (!job) {
    throw new Error("Job target not found.");
  }

  const analysis = await analyzeJobDescription(
    {
      companyName: job.companyName,
      roleName: job.roleName,
      jdText: job.jdText,
    },
    client,
  );

  const updated = await repository.saveAnalysis(jobId, analysis);

  if (!updated) {
    throw new Error("Failed to persist JD analysis.");
  }

  return updated;
}
