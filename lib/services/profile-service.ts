import { desc, eq } from "drizzle-orm";

import type { ProfileInput, ProfileRecord } from "@/lib/ai/schemas/profile";
import { profileRecordSchema } from "@/lib/ai/schemas/profile";
import { getDb } from "@/lib/db/client";
import { userProfiles } from "@/lib/db/schema";

export interface ProfileStore {
  getProfile(): Promise<ProfileRecord | null>;
  upsertProfile(input: ProfileInput): Promise<ProfileRecord>;
}

function normalizeOptionalText(value?: string) {
  const trimmed = value?.trim();
  return trimmed ? trimmed : null;
}

function normalizeRoles(roles: string[]) {
  return roles
    .map((role) => role.trim())
    .filter(Boolean)
    .filter((role, index, array) => array.indexOf(role) === index);
}

function toProfileRecord(row: typeof userProfiles.$inferSelect) {
  return profileRecordSchema.parse({
    id: row.id,
    displayName: row.displayName ?? "",
    targetRoles: row.targetRoles,
    targetCity: row.targetCity ?? "",
    resumeText: row.resumeText ?? "",
    resumeSummary: row.resumeSummary ?? "",
    selfIntroDraft: row.selfIntroDraft ?? "",
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
  });
}

let memoryProfile: ProfileRecord | null = null;

class MemoryProfileStore implements ProfileStore {
  async getProfile() {
    return memoryProfile;
  }

  async upsertProfile(input: ProfileInput) {
    const now = new Date().toISOString();

    memoryProfile = profileRecordSchema.parse({
      id: memoryProfile?.id ?? crypto.randomUUID(),
      displayName: input.displayName,
      targetRoles: normalizeRoles(input.targetRoles),
      targetCity: input.targetCity,
      resumeText: input.resumeText,
      resumeSummary: input.resumeSummary,
      selfIntroDraft: input.selfIntroDraft,
      createdAt: memoryProfile?.createdAt ?? now,
      updatedAt: now,
    });

    return memoryProfile;
  }
}

class PostgresProfileStore implements ProfileStore {
  async getProfile() {
    const db = getDb();
    const [profile] = await db
      .select()
      .from(userProfiles)
      .orderBy(desc(userProfiles.updatedAt))
      .limit(1);

    return profile ? toProfileRecord(profile) : null;
  }

  async upsertProfile(input: ProfileInput) {
    const db = getDb();
    const current = await this.getProfile();

    if (!current) {
      const [created] = await db
        .insert(userProfiles)
        .values({
          displayName: normalizeOptionalText(input.displayName),
          targetRoles: normalizeRoles(input.targetRoles),
          targetCity: normalizeOptionalText(input.targetCity),
          resumeText: normalizeOptionalText(input.resumeText),
          resumeSummary: normalizeOptionalText(input.resumeSummary),
          selfIntroDraft: normalizeOptionalText(input.selfIntroDraft),
        })
        .returning();

      return toProfileRecord(created);
    }

    const [updated] = await db
      .update(userProfiles)
      .set({
        displayName: normalizeOptionalText(input.displayName),
        targetRoles: normalizeRoles(input.targetRoles),
        targetCity: normalizeOptionalText(input.targetCity),
        resumeText: normalizeOptionalText(input.resumeText),
        resumeSummary: normalizeOptionalText(input.resumeSummary),
        selfIntroDraft: normalizeOptionalText(input.selfIntroDraft),
        updatedAt: new Date(),
      })
      .where(eq(userProfiles.id, current.id))
      .returning();

    return toProfileRecord(updated);
  }
}

const memoryStore = new MemoryProfileStore();

export function getProfileStore(): ProfileStore {
  if (process.env.DATABASE_URL) {
    return new PostgresProfileStore();
  }

  if (process.env.NODE_ENV === "production" || process.env.VERCEL) {
    throw new Error("DATABASE_URL is required in production environments.");
  }

  return memoryStore;
}

export function resetMemoryProfileStore() {
  memoryProfile = null;
}
