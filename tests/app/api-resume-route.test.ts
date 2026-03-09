import { GET, POST } from "@/app/api/resume/route";
import { getResumeWorkspaceStore } from "@/lib/services/resume-workspace-service";

vi.mock("@/lib/services/resume-workspace-service", () => ({
  getResumeWorkspaceStore: vi.fn(),
}));

describe("resume route", () => {
  it("returns an empty payload when the workspace does not exist", async () => {
    vi.mocked(getResumeWorkspaceStore).mockReturnValue({
      getCurrentWorkspace: vi.fn().mockResolvedValue(null),
    } as never);

    const response = await GET();

    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toEqual({
      workspace: null,
    });
  });

  it("upserts the current workspace and returns the saved payload", async () => {
    vi.mocked(getResumeWorkspaceStore).mockReturnValue({
      upsertCurrentWorkspace: vi.fn().mockResolvedValue({
        id: "workspace-123",
        rawResumeText: "Built AI product workflows.",
        resumeSummary: "AI PM intern with workflow delivery experience.",
        keyProjectBullets: [
          "Built AI product workflows.",
          "Partnered with engineering on delivery.",
        ],
        rewriteFocus: "Match AI PM JD language.",
        createdAt: "2026-03-09T00:00:00.000Z",
        updatedAt: "2026-03-09T00:00:00.000Z",
      }),
    } as never);

    const request = new Request("http://localhost/api/resume", {
      method: "POST",
      headers: {
        "content-type": "application/json",
      },
      body: JSON.stringify({
        rawResumeText: "Built AI product workflows.",
        rewriteFocus: "Match AI PM JD language.",
      }),
    });

    const response = await POST(request);

    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toEqual({
      workspace: {
        id: "workspace-123",
        rawResumeText: "Built AI product workflows.",
        resumeSummary: "AI PM intern with workflow delivery experience.",
        keyProjectBullets: [
          "Built AI product workflows.",
          "Partnered with engineering on delivery.",
        ],
        rewriteFocus: "Match AI PM JD language.",
        createdAt: "2026-03-09T00:00:00.000Z",
        updatedAt: "2026-03-09T00:00:00.000Z",
      },
    });
  });
});
