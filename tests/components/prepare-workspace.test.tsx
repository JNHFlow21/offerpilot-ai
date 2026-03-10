import React from "react";
import { render, screen } from "@testing-library/react";

import { PrepareWorkspace } from "@/components/prepare/prepare-workspace";

describe("PrepareWorkspace", () => {
  it("renders the single upload form and result areas", () => {
    render(
      <PrepareWorkspace
        initialWorkspace={null}
        initialJobs={[]}
      />,
    );

    expect(screen.getByLabelText(/上传 pdf 简历/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/岗位 jd/i)).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /开始生成准备方案/i }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("heading", { name: /改写建议/i }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("heading", { name: /模拟面试/i }),
    ).toBeInTheDocument();
  });
});
