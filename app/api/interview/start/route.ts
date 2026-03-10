import { NextResponse } from "next/server";

import { interviewStartRequestSchema } from "@/lib/ai/schemas/interview-session";
import { startInterviewSession } from "@/lib/services/interview-session-service";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const parsed = interviewStartRequestSchema.parse(body);
    const result = await startInterviewSession(parsed);

    return NextResponse.json(result);
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "启动模拟面试失败。" },
      { status: 500 },
    );
  }
}
