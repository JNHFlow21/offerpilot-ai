import React from "react";
import { render, screen } from "@testing-library/react";

import { PrepareWorkspace } from "@/components/prepare/prepare-workspace";

describe("PrepareWorkspace", () => {
  it("renders the resume input, rewrite output, and interview assist areas", () => {
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

    expect(screen.getByLabelText(/resume text/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/target job/i)).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /save resume workspace/i }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("heading", { name: /rewrite suggestions/i }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("heading", { name: /interview assist/i }),
    ).toBeInTheDocument();
  });
});
