import { POST } from "@/app/api/interview/turn/route";
import { requireCurrentUser } from "@/lib/auth/current-user";
import { answerInterviewTurn } from "@/lib/services/interview-session-service";

vi.mock("@/lib/auth/current-user", () => ({
  requireCurrentUser: vi.fn(),
  isUnauthorizedError: (error: unknown) =>
    error instanceof Error && error.message === "请先登录后再继续。",
}));

vi.mock("@/lib/services/interview-session-service", () => ({
  answerInterviewTurn: vi.fn(),
}));

describe("interview turn route", () => {
  it("returns 401 when the request is unauthenticated", async () => {
    vi.mocked(requireCurrentUser).mockRejectedValue(new Error("请先登录后再继续。"));

    const response = await POST(
      new Request("https://offerpilot-ai.vercel.app/api/interview/turn", {
        method: "POST",
        body: JSON.stringify({
          sessionId: "44444444-4444-4444-8444-444444444444",
          answer: "因为我更想做能力边界和产品化判断。",
        }),
      }),
    );

    expect(response.status).toBe(401);
    await expect(response.json()).resolves.toEqual({ error: "请先登录后再继续。" });
  });

  it("accepts one answer and returns the next question", async () => {
    vi.mocked(requireCurrentUser).mockResolvedValue({
      id: "user-1",
      email: "user@example.com",
    } as never);
    vi.mocked(answerInterviewTurn).mockResolvedValue({
      session: { id: "session-1", status: "in_progress" },
      currentQuestion: {
        id: "turn-2",
        question: "为什么你想从普通 PM 转向 AI 产品经理？",
      },
      lastFeedback: {
        score: 4,
        feedback: "回答结构清楚，但可以补充更直接的岗位动机。",
        referenceAnswer: "先讲背景，再讲动机，最后补证据。",
      },
      progress: { current: 1, total: 3 },
    } as never);

    const response = await POST(
      new Request("https://offerpilot-ai.vercel.app/api/interview/turn", {
        method: "POST",
        body: JSON.stringify({
          sessionId: "44444444-4444-4444-8444-444444444444",
          answer: "因为我更想做能力边界和产品化判断。",
        }),
      }),
    );

    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toEqual({
      session: { id: "session-1", status: "in_progress" },
      currentQuestion: {
        id: "turn-2",
        question: "为什么你想从普通 PM 转向 AI 产品经理？",
      },
      lastFeedback: {
        score: 4,
        feedback: "回答结构清楚，但可以补充更直接的岗位动机。",
        referenceAnswer: "先讲背景，再讲动机，最后补证据。",
      },
      progress: { current: 1, total: 3 },
    });
  });
});
