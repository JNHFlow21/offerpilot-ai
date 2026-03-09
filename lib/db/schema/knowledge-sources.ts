import { jsonb, pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";

import { jobTargets } from "./job-targets";
import { authUsers } from "./user-profiles";

export const knowledgeSources = pgTable("knowledge_sources", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id").references(() => authUsers.id, { onDelete: "cascade" }),
  sourceType: text("source_type").notNull(),
  title: text("title").notNull(),
  contentText: text("content_text").notNull(),
  jobTargetId: uuid("job_target_id").references(() => jobTargets.id, {
    onDelete: "set null",
  }),
  metadata: jsonb("metadata").notNull().default({}),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});
