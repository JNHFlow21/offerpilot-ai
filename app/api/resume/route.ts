import { NextResponse } from "next/server";

import { resumeWorkspaceInputSchema } from "@/lib/ai/schemas/resume-workspace";
import { getResumeWorkspaceStore } from "@/lib/services/resume-workspace-service";

function formatRouteError(error: unknown) {
  if (!(error instanceof Error)) {
    return "Failed to save resume workspace.";
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

export async function GET() {
  try {
    const workspace = await getResumeWorkspaceStore().getCurrentWorkspace();

    return NextResponse.json({
      workspace,
    });
  } catch (error) {
    return NextResponse.json(
      { error: formatRouteError(error) },
      { status: 500 },
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const parsed = resumeWorkspaceInputSchema.parse(body);
    const workspace = await getResumeWorkspaceStore().upsertCurrentWorkspace(parsed);

    return NextResponse.json({
      workspace,
    });
  } catch (error) {
    return NextResponse.json(
      { error: formatRouteError(error) },
      { status: 500 },
    );
  }
}
