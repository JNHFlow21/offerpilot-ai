import { z } from "zod";

const resumeBulletSchema = z.string().trim().min(1).max(280);

export const resumeWorkspaceInputSchema = z.object({
  rawResumeText: z.string().trim().min(20),
  resumeSummary: z.string().trim().max(400).optional().default(""),
  keyProjectBullets: z.array(resumeBulletSchema).max(8).optional().default([]),
  rewriteFocus: z.string().trim().max(400).optional().default(""),
});

export const resumeWorkspaceRecordSchema = resumeWorkspaceInputSchema.extend({
  id: z.string().uuid(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
});

export type ResumeWorkspaceInput = z.infer<typeof resumeWorkspaceInputSchema>;
export type ResumeWorkspaceRecord = z.infer<typeof resumeWorkspaceRecordSchema>;
