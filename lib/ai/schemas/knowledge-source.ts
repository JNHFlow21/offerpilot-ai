import { z } from "zod";

export const sourceTypes = [
  "jd",
  "resume",
  "project",
  "interview_note",
  "knowledge_note",
] as const;

export const knowledgeScopes = ["all", ...sourceTypes] as const;

export const sourceTypeSchema = z.enum(sourceTypes);
export const knowledgeScopeSchema = z.enum(knowledgeScopes);

const metadataSchema = z.record(z.string(), z.unknown());

export const knowledgeSourceInputSchema = z.object({
  sourceType: sourceTypeSchema,
  title: z.string().trim().min(1).max(160),
  contentText: z.string().trim().min(20),
  jobTargetId: z.string().uuid().optional(),
  metadata: metadataSchema.optional().default({}),
});

export const knowledgeSourceRecordSchema = knowledgeSourceInputSchema.extend({
  id: z.string().uuid(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
});

export const knowledgeChunkRecordSchema = z.object({
  id: z.string().uuid(),
  sourceId: z.string().uuid(),
  chunkIndex: z.number().int().nonnegative(),
  content: z.string().min(1),
  tokenCount: z.number().int().nullable(),
  metadata: metadataSchema,
  createdAt: z.string().datetime(),
});

export const knowledgeChunkContextSchema = knowledgeChunkRecordSchema.extend({
  sourceTitle: z.string().min(1),
  sourceType: sourceTypeSchema,
});

export const knowledgeQuestionInputSchema = z.object({
  question: z.string().trim().min(4),
  scope: knowledgeScopeSchema.default("all"),
});

export type SourceType = z.infer<typeof sourceTypeSchema>;
export type KnowledgeScope = z.infer<typeof knowledgeScopeSchema>;
export type KnowledgeSourceInput = z.infer<typeof knowledgeSourceInputSchema>;
export type KnowledgeSourceRecord = z.infer<typeof knowledgeSourceRecordSchema>;
export type KnowledgeChunkRecord = z.infer<typeof knowledgeChunkRecordSchema>;
export type KnowledgeChunkContext = z.infer<typeof knowledgeChunkContextSchema>;
export type KnowledgeQuestionInput = z.infer<typeof knowledgeQuestionInputSchema>;
