import { NextResponse } from "next/server";

import { interviewTurnRequestSchema } from "@/lib/ai/schemas/interview-session";
import { isUnauthorizedError, requireCurrentUser } from "@/lib/auth/current-user";
import { answerInterviewTurn } from "@/lib/services/interview-session-service";

export async function POST(request: Request) {
  try {
    const user = await requireCurrentUser();
    const body = await request.json();
    const parsed = interviewTurnRequestSchema.parse(body);
    const result = await answerInterviewTurn({
      ...parsed,
      userId: user.id,
    });

    return NextResponse.json(result);
  } catch (error) {
    if (isUnauthorizedError(error)) {
      return NextResponse.json({ error: error.message }, { status: 401 });
    }

    return NextResponse.json(
      { error: error instanceof Error ? error.message : "提交面试回答失败。" },
      { status: 500 },
    );
  }
}
