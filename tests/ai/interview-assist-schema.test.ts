import { interviewAssistSchema } from "@/lib/ai/schemas/interview-assist";

describe("interview assist schema", () => {
  it("parses the structured interview assist payload", () => {
    const parsed = interviewAssistSchema.parse({
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
        {
          question: "What AI fundamentals did you need to understand to ship this product well?",
          followUps: [
            "Where did model limitations show up in product decisions?",
            "How did you explain those tradeoffs to non-technical partners?",
          ],
          answerFramework: [
            "Name the relevant AI capability or limitation.",
            "Tie it to a concrete product decision.",
            "Explain the user or business impact.",
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
        {
          question: "How would you measure whether the rewritten project actually worked?",
          followUps: [
            "Which leading metric would you watch first?",
            "What tradeoff metric would keep you honest?",
          ],
          answerFramework: [
            "Define the user outcome metric.",
            "Add an operational metric and a guardrail.",
            "Close with how the metric informs iteration.",
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

    expect(parsed.questions[0]?.followUps).toHaveLength(2);
    expect(parsed.questions[0]?.citations[0]?.sourceTitle).toBe("AI PM interview note");
  });
});
