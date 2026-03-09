import type { KnowledgeChunkContext } from "@/lib/ai/schemas/knowledge-source";
import type { ResumeWorkspaceRecord } from "@/lib/ai/schemas/resume-workspace";
import type { JobRecord } from "@/lib/services/job-repository";

export function buildResumeRewritePrompt(input: {
  workspace: ResumeWorkspaceRecord;
  job: JobRecord;
  knowledgeChunks: KnowledgeChunkContext[];
}) {
  const chunkBlock =
    input.knowledgeChunks.length > 0
      ? input.knowledgeChunks
          .map(
            (chunk) =>
              [
                `source_title: ${chunk.sourceTitle}`,
                `source_type: ${chunk.sourceType}`,
                `chunk_id: ${chunk.id}`,
                `content: ${chunk.content}`,
              ].join("\n"),
          )
          .join("\n\n---\n\n")
      : "No platform knowledge chunks were retrieved for this rewrite.";

  const analysisBlock = input.job.analysis
    ? JSON.stringify(input.job.analysis, null, 2)
    : "No structured JD analysis is available yet.";

  return [
    "Rewrite the candidate resume for the target job.",
    "Stay faithful to the supplied resume. Do not fabricate experience, metrics, ownership, or outcomes.",
    "Your job is to improve positioning, wording, and emphasis so the resume better matches the JD and likely interview screens.",
    "For every suggested change, explain why it aligns with the JD.",
    "For each revised section, surface at least one likely interview question that the rewritten wording may trigger.",
    `Target company: ${input.job.companyName ?? "Unknown company"}`,
    `Target role: ${input.job.roleName}`,
    "Target JD:",
    input.job.jdText,
    "Structured JD analysis:",
    analysisBlock,
    "Current resume summary:",
    input.workspace.resumeSummary,
    "Current rewrite focus:",
    input.workspace.rewriteFocus || "No explicit rewrite focus provided.",
    "Current key project bullets:",
    input.workspace.keyProjectBullets.map((bullet) => `- ${bullet}`).join("\n"),
    "Raw resume text:",
    input.workspace.rawResumeText,
    "Retrieved platform knowledge:",
    chunkBlock,
  ].join("\n\n");
}
