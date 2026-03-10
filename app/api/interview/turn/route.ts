import { NextResponse } from "next/server";

import { interviewTurnRequestSchema } from "@/lib/ai/schemas/interview-session";
import { answerInterviewTurn } from "@/lib/services/interview-session-service";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const parsed = interviewTurnRequestSchema.parse(body);
    const result = await answerInterviewTurn(parsed);

    return NextResponse.json(result);
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "提交面试回答失败。" },
      { status: 500 },
    );
  }
}
