import { integer, jsonb, pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";

import { knowledgeSources } from "./knowledge-sources";
import { authUsers } from "./user-profiles";

export const knowledgeChunks = pgTable("knowledge_chunks", {
  id: uuid("id").primaryKey().defaultRandom(),
  sourceId: uuid("source_id")
    .notNull()
    .references(() => knowledgeSources.id, { onDelete: "cascade" }),
  userId: uuid("user_id").references(() => authUsers.id, { onDelete: "cascade" }),
  chunkIndex: integer("chunk_index").notNull(),
  content: text("content").notNull(),
  tokenCount: integer("token_count"),
  metadata: jsonb("metadata").notNull().default({}),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});
