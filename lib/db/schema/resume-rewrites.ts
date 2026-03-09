import { jsonb, pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";

import { jobTargets } from "./job-targets";
import { resumeWorkspaces } from "./resume-workspaces";

export const resumeRewrites = pgTable("resume_rewrites", {
  id: uuid("id").primaryKey().defaultRandom(),
  workspaceId: uuid("workspace_id")
    .notNull()
    .references(() => resumeWorkspaces.id, { onDelete: "cascade" }),
  jobTargetId: uuid("job_target_id")
    .notNull()
    .references(() => jobTargets.id, { onDelete: "cascade" }),
  rewriteSummary: text("rewrite_summary").notNull(),
  sectionSuggestions: jsonb("section_suggestions").notNull().default([]),
  revisedBullets: jsonb("revised_bullets").notNull().default([]),
  interviewAngles: jsonb("interview_angles").notNull().default([]),
  rawResult: jsonb("raw_result").notNull().default({}),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});
