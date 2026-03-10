import { integer, pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";

import { interviewSessions } from "./interview-sessions";

export const interviewTurns = pgTable("interview_turns", {
  id: uuid("id").primaryKey().defaultRandom(),
  sessionId: uuid("session_id")
    .notNull()
    .references(() => interviewSessions.id, { onDelete: "cascade" }),
  turnIndex: integer("turn_index").notNull(),
  kind: text("kind").notNull().default("primary"),
  question: text("question").notNull(),
  answer: text("answer"),
  feedback: text("feedback"),
  score: integer("score"),
  status: text("status").notNull().default("asked"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});
