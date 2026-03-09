import type { JdAnalysisResult } from "@/lib/ai/schemas/jd-analysis";

export interface JobRecordInput {
  companyName?: string;
  roleName: string;
  jdText: string;
}

export interface JobRecord extends JobRecordInput {
  id: string;
  createdAt: string;
  analysis?: JdAnalysisResult;
}

const jobs = new Map<string, JobRecord>();

export function createJobRecord(input: JobRecordInput) {
  const record: JobRecord = {
    id: crypto.randomUUID(),
    createdAt: new Date().toISOString(),
    ...input,
  };

  jobs.set(record.id, record);

  return record;
}

export function getJobRecord(jobId: string) {
  return jobs.get(jobId) ?? null;
}

export function setJobAnalysis(jobId: string, analysis: JdAnalysisResult) {
  const record = jobs.get(jobId);

  if (!record) {
    return null;
  }

  const updated = {
    ...record,
    analysis,
  };

  jobs.set(jobId, updated);
  return updated;
}
