import { NextResponse } from "next/server";

import { interviewAssistRequestSchema } from "@/lib/ai/schemas/interview-assist";
import { generateInterviewAssistForJob } from "@/lib/services/resume-rewrite-service";

function formatRouteError(error: unknown) {
  if (!(error instanceof Error)) {
    return "Failed to generate interview assist.";
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
    const parsed = interviewAssistRequestSchema.parse(body);
    const assist = await generateInterviewAssistForJob(parsed);

    return NextResponse.json({
      assist,
    });
  } catch (error) {
    return NextResponse.json(
      { error: formatRouteError(error) },
      { status: 500 },
    );
  }
}
