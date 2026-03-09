import { z } from "zod";

export const questionTypes = [
  "motivation",
  "ai_foundation",
  "project_deep_dive",
  "product_design",
  "metrics_evaluation",
  "business_case",
 ] as const;

export const questionTypeSchema = z.enum(questionTypes);

export const jdAnalysisSchema = z.object({
  keywords: z.array(z.string().min(1)),
  capabilityDimensions: z.array(
    z.object({
      name: z.string().min(1),
      importance: z.union([
        z.literal(1),
        z.literal(2),
        z.literal(3),
        z.literal(4),
        z.literal(5),
      ]),
      evidence: z.array(z.string().min(1)),
      preparationAdvice: z.string().min(1),
    }),
  ),
  questionTypeWeights: z.record(questionTypeSchema, z.number().min(0).max(1)),
  recommendedTopics: z.array(
    z.object({
      topic: z.string().min(1),
      reason: z.string().min(1),
      priority: z.union([z.literal(1), z.literal(2), z.literal(3)]),
    }),
  ),
  recommendedActions: z.array(z.string().min(1)),
  overallSummary: z.string().min(1),
});

export type JdAnalysisResult = z.infer<typeof jdAnalysisSchema>;
export type QuestionType = z.infer<typeof questionTypeSchema>;

export const jdAnalysisJsonSchema = {
  type: "object",
  additionalProperties: false,
  properties: {
    keywords: {
      type: "array",
      items: { type: "string" },
    },
    capabilityDimensions: {
      type: "array",
      items: {
        type: "object",
        additionalProperties: false,
        properties: {
          name: { type: "string" },
          importance: { type: "integer", enum: [1, 2, 3, 4, 5] },
          evidence: {
            type: "array",
            items: { type: "string" },
          },
          preparationAdvice: { type: "string" },
        },
        required: ["name", "importance", "evidence", "preparationAdvice"],
      },
    },
    questionTypeWeights: {
      type: "object",
      additionalProperties: false,
      properties: {
        motivation: { type: "number" },
        ai_foundation: { type: "number" },
        project_deep_dive: { type: "number" },
        product_design: { type: "number" },
        metrics_evaluation: { type: "number" },
        business_case: { type: "number" },
      },
      required: [...questionTypes],
    },
    recommendedTopics: {
      type: "array",
      items: {
        type: "object",
        additionalProperties: false,
        properties: {
          topic: { type: "string" },
          reason: { type: "string" },
          priority: { type: "integer", enum: [1, 2, 3] },
        },
        required: ["topic", "reason", "priority"],
      },
    },
    recommendedActions: {
      type: "array",
      items: { type: "string" },
    },
    overallSummary: { type: "string" },
  },
  required: [
    "keywords",
    "capabilityDimensions",
    "questionTypeWeights",
    "recommendedTopics",
    "recommendedActions",
    "overallSummary",
  ],
} as const;
