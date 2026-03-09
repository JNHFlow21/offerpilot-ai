import { NextResponse } from "next/server";

import { knowledgeQuestionInputSchema } from "@/lib/ai/schemas/knowledge-source";
import {
  askKnowledgeQuestion,
  getKnowledgeStore,
} from "@/lib/services/knowledge-service";

function formatRouteError(error: unknown) {
  if (!(error instanceof Error)) {
    return "Failed to answer knowledge question.";
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
    const parsed = knowledgeQuestionInputSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid knowledge question payload." },
        { status: 400 },
      );
    }

    const answer = await askKnowledgeQuestion(parsed.data, getKnowledgeStore());

    return NextResponse.json({
      answer,
    });
  } catch (error) {
    return NextResponse.json(
      { error: formatRouteError(error) },
      { status: 500 },
    );
  }
}
