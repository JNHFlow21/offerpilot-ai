import { POST } from "@/app/api/interview/turn/route";
import { answerInterviewTurn } from "@/lib/services/interview-session-service";

vi.mock("@/lib/services/interview-session-service", () => ({
  answerInterviewTurn: vi.fn(),
}));

describe("interview turn route", () => {
  it("accepts one answer and returns the next question", async () => {
    vi.mocked(answerInterviewTurn).mockResolvedValue({
      session: { id: "session-1", status: "in_progress" },
      currentQuestion: {
        id: "turn-2",
        question: "为什么你想从普通 PM 转向 AI 产品经理？",
      },
      lastFeedback: {
        score: 4,
        feedback: "回答结构清楚，但可以补充更直接的岗位动机。",
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
      },
      progress: { current: 1, total: 3 },
    });
  });
});
