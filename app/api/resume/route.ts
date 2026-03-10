import { NextResponse } from "next/server";

import { resumeWorkspaceInputSchema } from "@/lib/ai/schemas/resume-workspace";
import {
  isUnauthorizedError,
  requireCurrentUser,
} from "@/lib/auth/current-user";
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
    const user = await requireCurrentUser();
    const workspace = await getResumeWorkspaceStore().getCurrentWorkspace(user.id);

    return NextResponse.json({
      workspace,
    });
  } catch (error) {
    if (isUnauthorizedError(error)) {
      return NextResponse.json({ error: error.message }, { status: 401 });
    }

    return NextResponse.json(
      { error: formatRouteError(error) },
      { status: 500 },
    );
  }
}

export async function POST(request: Request) {
  try {
    const user = await requireCurrentUser();
    const body = await request.json();
    const parsed = resumeWorkspaceInputSchema.parse(body);
    const workspace = await getResumeWorkspaceStore().upsertCurrentWorkspace(user.id, parsed);

    return NextResponse.json({
      workspace,
    });
  } catch (error) {
    if (isUnauthorizedError(error)) {
      return NextResponse.json({ error: error.message }, { status: 401 });
    }

    return NextResponse.json(
      { error: formatRouteError(error) },
      { status: 500 },
    );
  }
}
