import React from "react";
import { render, screen } from "@testing-library/react";

import JobDetailPage from "@/app/jobs/[jobId]/page";
import NewJobPage from "@/app/jobs/new/page";

describe("job pages", () => {
  it("renders the Chinese new job form fields", async () => {
    const Page = await NewJobPage();
    render(Page);

    expect(screen.getByLabelText(/公司名称/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/岗位名称/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/岗位 jd/i)).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /保存并解析 jd/i }),
    ).toBeInTheDocument();
  });

  it("renders an empty state when the job does not exist", async () => {
    const Page = await JobDetailPage({
      params: Promise.resolve({ jobId: "missing-job" }),
    });
    render(Page);

    expect(screen.getByText(/未找到该岗位 jd/i)).toBeInTheDocument();
  });
});
