import { POST } from "@/app/api/resume/rewrite/route";
import { rewriteResumeForJob } from "@/lib/services/resume-rewrite-service";

vi.mock("@/lib/services/resume-rewrite-service", () => ({
  rewriteResumeForJob: vi.fn(),
}));

describe("resume rewrite route", () => {
  it("returns the saved rewrite payload", async () => {
    vi.mocked(rewriteResumeForJob).mockResolvedValue({
      id: "rewrite-1",
      workspaceId: "22222222-2222-4222-8222-222222222222",
      jobTargetId: "11111111-1111-4111-8111-111111111111",
      rewriteSummary: "Shift the resume toward AI PM ownership.",
      sectionSuggestions: [
        {
          sectionTitle: "Project Experience",
          currentIssue: "Too execution-heavy.",
          recommendedChange: "Show product judgment and measurable outcome.",
          jdAlignmentReason: "The JD screens for AI PM execution.",
        },
      ],
      revisedBullets: [
        {
          sectionTitle: "Project Experience",
          bullets: ["Defined the workflow and aligned delivery to measurable user impact."],
        },
      ],
      interviewAngles: [
        {
          sectionTitle: "Project Experience",
          likelyQuestion: "How did you define success metrics?",
          rationale: "The bullet now claims product ownership.",
          answerFocus: "Tie the metric to user pain and delivery tradeoffs.",
        },
      ],
      createdAt: "2026-03-09T00:00:00.000Z",
      updatedAt: "2026-03-09T00:00:00.000Z",
    });

    const request = new Request("http://localhost/api/resume/rewrite", {
      method: "POST",
      headers: {
        "content-type": "application/json",
      },
      body: JSON.stringify({
        jobId: "11111111-1111-4111-8111-111111111111",
        knowledgeScope: "all",
      }),
    });

    const response = await POST(request);

    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toEqual({
      rewrite: {
        id: "rewrite-1",
        workspaceId: "22222222-2222-4222-8222-222222222222",
        jobTargetId: "11111111-1111-4111-8111-111111111111",
        rewriteSummary: "Shift the resume toward AI PM ownership.",
        sectionSuggestions: [
          {
            sectionTitle: "Project Experience",
            currentIssue: "Too execution-heavy.",
            recommendedChange: "Show product judgment and measurable outcome.",
            jdAlignmentReason: "The JD screens for AI PM execution.",
          },
        ],
        revisedBullets: [
          {
            sectionTitle: "Project Experience",
            bullets: ["Defined the workflow and aligned delivery to measurable user impact."],
          },
        ],
        interviewAngles: [
          {
            sectionTitle: "Project Experience",
            likelyQuestion: "How did you define success metrics?",
            rationale: "The bullet now claims product ownership.",
            answerFocus: "Tie the metric to user pain and delivery tradeoffs.",
          },
        ],
        createdAt: "2026-03-09T00:00:00.000Z",
        updatedAt: "2026-03-09T00:00:00.000Z",
      },
    });
  });
});
