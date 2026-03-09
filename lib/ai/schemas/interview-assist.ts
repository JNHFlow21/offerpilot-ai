import { z } from "zod";

import { knowledgeAnswerSchema } from "@/lib/ai/schemas/knowledge-answer";
import { resumeRewriteRequestSchema } from "@/lib/ai/schemas/resume-rewrite";

const interviewAssistQuestionSchema = z.object({
  question: z.string().trim().min(1).max(220),
  followUps: z.array(z.string().trim().min(1).max(220)).min(1).max(4),
  answerFramework: z.array(z.string().trim().min(1).max(220)).min(2).max(5),
  citations: knowledgeAnswerSchema.shape.citations.max(3),
});

export const interviewAssistRequestSchema = resumeRewriteRequestSchema;

export const interviewAssistSchema = z.object({
  overview: z.string().trim().min(1).max(320),
  questions: z.array(interviewAssistQuestionSchema).min(3).max(6),
  scopeNotice: z.string().trim().min(1).max(220),
});

export type InterviewAssistRequest = z.infer<typeof interviewAssistRequestSchema>;
export type InterviewAssistResult = z.infer<typeof interviewAssistSchema>;

export const interviewAssistJsonSchema = {
  type: "object",
  additionalProperties: false,
  properties: {
    overview: { type: "string" },
    questions: {
      type: "array",
      items: {
        type: "object",
        additionalProperties: false,
        properties: {
          question: { type: "string" },
          followUps: {
            type: "array",
            items: { type: "string" },
          },
          answerFramework: {
            type: "array",
            items: { type: "string" },
          },
          citations: {
            type: "array",
            items: {
              type: "object",
              additionalProperties: false,
              properties: {
                sourceId: { type: "string" },
                sourceTitle: { type: "string" },
                chunkId: { type: "string" },
                excerpt: { type: "string" },
              },
              required: ["sourceId", "sourceTitle", "chunkId", "excerpt"],
            },
          },
        },
        required: ["question", "followUps", "answerFramework", "citations"],
      },
    },
    scopeNotice: { type: "string" },
  },
  required: ["overview", "questions", "scopeNotice"],
} as const;
