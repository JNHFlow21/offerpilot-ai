import React from "react";
import { render, screen } from "@testing-library/react";

import PreparePage from "@/app/prepare/page";

describe("prepare page", () => {
  it("renders the resume rewrite workspace copy", async () => {
    const Page = await PreparePage();
    render(Page);

    expect(
      screen.getByRole("heading", { name: /rewrite your story for one target role/i }),
    ).toBeInTheDocument();
    expect(
      screen.getByText(/keep the workspace narrow: one resume, one target jd, one prep path/i),
    ).toBeInTheDocument();
  });
});
