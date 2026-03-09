import type { KnowledgeChunkContext } from "@/lib/ai/schemas/knowledge-source";
import type { ResumeRewriteRecord } from "@/lib/ai/schemas/resume-rewrite";
import type { ResumeWorkspaceRecord } from "@/lib/ai/schemas/resume-workspace";
import type { JobRecord } from "@/lib/services/job-repository";

export function buildInterviewAssistPrompt(input: {
  workspace: ResumeWorkspaceRecord;
  job: JobRecord;
  rewrite: ResumeRewriteRecord;
  knowledgeChunks: KnowledgeChunkContext[];
}) {
  const chunkBlock =
    input.knowledgeChunks.length > 0
      ? input.knowledgeChunks
          .map(
            (chunk) =>
              [
                `source_id: ${chunk.sourceId}`,
                `source_title: ${chunk.sourceTitle}`,
                `source_type: ${chunk.sourceType}`,
                `chunk_id: ${chunk.id}`,
                `content: ${chunk.content}`,
              ].join("\n"),
          )
          .join("\n\n---\n\n")
      : "No external knowledge chunks were retrieved.";

  return [
    "Generate interview assistance for the rewritten resume.",
    "Focus on the highest-probability questions the candidate is likely to get based on the JD, rewritten bullets, and retrieved sources.",
    "Every question must include realistic follow-up points and a concise answer framework.",
    "Citations must only reference supplied chunks. If evidence is thin, keep the scopeNotice explicit.",
    `Target company: ${input.job.companyName ?? "Unknown company"}`,
    `Target role: ${input.job.roleName}`,
    "JD summary:",
    input.job.analysis?.overallSummary ?? input.job.jdText,
    "Resume summary:",
    input.workspace.resumeSummary,
    "Rewrite summary:",
    input.rewrite.rewriteSummary,
    "Revised bullets:",
    input.rewrite.revisedBullets
      .map((section) => `${section.sectionTitle}\n${section.bullets.map((bullet) => `- ${bullet}`).join("\n")}`)
      .join("\n\n"),
    "Interview angles already identified:",
    input.rewrite.interviewAngles
      .map(
        (angle) =>
          [
            `section: ${angle.sectionTitle}`,
            `likely_question: ${angle.likelyQuestion}`,
            `rationale: ${angle.rationale}`,
            `answer_focus: ${angle.answerFocus}`,
          ].join("\n"),
      )
      .join("\n\n---\n\n"),
    "Retrieved knowledge chunks:",
    chunkBlock,
  ].join("\n\n");
}
