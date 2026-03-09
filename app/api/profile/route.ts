import { NextResponse } from "next/server";

import { profileInputSchema } from "@/lib/ai/schemas/profile";
import { getProfileStore } from "@/lib/services/profile-service";

function formatRouteError(error: unknown) {
  if (!(error instanceof Error)) {
    return "Failed to save profile.";
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
    const profile = await getProfileStore().getProfile();

    return NextResponse.json({
      profile,
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
    const parsed = profileInputSchema.parse(body);
    const profile = await getProfileStore().upsertProfile(parsed);

    return NextResponse.json({
      profile,
    });
  } catch (error) {
    return NextResponse.json(
      { error: formatRouteError(error) },
      { status: 500 },
    );
  }
}
