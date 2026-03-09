import React from "react";
import { render, screen } from "@testing-library/react";

import { PrepareWorkspace } from "@/components/prepare/prepare-workspace";

describe("PrepareWorkspace", () => {
  it("renders the Chinese resume, rewrite, and interview sections", () => {
    render(
      <PrepareWorkspace
        initialWorkspace={null}
        initialJobs={[
          {
            id: "11111111-1111-4111-8111-111111111111",
            companyName: "ByteDance",
            roleName: "AI Product Intern - TRAE",
            jdText: "Need AI product thinking and cross-functional execution.",
            createdAt: "2026-03-09T00:00:00.000Z",
          },
        ]}
      />,
    );

    expect(screen.getByLabelText(/简历全文/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/目标岗位 jd/i)).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /保存简历/i }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("heading", { name: /改写建议/i }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("heading", { name: /模拟面试/i }),
    ).toBeInTheDocument();
  });
});
