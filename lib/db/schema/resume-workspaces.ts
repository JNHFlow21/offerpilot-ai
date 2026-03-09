import { jsonb, pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";

import { authUsers } from "./user-profiles";

export const resumeWorkspaces = pgTable("resume_workspaces", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id").references(() => authUsers.id, { onDelete: "cascade" }),
  rawResumeText: text("raw_resume_text").notNull(),
  resumeSummary: text("resume_summary"),
  keyProjectBullets: jsonb("key_project_bullets").notNull().default([]),
  rewriteFocus: text("rewrite_focus"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});
