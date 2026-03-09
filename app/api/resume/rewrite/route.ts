import { NextResponse } from "next/server";

import { resumeRewriteRequestSchema } from "@/lib/ai/schemas/resume-rewrite";
import { rewriteResumeForJob } from "@/lib/services/resume-rewrite-service";

function formatRouteError(error: unknown) {
  if (!(error instanceof Error)) {
    return "Failed to rewrite resume.";
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
    const parsed = resumeRewriteRequestSchema.parse(body);
    const rewrite = await rewriteResumeForJob(parsed);

    return NextResponse.json({
      rewrite,
    });
  } catch (error) {
    return NextResponse.json(
      { error: formatRouteError(error) },
      { status: 500 },
    );
  }
}
