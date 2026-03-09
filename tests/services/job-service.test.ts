import { analyzeJobDescription } from "@/lib/services/job-service";

describe("analyzeJobDescription", () => {
  it("normalizes AI output through the JD analysis schema", async () => {
    const result = await analyzeJobDescription(
      {
        companyName: "OpenAI",
        roleName: "AI Product Manager",
        jdText: "Need strong RAG intuition and metric design experience.",
      },
      {
        analyzeJd: async () => ({
          keywords: ["RAG", "metrics"],
          capabilityDimensions: [
            {
              name: "Applied AI judgment",
              importance: 5,
              evidence: ["Strong RAG intuition"],
              preparationAdvice: "Practice one retrieval system case.",
            },
          ],
          questionTypeWeights: {
            motivation: 0.1,
            ai_foundation: 0.3,
            project_deep_dive: 0.2,
            product_design: 0.1,
            metrics_evaluation: 0.2,
            business_case: 0.1,
          },
          recommendedTopics: [
            {
              topic: "RAG tradeoffs",
              reason: "The JD explicitly calls for retrieval intuition.",
              priority: 1,
            },
          ],
          recommendedActions: ["Review retrieval quality metrics."],
          overallSummary: "This role leans toward applied AI product thinking.",
        }),
      },
    );

    expect(result.keywords).toEqual(["RAG", "metrics"]);
    expect(result.capabilityDimensions[0]?.importance).toBe(5);
  });

  it("rejects invalid AI output", async () => {
    await expect(
      analyzeJobDescription(
        {
          companyName: "OpenAI",
          roleName: "AI Product Manager",
          jdText: "Need strong RAG intuition and metric design experience.",
        },
        {
          analyzeJd: async () => ({
            keywords: ["RAG"],
          }),
        },
      ),
    ).rejects.toThrow();
  });
});
