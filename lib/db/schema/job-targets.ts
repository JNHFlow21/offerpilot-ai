import { text, timestamp, uuid, pgTable } from "drizzle-orm/pg-core";

import { authUsers } from "./user-profiles";

export const jobTargets = pgTable("job_targets", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id").references(() => authUsers.id, { onDelete: "cascade" }),
  companyName: text("company_name"),
  roleName: text("role_name").notNull(),
  targetCity: text("target_city"),
  jobSourceUrl: text("job_source_url"),
  jdText: text("jd_text").notNull(),
  status: text("status").notNull().default("draft"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});
