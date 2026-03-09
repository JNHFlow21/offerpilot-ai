import {
  createDefaultJdAnalysisClient,
  OpenAiJdAnalysisClient,
  type JdAnalysisClient,
} from "@/lib/ai/clients";
import { buildJdAnalysisPrompt } from "@/lib/ai/prompts/jd-analysis";
import {
  jdAnalysisSchema,
  type JdAnalysisResult,
} from "@/lib/ai/schemas/jd-analysis";
import type { JobRepository } from "@/lib/services/job-repository";

export interface AnalyzeJobDescriptionInput {
  companyName?: string;
  roleName: string;
  jdText: string;
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

  return jdAnalysisSchema.parse(rawResult);
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
