import { z } from "zod";

import { knowledgeScopeSchema } from "@/lib/ai/schemas/knowledge-source";

const revisedBulletGroupSchema = z.object({
  sectionTitle: z.string().trim().min(1).max(120),
  bullets: z.array(z.string().trim().min(1).max(280)).min(1).max(6),
});

const sectionSuggestionSchema = z.object({
  sectionTitle: z.string().trim().min(1).max(120),
  currentIssue: z.string().trim().min(1).max(280),
  recommendedChange: z.string().trim().min(1).max(320),
  jdAlignmentReason: z.string().trim().min(1).max(320),
});

const interviewAngleSchema = z.object({
  sectionTitle: z.string().trim().min(1).max(120),
  likelyQuestion: z.string().trim().min(1).max(220),
  rationale: z.string().trim().min(1).max(280),
  answerFocus: z.string().trim().min(1).max(320),
});

export const resumeRewriteRequestSchema = z.object({
  jobId: z.string().uuid(),
  knowledgeScope: knowledgeScopeSchema.default("all"),
});

export const resumeRewriteSchema = z.object({
  rewriteSummary: z.string().trim().min(1).max(400),
  sectionSuggestions: z.array(sectionSuggestionSchema).min(1).max(6),
  revisedBullets: z.array(revisedBulletGroupSchema).min(1).max(6),
  interviewAngles: z.array(interviewAngleSchema).min(1).max(8),
});

export const resumeRewriteRecordSchema = resumeRewriteSchema.extend({
  id: z.string().uuid(),
  workspaceId: z.string().uuid(),
  jobTargetId: z.string().uuid(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
});

export type ResumeRewriteRequest = z.infer<typeof resumeRewriteRequestSchema>;
export type ResumeRewriteResult = z.infer<typeof resumeRewriteSchema>;
export type ResumeRewriteRecord = z.infer<typeof resumeRewriteRecordSchema>;

export const resumeRewriteJsonSchema = {
  type: "object",
  additionalProperties: false,
  properties: {
    rewriteSummary: { type: "string" },
    sectionSuggestions: {
      type: "array",
      items: {
        type: "object",
        additionalProperties: false,
        properties: {
          sectionTitle: { type: "string" },
          currentIssue: { type: "string" },
          recommendedChange: { type: "string" },
          jdAlignmentReason: { type: "string" },
        },
        required: [
          "sectionTitle",
          "currentIssue",
          "recommendedChange",
          "jdAlignmentReason",
        ],
      },
    },
    revisedBullets: {
      type: "array",
      items: {
        type: "object",
        additionalProperties: false,
        properties: {
          sectionTitle: { type: "string" },
          bullets: {
            type: "array",
            items: { type: "string" },
          },
        },
        required: ["sectionTitle", "bullets"],
      },
    },
    interviewAngles: {
      type: "array",
      items: {
        type: "object",
        additionalProperties: false,
        properties: {
          sectionTitle: { type: "string" },
          likelyQuestion: { type: "string" },
          rationale: { type: "string" },
          answerFocus: { type: "string" },
        },
        required: ["sectionTitle", "likelyQuestion", "rationale", "answerFocus"],
      },
    },
  },
  required: ["rewriteSummary", "sectionSuggestions", "revisedBullets", "interviewAngles"],
} as const;
