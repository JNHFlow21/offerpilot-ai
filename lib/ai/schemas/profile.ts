import { z } from "zod";

export const profileInputSchema = z.object({
  displayName: z.string().trim().max(120).optional().default(""),
  targetRoles: z.array(z.string().trim().min(1)).default([]),
  targetCity: z.string().trim().max(120).optional().default(""),
  resumeText: z.string().trim().optional().default(""),
  resumeSummary: z.string().trim().optional().default(""),
  selfIntroDraft: z.string().trim().optional().default(""),
});

export const profileRecordSchema = profileInputSchema.extend({
  id: z.string().uuid(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
});

export type ProfileInput = z.infer<typeof profileInputSchema>;
export type ProfileRecord = z.infer<typeof profileRecordSchema>;
