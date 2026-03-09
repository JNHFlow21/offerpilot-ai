import { desc, eq } from "drizzle-orm";

import type {
  ResumeWorkspaceInput,
  ResumeWorkspaceRecord,
} from "@/lib/ai/schemas/resume-workspace";
import {
  resumeWorkspaceInputSchema,
  resumeWorkspaceRecordSchema,
} from "@/lib/ai/schemas/resume-workspace";
import { getDb } from "@/lib/db/client";
import { resumeWorkspaces } from "@/lib/db/schema";

export interface ResumeWorkspaceStore {
  getCurrentWorkspace(): Promise<ResumeWorkspaceRecord | null>;
  upsertCurrentWorkspace(input: ResumeWorkspaceInput): Promise<ResumeWorkspaceRecord>;
}

function normalizeOptionalText(value?: string) {
  const trimmed = value?.trim();
  return trimmed ? trimmed : null;
}

function normalizeBullets(bullets: string[]) {
  return bullets
    .map((bullet) => bullet.trim())
    .filter(Boolean)
    .filter((bullet, index, array) => array.indexOf(bullet) === index)
    .slice(0, 8);
}

function normalizeResumeLine(line: string) {
  return line.replace(/^[-*•\d.()\s]+/u, "").trim();
}

function inferSummary(rawResumeText: string) {
  const lines = rawResumeText
    .split(/\n+/u)
    .map((line) => line.trim())
    .filter(Boolean)
    .filter((line) => normalizeResumeLine(line).length >= 12);

  const narrativeLine = lines.find((line) => !/^[-*•\d.]/u.test(line));

  return normalizeResumeLine(narrativeLine ?? lines[0] ?? "");
}

function inferProjectBullets(rawResumeText: string) {
  const lines = rawResumeText
    .split(/\n+/u)
    .map((line) => line.trim())
    .filter(Boolean);

  const explicitBullets = lines
    .filter((line) => /^[-*•\d.]/u.test(line))
    .map(normalizeResumeLine)
    .filter((line) => line.length >= 12);

  if (explicitBullets.length > 0) {
    return normalizeBullets(explicitBullets);
  }

  return normalizeBullets(
    lines
      .map(normalizeResumeLine)
      .filter((line) => line.length >= 24)
      .slice(0, 5),
  );
}

function toResumeWorkspaceRecord(row: typeof resumeWorkspaces.$inferSelect) {
  return resumeWorkspaceRecordSchema.parse({
    id: row.id,
    rawResumeText: row.rawResumeText,
    resumeSummary: row.resumeSummary ?? "",
    keyProjectBullets: Array.isArray(row.keyProjectBullets)
      ? row.keyProjectBullets
      : [],
    rewriteFocus: row.rewriteFocus ?? "",
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
  });
}

function buildWorkspacePayload(input: ResumeWorkspaceInput) {
  const parsed = resumeWorkspaceInputSchema.parse(input);
  const inferredSummary = inferSummary(parsed.rawResumeText);
  const inferredBullets = inferProjectBullets(parsed.rawResumeText);

  return {
    rawResumeText: parsed.rawResumeText.trim(),
    resumeSummary: parsed.resumeSummary.trim() || inferredSummary,
    keyProjectBullets:
      parsed.keyProjectBullets.length > 0
        ? normalizeBullets(parsed.keyProjectBullets)
        : inferredBullets,
    rewriteFocus: parsed.rewriteFocus.trim(),
  };
}

let memoryWorkspace: ResumeWorkspaceRecord | null = null;

class MemoryResumeWorkspaceStore implements ResumeWorkspaceStore {
  async getCurrentWorkspace() {
    return memoryWorkspace;
  }

  async upsertCurrentWorkspace(input: ResumeWorkspaceInput) {
    const now = new Date().toISOString();
    const payload = buildWorkspacePayload(input);

    memoryWorkspace = resumeWorkspaceRecordSchema.parse({
      id: memoryWorkspace?.id ?? crypto.randomUUID(),
      createdAt: memoryWorkspace?.createdAt ?? now,
      updatedAt: now,
      ...payload,
    });

    return memoryWorkspace;
  }
}

class PostgresResumeWorkspaceStore implements ResumeWorkspaceStore {
  async getCurrentWorkspace() {
    const db = getDb();
    const [workspace] = await db
      .select()
      .from(resumeWorkspaces)
      .orderBy(desc(resumeWorkspaces.updatedAt))
      .limit(1);

    return workspace ? toResumeWorkspaceRecord(workspace) : null;
  }

  async upsertCurrentWorkspace(input: ResumeWorkspaceInput) {
    const db = getDb();
    const current = await this.getCurrentWorkspace();
    const payload = buildWorkspacePayload(input);

    if (!current) {
      const [created] = await db
        .insert(resumeWorkspaces)
        .values({
          userId: null,
          rawResumeText: payload.rawResumeText,
          resumeSummary: normalizeOptionalText(payload.resumeSummary),
          keyProjectBullets: payload.keyProjectBullets,
          rewriteFocus: normalizeOptionalText(payload.rewriteFocus),
        })
        .returning();

      return toResumeWorkspaceRecord(created);
    }

    const [updated] = await db
      .update(resumeWorkspaces)
      .set({
        rawResumeText: payload.rawResumeText,
        resumeSummary: normalizeOptionalText(payload.resumeSummary),
        keyProjectBullets: payload.keyProjectBullets,
        rewriteFocus: normalizeOptionalText(payload.rewriteFocus),
        updatedAt: new Date(),
      })
      .where(eq(resumeWorkspaces.id, current.id))
      .returning();

    return toResumeWorkspaceRecord(updated);
  }
}

const memoryStore = new MemoryResumeWorkspaceStore();

export function getResumeWorkspaceStore(): ResumeWorkspaceStore {
  if (process.env.DATABASE_URL) {
    return new PostgresResumeWorkspaceStore();
  }

  if (process.env.NODE_ENV === "production" || process.env.VERCEL) {
    throw new Error("DATABASE_URL is required in production environments.");
  }

  return memoryStore;
}

export function resetMemoryResumeWorkspaceStore() {
  memoryWorkspace = null;
}
