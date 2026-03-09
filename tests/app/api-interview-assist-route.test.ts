import { POST } from "@/app/api/interview/assist/route";
import { generateInterviewAssistForJob } from "@/lib/services/resume-rewrite-service";

vi.mock("@/lib/services/resume-rewrite-service", () => ({
  generateInterviewAssistForJob: vi.fn(),
}));

describe("interview assist route", () => {
  it("returns the interview assist payload", async () => {
    vi.mocked(generateInterviewAssistForJob).mockResolvedValue({
      overview: "Focus on product judgment, AI fundamentals, and project decision tradeoffs.",
      questions: [
        {
          question: "How did you decide what the agent workflow should optimize first?",
          followUps: [
            "What user signal told you this was the highest-priority pain point?",
            "What tradeoff did you reject and why?",
          ],
          answerFramework: [
            "Start with the user pain and context.",
            "Explain the prioritization tradeoff and chosen metric.",
            "Close with outcome and learning.",
          ],
          citations: [
            {
              sourceId: "11111111-1111-4111-8111-111111111111",
              sourceTitle: "AI PM interview note",
              chunkId: "22222222-2222-4222-8222-222222222222",
              excerpt:
                "Strong AI PM resumes translate ambiguous collaboration into concrete product decisions and outcome framing.",
            },
          ],
        },
      ],
      scopeNotice: "Questions grounded in the current resume, JD, rewrite, and retrieved sources.",
    });

    const request = new Request("http://localhost/api/interview/assist", {
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
      assist: {
        overview: "Focus on product judgment, AI fundamentals, and project decision tradeoffs.",
        questions: [
          {
            question: "How did you decide what the agent workflow should optimize first?",
            followUps: [
              "What user signal told you this was the highest-priority pain point?",
              "What tradeoff did you reject and why?",
            ],
            answerFramework: [
              "Start with the user pain and context.",
              "Explain the prioritization tradeoff and chosen metric.",
              "Close with outcome and learning.",
            ],
            citations: [
              {
                sourceId: "11111111-1111-4111-8111-111111111111",
                sourceTitle: "AI PM interview note",
                chunkId: "22222222-2222-4222-8222-222222222222",
                excerpt:
                  "Strong AI PM resumes translate ambiguous collaboration into concrete product decisions and outcome framing.",
              },
            ],
          },
        ],
        scopeNotice: "Questions grounded in the current resume, JD, rewrite, and retrieved sources.",
      },
    });
  });
});
