import { NextResponse } from "next/server";

import { getJobRepository } from "@/lib/services/job-repository";
import { runJdAnalysisForJob } from "@/lib/services/job-service";

export async function POST(
  _request: Request,
  context: { params: Promise<{ jobId: string }> },
) {
  const { jobId } = await context.params;
  const repository = getJobRepository();

  try {
    const job = await runJdAnalysisForJob(jobId, repository);

    return NextResponse.json({
      jobId,
      analysis: job.analysis,
    });
  } catch (error) {
    if (error instanceof Error && error.message === "Job target not found.") {
      return NextResponse.json({ error: error.message }, { status: 404 });
    }

    throw error;
  }
}
