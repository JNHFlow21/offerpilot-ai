import { NextResponse } from "next/server";
import { z } from "zod";

import { getJobRepository } from "@/lib/services/job-repository";

const createJobSchema = z.object({
  companyName: z.string().optional().default(""),
  roleName: z.string().min(1),
  jdText: z.string().min(20),
  sourceUrl: z.string().url().optional().or(z.literal("")).default(""),
});

function formatRouteError(error: unknown) {
  if (!(error instanceof Error)) {
    return "Failed to create job target.";
  }

  const details = error as Error & {
    code?: string;
    detail?: string;
    hint?: string;
  };

  const parts = [error.message];

  if (details.code) {
    parts[0] = `${parts[0]} (code: ${details.code})`;
  }

  if (details.detail) {
    parts.push(`Detail: ${details.detail}`);
  }

  if (details.hint) {
    parts.push(`Hint: ${details.hint}`);
  }

  return parts.join(" ");
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const parsed = createJobSchema.parse(body);
    const job = await getJobRepository().createJob(parsed);

    return NextResponse.json({
      jobId: job.id,
    });
  } catch (error) {
    const message = formatRouteError(error);

    return NextResponse.json({ error: message }, { status: 500 });
  }
}
