export interface BuildJdAnalysisPromptInput {
  companyName?: string;
  roleName: string;
  jdText: string;
}

export function buildJdAnalysisPrompt({
  companyName,
  roleName,
  jdText,
}: BuildJdAnalysisPromptInput) {
  return [
    "You are an AI hiring-prep analyst.",
    "Read the job description and convert it into a preparation plan for an AI/product candidate.",
    "Return only structured data that matches the schema.",
    "For questionTypeWeights, you must use exactly these keys and no others:",
    "motivation, ai_foundation, project_deep_dive, product_design, metrics_evaluation, business_case.",
    "",
    `Company: ${companyName ?? "Unknown"}`,
    `Role: ${roleName}`,
    "Job description:",
    jdText.trim(),
  ].join("\n");
}
