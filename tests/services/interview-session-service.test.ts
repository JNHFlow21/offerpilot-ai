import { describe, expect, it, vi } from "vitest";

describe("interview session service", () => {
  it("starts a session and advances one question at a time", async () => {
    const {
      answerInterviewTurn,
      startInterviewSession,
    } = await import("@/lib/services/interview-session-service");

    const dependencies = {
      workspaceStore: {
        getCurrentWorkspace: vi.fn().mockResolvedValue({
          id: "22222222-2222-4222-8222-222222222222",
          rawResumeText: "负责 AI 产品规划和跨团队协作。",
          resumeSummary: "AI PM 候选人",
          keyProjectBullets: [],
          rewriteFocus: "",
          createdAt: "2026-03-10T00:00:00.000Z",
          updatedAt: "2026-03-10T00:00:00.000Z",
        }),
      },
      jobRepository: {
        getJobById: vi.fn().mockResolvedValue({
          id: "11111111-1111-4111-8111-111111111111",
          companyName: "字节跳动",
          roleName: "AI 产品经理实习生",
          jdText: "负责 AI 产品规划、跨团队协作与指标优化，需要超过二十个字符。",
          sourceUrl: "https://jobs.bytedance.com/trae-ai-pm",
          createdAt: "2026-03-10T00:00:00.000Z",
        }),
      },
      rewriteStore: {
        getLatestRewrite: vi.fn().mockResolvedValue({
          id: "33333333-3333-4333-8333-333333333333",
          workspaceId: "22222222-2222-4222-8222-222222222222",
          jobTargetId: "11111111-1111-4111-8111-111111111111",
          rewriteSummary: "突出 AI PM 视角和指标结果。",
          sectionSuggestions: [],
          revisedBullets: [],
          interviewAngles: [],
          createdAt: "2026-03-10T00:00:00.000Z",
          updatedAt: "2026-03-10T00:00:00.000Z",
        }),
      },
      planGenerator: vi.fn().mockResolvedValue({
        overview: "先问动机，再问项目。",
        questions: [
          {
            question: "请先做一个 1 分钟自我介绍。",
            followUps: ["为什么想做 AI 产品经理？"],
            answerFramework: ["背景", "动机", "证据"],
            citations: [],
          },
        ],
        scopeNotice: "仅基于当前 JD、简历与知识库。",
      }),
      nextQuestionGenerator: {
        generateNextPrimary: vi.fn().mockResolvedValue({
          question: "你最近一次做 AI 产品判断时，最核心的取舍是什么？",
          followUps: ["为什么当时不是另一个方向？"],
          answerFramework: ["背景", "判断标准", "结果"],
        }),
      },
      answerEvaluator: {
        evaluate: vi
          .fn()
          .mockResolvedValueOnce({
            score: 4,
            feedback: "回答结构清楚，但可以补充更直接的岗位动机。",
            referenceAnswer: "可以先讲当前背景，再讲为什么看好 AI 产品长期价值，最后补一段与你的项目经历强相关的证据。",
            shouldAskFollowUp: true,
            followUpQuestion: "为什么你想从普通 PM 转向 AI 产品经理？",
          })
          .mockResolvedValueOnce({
            score: 4,
            feedback: "追问回答到位，可以进入下一题。",
            referenceAnswer: "可以明确说明你想承担更高密度的产品判断，并用一段你亲自做取舍的项目来证明。",
            shouldAskFollowUp: false,
          }),
      },
    };

    const started = await startInterviewSession(
      { jobId: "11111111-1111-4111-8111-111111111111", knowledgeScope: "all" },
      dependencies as never,
    );

    expect(started.currentQuestion?.question).toBe("请先做一个 1 分钟自我介绍。");
    expect(started.progress.total).toBe(1);

    const afterPrimary = await answerInterviewTurn(
      {
        sessionId: started.session.id,
        answer: "我过去主要做 AI 相关产品项目，希望继续在 AI PM 方向深入。",
      },
      dependencies as never,
    );

    expect(afterPrimary.currentQuestion?.question).toBe("为什么你想从普通 PM 转向 AI 产品经理？");
    expect(afterPrimary.lastFeedback?.score).toBe(4);
    expect(afterPrimary.lastFeedback?.referenceAnswer).toMatch(/长期价值/);

    const afterFollowUp = await answerInterviewTurn(
      {
        sessionId: started.session.id,
        answer: "因为我更想做能力边界和产品化的判断，而不是只做需求转述。",
      },
      dependencies as never,
    );

    expect(afterFollowUp.currentQuestion?.question).toBe("你最近一次做 AI 产品判断时，最核心的取舍是什么？");
    expect(afterFollowUp.lastFeedback?.referenceAnswer).toMatch(/高密度的产品判断/);
    expect(afterFollowUp.progress.current).toBe(2);
  });
});
