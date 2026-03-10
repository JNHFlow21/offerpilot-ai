import { describe, expect, it, vi } from "vitest";

describe("prepare run service", () => {
  it("returns rewrite-ready results without blocking on interview generation", async () => {
    const { runPreparePipeline } = await import("@/lib/services/prepare-run-service");
    const generateInterviewAssist = vi.fn();
    const workspaceStore = {
      upsertCurrentWorkspace: vi.fn().mockResolvedValue({
        id: "workspace-1",
        rawResumeText:
          "负责 AI 产品从调研到上线，推进算法、设计、研发协作并跟踪指标结果，主导多个功能迭代落地。",
        resumeSummary: "AI 产品实习生，具备协作与落地经验。",
        keyProjectBullets: ["推动功能上线并跟踪指标"],
        rewriteFocus: "",
        createdAt: "2026-03-10T00:00:00.000Z",
        updatedAt: "2026-03-10T00:00:00.000Z",
      }),
    };
    const jobRepository = {
      createJob: vi.fn().mockResolvedValue({
        id: "job-1",
        companyName: "字节跳动",
        roleName: "AI 产品经理实习生",
        jdText: "负责 AI 产品规划、跨团队协作与指标优化，需要超过二十个字符。",
        sourceUrl: "https://jobs.bytedance.com/trae-ai-pm",
        createdAt: "2026-03-10T00:00:00.000Z",
      }),
      getJobById: vi.fn().mockResolvedValue({
        id: "job-1",
        companyName: "字节跳动",
        roleName: "AI 产品经理实习生",
        jdText: "负责 AI 产品规划、跨团队协作与指标优化，需要超过二十个字符。",
        sourceUrl: "https://jobs.bytedance.com/trae-ai-pm",
        createdAt: "2026-03-10T00:00:00.000Z",
      }),
      saveAnalysis: vi.fn().mockResolvedValue({
        id: "job-1",
        companyName: "字节跳动",
        roleName: "AI 产品经理实习生",
        jdText: "负责 AI 产品规划、跨团队协作与指标优化，需要超过二十个字符。",
        sourceUrl: "https://jobs.bytedance.com/trae-ai-pm",
        createdAt: "2026-03-10T00:00:00.000Z",
        analysis: {
          overallSummary: "岗位强调 AI 产品判断、协作和落地。",
          keywords: ["AI 产品", "跨团队协作"],
          capabilityDimensions: [
            {
              name: "产品判断",
              preparationAdvice: "准备需求分析与优先级案例。",
            },
          ],
          questionTypeWeights: {
            motivation: 0.2,
            ai_foundation: 0.2,
            project_deep_dive: 0.2,
            product_design: 0.2,
            metrics_evaluation: 0.1,
            business_case: 0.1,
          },
          recommendedTopics: ["产品规划"],
          recommendedActions: ["重写项目经历"],
        },
      }),
    };

    const result = await runPreparePipeline(
      {
        userId: "user-1",
        companyName: "字节跳动",
        roleName: "AI 产品经理实习生",
        jdText: "负责 AI 产品规划、跨团队协作与指标优化，需要超过二十个字符。",
        sourceUrl: "https://jobs.bytedance.com/trae-ai-pm",
        resumeText:
          "负责 AI 产品从调研到上线，推进算法、设计、研发协作并跟踪指标结果，主导多个功能迭代落地。",
      },
      {
        workspaceStore,
        jobRepository,
        analyzeJob: vi.fn().mockResolvedValue({
          id: "job-1",
          companyName: "字节跳动",
          roleName: "AI 产品经理实习生",
          jdText: "负责 AI 产品规划、跨团队协作与指标优化，需要超过二十个字符。",
          sourceUrl: "https://jobs.bytedance.com/trae-ai-pm",
          createdAt: "2026-03-10T00:00:00.000Z",
          analysis: {
            overallSummary: "岗位强调 AI 产品判断、协作和落地。",
            keywords: ["AI 产品", "跨团队协作"],
            capabilityDimensions: [
              {
                name: "产品判断",
                preparationAdvice: "准备需求分析与优先级案例。",
              },
            ],
            questionTypeWeights: {
              motivation: 0.2,
              ai_foundation: 0.2,
              project_deep_dive: 0.2,
              product_design: 0.2,
              metrics_evaluation: 0.1,
              business_case: 0.1,
            },
            recommendedTopics: ["产品规划"],
            recommendedActions: ["重写项目经历"],
          },
        }),
        rewriteResume: vi.fn().mockResolvedValue({
          id: "rewrite-1",
          workspaceId: "workspace-1",
          jobTargetId: "job-1",
          rewriteSummary: "建议突出 AI 产品 owner 视角和指标结果。",
          sectionSuggestions: [
            {
              sectionTitle: "项目经历",
              currentIssue: "表述偏执行，不够贴岗位。",
              recommendedChange: "增加目标、决策和结果。",
              jdAlignmentReason: "更贴岗位要求的产品判断与落地能力。",
            },
          ],
          revisedBullets: [
            {
              sectionTitle: "项目经历",
              bullets: ["主导 AI 功能迭代，并以指标结果衡量效果。"],
            },
          ],
          interviewAngles: [
            {
              sectionTitle: "项目经历",
              likelyQuestion: "你如何定义 AI 功能成功？",
              rationale: "岗位关注指标意识。",
              answerFocus: "目标、指标、实验和迭代。",
            },
          ],
          createdAt: "2026-03-10T00:00:00.000Z",
          updatedAt: "2026-03-10T00:00:00.000Z",
        }),
        generateInterviewAssist,
      },
    );

    expect(result.workspace.id).toBe("workspace-1");
    expect(result.job.id).toBe("job-1");
    expect(result.rewrite.id).toBe("rewrite-1");
    expect(result.status).toBe("rewrite_ready");
    expect(workspaceStore.upsertCurrentWorkspace).toHaveBeenCalledWith("user-1", {
      rawResumeText:
        "负责 AI 产品从调研到上线，推进算法、设计、研发协作并跟踪指标结果，主导多个功能迭代落地。",
    });
    expect(jobRepository.createJob).toHaveBeenCalledWith({
      userId: "user-1",
      companyName: "字节跳动",
      roleName: "AI 产品经理实习生",
      jdText: "负责 AI 产品规划、跨团队协作与指标优化，需要超过二十个字符。",
      sourceUrl: "https://jobs.bytedance.com/trae-ai-pm",
    });
    expect(generateInterviewAssist).not.toHaveBeenCalled();
  });
});
