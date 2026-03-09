import { NextResponse } from "next/server";
import { z } from "zod";

import { getJobRepository } from "@/lib/services/job-repository";

const createJobSchema = z.object({
  companyName: z.string().optional().default(""),
  roleName: z.string().min(1),
  jdText: z.string().min(20),
});

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const parsed = createJobSchema.parse(body);
    const job = await getJobRepository().createJob(parsed);

    return NextResponse.json({
      jobId: job.id,
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to create job target.";

    return NextResponse.json({ error: message }, { status: 500 });
  }
}
