import { jsonb, pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";

import { jobTargets } from "./job-targets";

export const jdAnalyses = pgTable("jd_analyses", {
  id: uuid("id").primaryKey().defaultRandom(),
  jobTargetId: uuid("job_target_id")
    .notNull()
    .references(() => jobTargets.id, { onDelete: "cascade" }),
  keywords: text("keywords").array().notNull().default([]),
  capabilityDimensions: jsonb("capability_dimensions").notNull().default([]),
  questionTypeWeights: jsonb("question_type_weights").notNull().default({}),
  recommendedTopics: jsonb("recommended_topics").notNull().default([]),
  recommendedActions: jsonb("recommended_actions").notNull().default([]),
  overallSummary: text("overall_summary").notNull(),
  modelName: text("model_name"),
  modelVersion: text("model_version"),
  rawResult: jsonb("raw_result").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});
