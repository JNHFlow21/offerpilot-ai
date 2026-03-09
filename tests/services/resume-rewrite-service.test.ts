import { rewriteResumeForJob } from "@/lib/services/resume-rewrite-service";

describe("resume rewrite service", () => {
  it("returns a structured rewrite with reasons and linked interview angles", async () => {
    const result = await rewriteResumeForJob(
      {
        jobId: "11111111-1111-4111-8111-111111111111",
        knowledgeScope: "all",
      },
      {
        workspaceStore: {
          getCurrentWorkspace: vi.fn().mockResolvedValue({
            id: "22222222-2222-4222-8222-222222222222",
            rawResumeText: [
              "Fujun Hao",
              "AI product intern focused on workflow tooling.",
              "- Built an agent workflow for meeting note synthesis.",
              "- Shipped a retrieval-based support copilot prototype.",
            ].join("\n"),
            resumeSummary: "AI product intern focused on workflow tooling.",
            keyProjectBullets: [
              "Built an agent workflow for meeting note synthesis.",
              "Shipped a retrieval-based support copilot prototype.",
            ],
            rewriteFocus: "Highlight AI PM ownership and outcome framing.",
            createdAt: "2026-03-09T00:00:00.000Z",
            updatedAt: "2026-03-09T00:00:00.000Z",
          }),
        },
        jobRepository: {
          getJobById: vi.fn().mockResolvedValue({
            id: "11111111-1111-4111-8111-111111111111",
            companyName: "ByteDance",
            roleName: "AI Product Intern - TRAE",
            jdText: "Need strong AI fundamentals, cross-functional execution, and product thinking.",
            createdAt: "2026-03-09T00:00:00.000Z",
            analysis: {
              keywords: ["AI fundamentals", "cross-functional execution"],
              capabilityDimensions: [],
              questionTypeWeights: {
                motivation: 0.1,
                ai_foundation: 0.25,
                project_deep_dive: 0.2,
                product_design: 0.2,
                metrics_evaluation: 0.15,
                business_case: 0.1,
              },
              recommendedTopics: [],
              recommendedActions: ["Show concrete ownership."],
              overallSummary: "The role wants applied AI PM judgment.",
            },
          }),
        },
        knowledgeStore: {
          listChunkContexts: vi.fn().mockResolvedValue([
            {
              id: "33333333-3333-4333-8333-333333333333",
              sourceId: "44444444-4444-4444-8444-444444444444",
              sourceTitle: "AI PM interview note",
              sourceType: "interview_note",
              chunkIndex: 0,
              content:
                "Strong AI PM resumes translate ambiguous collaboration into concrete product decisions and outcome framing.",
              tokenCount: 18,
              metadata: {},
              createdAt: "2026-03-09T00:00:00.000Z",
            },
          ]),
        },
        rewriteStore: {
          saveRewrite: vi.fn().mockImplementation(
            async (workspaceId, jobId, rewrite) => ({
              id: "55555555-5555-4555-8555-555555555555",
              workspaceId,
              jobTargetId: jobId,
              createdAt: "2026-03-09T00:00:00.000Z",
              updatedAt: "2026-03-09T00:00:00.000Z",
              ...rewrite,
            }),
          ),
        },
      },
      {
        rewrite: vi.fn().mockResolvedValue({
          rewriteSummary:
            "Shift the resume from feature shipping language toward AI PM ownership and product judgment.",
          sectionSuggestions: [
            {
              sectionTitle: "Project Experience",
              currentIssue: "The bullets describe delivery tasks but not product ownership.",
              recommendedChange:
                "Reframe each bullet around problem framing, decision-making, and measurable outcome.",
              jdAlignmentReason:
                "The JD screens for cross-functional AI product execution rather than pure execution support.",
            },
          ],
          revisedBullets: [
            {
              sectionTitle: "Project Experience",
              bullets: [
                "Defined the note-synthesis workflow for an agent product, aligning engineering delivery with user workflow bottlenecks.",
                "Framed retrieval-copilot iterations around support deflection and answer quality, then coordinated implementation with engineering.",
              ],
            },
          ],
          interviewAngles: [
            {
              sectionTitle: "Project Experience",
              likelyQuestion:
                "How did you decide what the agent workflow should optimize first?",
              rationale:
                "The revised bullet introduces prioritization and product judgment.",
              answerFocus:
                "Explain the user pain, tradeoff, chosen metric, and how you aligned engineering execution.",
            },
          ],
        }),
      },
    );

    expect(result.rewriteSummary).toMatch(/AI PM ownership/i);
    expect(result.sectionSuggestions[0]?.jdAlignmentReason).toMatch(
      /cross-functional AI product execution/i,
    );
    expect(result.interviewAngles[0]?.likelyQuestion).toMatch(/optimize first/i);
    expect(result.revisedBullets[0]?.bullets[0]).toMatch(/Defined the note-synthesis workflow/i);
  });
});
