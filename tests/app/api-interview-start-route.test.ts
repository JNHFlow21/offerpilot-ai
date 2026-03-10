import { POST } from "@/app/api/interview/start/route";
import { requireCurrentUser } from "@/lib/auth/current-user";
import { startInterviewSession } from "@/lib/services/interview-session-service";

vi.mock("@/lib/auth/current-user", () => ({
  requireCurrentUser: vi.fn(),
  isUnauthorizedError: (error: unknown) =>
    error instanceof Error && error.message === "请先登录后再继续。",
}));

vi.mock("@/lib/services/interview-session-service", () => ({
  startInterviewSession: vi.fn(),
}));

describe("interview start route", () => {
  it("returns 401 when the request is unauthenticated", async () => {
    vi.mocked(requireCurrentUser).mockRejectedValue(new Error("请先登录后再继续。"));

    const response = await POST(
      new Request("https://offerpilot-ai.vercel.app/api/interview/start", {
        method: "POST",
        body: JSON.stringify({
          jobId: "11111111-1111-4111-8111-111111111111",
          knowledgeScope: "all",
        }),
      }),
    );

    expect(response.status).toBe(401);
    await expect(response.json()).resolves.toEqual({ error: "请先登录后再继续。" });
  });

  it("starts a turn-based interview session", async () => {
    vi.mocked(requireCurrentUser).mockResolvedValue({
      id: "user-1",
      email: "user@example.com",
    } as never);
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
