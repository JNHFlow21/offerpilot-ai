import { integer, pgSchema, pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";

const authSchema = pgSchema("auth");

export const authUsers = authSchema.table("users", {
  id: uuid("id").primaryKey(),
});

export const userProfiles = pgTable("user_profiles", {
  id: uuid("id").primaryKey().defaultRandom(),
  displayName: text("display_name"),
  targetRoles: text("target_roles").array().notNull().default([]),
  targetCity: text("target_city"),
  yearsOfExperience: integer("years_of_experience"),
  resumeText: text("resume_text"),
  resumeSummary: text("resume_summary"),
  selfIntroDraft: text("self_intro_draft"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});
