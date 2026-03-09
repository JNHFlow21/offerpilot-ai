import { NextResponse } from "next/server";

import { knowledgeSourceInputSchema } from "@/lib/ai/schemas/knowledge-source";
import { getKnowledgeStore } from "@/lib/services/knowledge-service";

function formatRouteError(error: unknown) {
  if (!(error instanceof Error)) {
    return "Failed to process knowledge source.";
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
    const sources = await getKnowledgeStore().listSources();

    return NextResponse.json({
      sources,
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
    const parsed = knowledgeSourceInputSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid knowledge source payload." },
        { status: 400 },
      );
    }

    const result = await getKnowledgeStore().createSource(parsed.data);

    return NextResponse.json({
      source: result.source,
      chunkCount: result.chunks.length,
    });
  } catch (error) {
    return NextResponse.json(
      { error: formatRouteError(error) },
      { status: 500 },
    );
  }
}
