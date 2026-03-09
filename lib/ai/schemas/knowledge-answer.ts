import { z } from "zod";

export const knowledgeAnswerSchema = z.object({
  answer: z.string().trim().min(1),
  citations: z.array(
    z.object({
      sourceId: z.string().trim().min(1),
      sourceTitle: z.string().trim().min(1),
      chunkId: z.string().trim().min(1),
      excerpt: z.string().trim().min(1),
    }),
  ),
  scopeNotice: z.string().trim().min(1),
});

export type KnowledgeAnswer = z.infer<typeof knowledgeAnswerSchema>;

export const knowledgeAnswerJsonSchema = {
  type: "object",
  additionalProperties: false,
  properties: {
    answer: { type: "string" },
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
    scopeNotice: { type: "string" },
  },
  required: ["answer", "citations", "scopeNotice"],
} as const;
