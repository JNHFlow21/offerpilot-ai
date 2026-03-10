import { z } from "zod";

import { knowledgeScopeSchema } from "./knowledge-source";

export const interviewQuestionOutlineSchema = z.object({
  question: z.string().trim().min(1),
  followUps: z.array(z.string().trim().min(1)).default([]),
  answerFramework: z.array(z.string().trim().min(1)).default([]),
});

export const interviewSessionRecordSchema = z.object({
  id: z.string().uuid(),
  workspaceId: z.string().uuid(),
  jobTargetId: z.string().uuid(),
  status: z.enum(["in_progress", "completed"]),
  currentTurnIndex: z.number().int().nonnegative(),
  outline: z.array(interviewQuestionOutlineSchema),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
});

export const interviewTurnRecordSchema = z.object({
  id: z.string().uuid(),
  sessionId: z.string().uuid(),
  turnIndex: z.number().int().nonnegative(),
  kind: z.enum(["primary", "follow_up"]),
  question: z.string().trim().min(1),
  answer: z.string().trim().min(1).nullable(),
  feedback: z.string().trim().min(1).nullable(),
  score: z.number().int().min(1).max(5).nullable(),
  status: z.enum(["asked", "answered", "completed"]),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
});

export const interviewStartRequestSchema = z.object({
  jobId: z.string().uuid(),
  knowledgeScope: knowledgeScopeSchema.default("all"),
});

export const interviewTurnRequestSchema = z.object({
  sessionId: z.string().uuid(),
  answer: z.string().trim().min(1),
});

export const interviewTurnEvaluationSchema = z.object({
  score: z.number().int().min(1).max(5),
  feedback: z.string().trim().min(1),
  shouldAskFollowUp: z.boolean().default(false),
  followUpQuestion: z.string().trim().min(1).optional(),
});

export type InterviewQuestionOutline = z.infer<typeof interviewQuestionOutlineSchema>;
export type InterviewSessionRecord = z.infer<typeof interviewSessionRecordSchema>;
export type InterviewTurnRecord = z.infer<typeof interviewTurnRecordSchema>;
export type InterviewStartRequest = z.infer<typeof interviewStartRequestSchema>;
export type InterviewTurnRequest = z.infer<typeof interviewTurnRequestSchema>;
export type InterviewTurnEvaluation = z.infer<typeof interviewTurnEvaluationSchema>;
