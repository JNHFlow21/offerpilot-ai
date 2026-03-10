import React from "react";
import { render, screen } from "@testing-library/react";

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
    expect(screen.queryByText(/knowledge/i)).not.toBeInTheDocument();
  });
});
