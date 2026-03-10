import { integer, jsonb, pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";

import { jobTargets } from "./job-targets";
import { resumeWorkspaces } from "./resume-workspaces";

export const interviewSessions = pgTable("interview_sessions", {
  id: uuid("id").primaryKey().defaultRandom(),
  workspaceId: uuid("workspace_id")
    .notNull()
    .references(() => resumeWorkspaces.id, { onDelete: "cascade" }),
  jobTargetId: uuid("job_target_id")
    .notNull()
    .references(() => jobTargets.id, { onDelete: "cascade" }),
  status: text("status").notNull().default("in_progress"),
  currentTurnIndex: integer("current_turn_index").notNull().default(0),
  outline: jsonb("outline").notNull().default([]),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});
