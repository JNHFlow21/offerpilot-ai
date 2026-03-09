import React from "react";
import { render, screen } from "@testing-library/react";

import JobDetailPage from "@/app/jobs/[jobId]/page";
import NewJobPage from "@/app/jobs/new/page";

describe("job pages", () => {
  it("renders the new job form fields", async () => {
    const Page = await NewJobPage();
    render(Page);

    expect(screen.getByLabelText(/company name/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/role name/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/job description/i)).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /analyze jd/i }),
    ).toBeInTheDocument();
  });

  it("renders an empty state when the job does not exist", async () => {
    const Page = await JobDetailPage({
      params: Promise.resolve({ jobId: "missing-job" }),
    });
    render(Page);

    expect(screen.getByText(/job target not found/i)).toBeInTheDocument();
  });
});
