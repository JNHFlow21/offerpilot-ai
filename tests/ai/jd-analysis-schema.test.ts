import { jdAnalysisSchema } from "@/lib/ai/schemas/jd-analysis";

describe("jdAnalysisSchema", () => {
  it("accepts a valid JD analysis payload", () => {
    const parsed = jdAnalysisSchema.parse({
      keywords: ["RAG", "evaluation"],
      capabilityDimensions: [
        {
          name: "AI fundamentals",
          importance: 5,
          evidence: ["Must understand RAG systems"],
          preparationAdvice: "Review retrieval and evaluation basics.",
        },
      ],
      questionTypeWeights: {
        motivation: 0.1,
        ai_foundation: 0.3,
        project_deep_dive: 0.2,
        product_design: 0.2,
        metrics_evaluation: 0.2,
        business_case: 0,
      },
      recommendedTopics: [
        {
          topic: "RAG evaluation",
          reason: "The JD emphasizes reliability and measurement.",
          priority: 1,
        },
      ],
      recommendedActions: ["Practice one RAG case study answer."],
      overallSummary: "Strong emphasis on applied AI product judgment.",
    });

    expect(parsed.overallSummary).toContain("AI");
  });

  it("rejects a payload missing required fields", () => {
    expect(() =>
      jdAnalysisSchema.parse({
        keywords: ["RAG"],
      }),
    ).toThrow();
  });
});
