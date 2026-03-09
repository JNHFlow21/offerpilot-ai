import React from "react";
import { render, screen } from "@testing-library/react";

import { PrepareWorkspace } from "@/components/prepare/prepare-workspace";

describe("PrepareWorkspace flow", () => {
  it("renders the Chinese single-workspace steps in order", () => {
    render(
      <PrepareWorkspace
        initialWorkspace={null}
        initialJobs={[
          {
            id: "11111111-1111-4111-8111-111111111111",
            companyName: "字节跳动",
            roleName: "AI 产品实习生",
            jdText: "需要 AI 产品思维和跨团队推进能力。",
            createdAt: "2026-03-09T00:00:00.000Z",
          },
        ]}
      />,
    );

    expect(screen.getByText(/步骤 1/i)).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: /我的简历/i })).toBeInTheDocument();
    expect(screen.getByText(/步骤 2/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/目标岗位 jd/i)).toBeInTheDocument();
    expect(screen.getByText(/步骤 3/i)).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: /改写建议/i })).toBeInTheDocument();
    expect(screen.getByText(/步骤 4/i)).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: /模拟面试/i })).toBeInTheDocument();
    expect(screen.queryByText(/knowledge/i)).not.toBeInTheDocument();
  });
});
