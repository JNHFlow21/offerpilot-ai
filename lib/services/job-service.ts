import {
  OpenAiJdAnalysisClient,
  type JdAnalysisClient,
} from "@/lib/ai/clients";
import { buildJdAnalysisPrompt } from "@/lib/ai/prompts/jd-analysis";
import {
  jdAnalysisSchema,
  type JdAnalysisResult,
} from "@/lib/ai/schemas/jd-analysis";

export interface AnalyzeJobDescriptionInput {
  companyName?: string;
  roleName: string;
  jdText: string;
}

export async function analyzeJobDescription(
  input: AnalyzeJobDescriptionInput,
  client: JdAnalysisClient = new OpenAiJdAnalysisClient(),
): Promise<JdAnalysisResult> {
  const prompt = buildJdAnalysisPrompt(input);
  const rawResult = await client.analyzeJd({
    ...input,
    prompt,
  });

  return jdAnalysisSchema.parse(rawResult);
}
