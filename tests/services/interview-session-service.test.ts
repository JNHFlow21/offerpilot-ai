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
          {
            question: "你做过最能体现产品判断的一段项目是什么？",
            followUps: ["你如何定义成功？"],
            answerFramework: ["背景", "判断", "结果"],
            citations: [],
          },
        ],
        scopeNotice: "仅基于当前 JD、简历与知识库。",
      }),
      answerEvaluator: {
        evaluate: vi
          .fn()
          .mockResolvedValueOnce({
            score: 4,
            feedback: "回答结构清楚，但可以补充更直接的岗位动机。",
            shouldAskFollowUp: true,
            followUpQuestion: "为什么你想从普通 PM 转向 AI 产品经理？",
          })
          .mockResolvedValueOnce({
            score: 4,
            feedback: "追问回答到位，可以进入下一题。",
            shouldAskFollowUp: false,
          }),
      },
    };

    const started = await startInterviewSession(
      { jobId: "11111111-1111-4111-8111-111111111111", knowledgeScope: "all" },
      dependencies as never,
    );

    expect(started.currentQuestion?.question).toBe("请先做一个 1 分钟自我介绍。");
    expect(started.progress.total).toBe(2);

    const afterPrimary = await answerInterviewTurn(
      {
        sessionId: started.session.id,
        answer: "我过去主要做 AI 相关产品项目，希望继续在 AI PM 方向深入。",
      },
      dependencies as never,
    );

    expect(afterPrimary.currentQuestion?.question).toBe("为什么你想从普通 PM 转向 AI 产品经理？");
    expect(afterPrimary.lastFeedback?.score).toBe(4);

    const afterFollowUp = await answerInterviewTurn(
      {
        sessionId: started.session.id,
        answer: "因为我更想做能力边界和产品化的判断，而不是只做需求转述。",
      },
      dependencies as never,
    );

    expect(afterFollowUp.currentQuestion?.question).toBe("你做过最能体现产品判断的一段项目是什么？");
    expect(afterFollowUp.progress.current).toBe(2);
  });
});
