import React from "react";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";

import { PrepareWorkspace } from "@/components/prepare/prepare-workspace";

describe("PrepareWorkspace flow", () => {
  it("renders the Chinese single-workspace steps in order", () => {
    render(
      <PrepareWorkspace
        initialWorkspace={null}
        initialJobs={[]}
      />,
    );

    expect(screen.getByText(/步骤 1/i)).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: /我的简历/i })).toBeInTheDocument();
    expect(screen.getByText(/步骤 2/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/岗位 jd/i)).toBeInTheDocument();
    expect(screen.getByText(/步骤 3/i)).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: /改写建议/i })).toBeInTheDocument();
    expect(screen.getByText(/步骤 4/i)).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: /模拟面试/i })).toBeInTheDocument();
    expect(screen.getAllByText(/一问一答的模拟面试/i).length).toBeGreaterThan(0);
    expect(screen.queryByText(/knowledge/i)).not.toBeInTheDocument();
  });

  it("starts a turn-based interview after prepare completes", async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          workspace: {
            id: "22222222-2222-4222-8222-222222222222",
            rawResumeText: "负责 AI 产品规划和跨团队协作。",
            resumeSummary: "AI PM 候选人",
            keyProjectBullets: [],
            rewriteFocus: "",
            createdAt: "2026-03-10T00:00:00.000Z",
            updatedAt: "2026-03-10T00:00:00.000Z",
          },
          job: {
            id: "11111111-1111-4111-8111-111111111111",
            companyName: "字节跳动",
            roleName: "AI 产品经理实习生",
            jdText: "负责 AI 产品规划、跨团队协作与指标优化，需要超过二十个字符。",
            createdAt: "2026-03-10T00:00:00.000Z",
          },
          rewrite: {
            id: "33333333-3333-4333-8333-333333333333",
            workspaceId: "22222222-2222-4222-8222-222222222222",
            jobTargetId: "11111111-1111-4111-8111-111111111111",
            rewriteSummary: "突出 AI PM 视角和指标结果。",
            sectionSuggestions: [],
            revisedBullets: [],
            interviewAngles: [],
            createdAt: "2026-03-10T00:00:00.000Z",
            updatedAt: "2026-03-10T00:00:00.000Z",
          },
          status: "rewrite_ready",
        }),
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          session: {
            id: "44444444-4444-4444-8444-444444444444",
            status: "in_progress",
          },
          currentQuestion: {
            id: "turn-1",
            question: "请先做一个 1 分钟自我介绍。",
          },
          progress: { current: 1, total: 2 },
          overview: "先问动机，再问项目。",
        }),
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          session: {
            id: "44444444-4444-4444-8444-444444444444",
            status: "in_progress",
          },
          currentQuestion: {
            id: "turn-2",
            question: "你做过最能体现产品判断的一段项目是什么？",
          },
          lastFeedback: {
            score: 4,
            feedback: "回答结构清楚，但可以补充更直接的岗位动机。",
          },
          progress: { current: 2, total: 2 },
        }),
      });

    vi.stubGlobal("fetch", fetchMock);

    render(<PrepareWorkspace initialWorkspace={null} initialJobs={[]} />);

    fireEvent.change(screen.getByLabelText(/上传 pdf 简历/i), {
      target: {
        files: [new File([new Uint8Array([1, 2, 3])], "resume.pdf", { type: "application/pdf" })],
      },
    });
    fireEvent.change(screen.getByLabelText(/岗位名称/i), {
      target: { value: "AI 产品经理实习生" },
    });
    fireEvent.change(screen.getByLabelText(/岗位 jd/i), {
      target: { value: "负责 AI 产品规划、跨团队协作与指标优化，需要超过二十个字符。" },
    });

    fireEvent.submit(screen.getByRole("button", { name: /开始生成准备方案/i }).closest("form")!);

    await screen.findByRole("button", { name: /开始模拟面试/i });

    fireEvent.click(screen.getByRole("button", { name: /开始模拟面试/i }));

    await screen.findByText(/请先做一个 1 分钟自我介绍/i);

    fireEvent.change(screen.getByLabelText(/我的回答/i), {
      target: { value: "我过去主要做 AI 相关产品项目，希望继续在 AI PM 方向深入。" },
    });
    fireEvent.click(screen.getByRole("button", { name: /提交这一题/i }));

    await screen.findByText(/你做过最能体现产品判断的一段项目是什么/i);
    await waitFor(() => {
      expect(screen.getByText(/回答结构清楚，但可以补充更直接的岗位动机/i)).toBeInTheDocument();
    });
  });
});
