import { POST } from "@/app/api/interview/start/route";
import { startInterviewSession } from "@/lib/services/interview-session-service";

vi.mock("@/lib/services/interview-session-service", () => ({
  startInterviewSession: vi.fn(),
}));

describe("interview start route", () => {
  it("starts a turn-based interview session", async () => {
    vi.mocked(startInterviewSession).mockResolvedValue({
      session: { id: "session-1" },
      currentQuestion: { id: "turn-1", question: "请先做一个 1 分钟自我介绍。" },
      progress: { current: 1, total: 3 },
      overview: "先问动机，再问项目。",
    } as never);

    const response = await POST(
      new Request("https://offerpilot-ai.vercel.app/api/interview/start", {
        method: "POST",
        body: JSON.stringify({
          jobId: "11111111-1111-4111-8111-111111111111",
          knowledgeScope: "all",
        }),
      }),
    );

    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toEqual({
      session: { id: "session-1" },
      currentQuestion: { id: "turn-1", question: "请先做一个 1 分钟自我介绍。" },
      progress: { current: 1, total: 3 },
      overview: "先问动机，再问项目。",
    });
  });
});
