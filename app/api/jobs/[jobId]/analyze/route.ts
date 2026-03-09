import { NextResponse } from "next/server";

import { analyzeJobDescription } from "@/lib/services/job-service";
import { getJobRecord, setJobAnalysis } from "@/lib/services/job-store";

export async function POST(
  _request: Request,
  context: { params: Promise<{ jobId: string }> },
) {
  const { jobId } = await context.params;
  const job = getJobRecord(jobId);

  if (!job) {
    return NextResponse.json({ error: "Job target not found." }, { status: 404 });
  }

  const analysis = await analyzeJobDescription({
    companyName: job.companyName,
    roleName: job.roleName,
    jdText: job.jdText,
  });

  setJobAnalysis(jobId, analysis);

  return NextResponse.json({
    jobId,
    analysis,
  });
}
