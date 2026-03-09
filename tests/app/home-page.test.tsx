import React from "react";
import { render, screen } from "@testing-library/react";
import HomePage from "@/app/page";

describe("HomePage", () => {
  it("renders the Chinese homepage CTA for entering the workspace", () => {
    render(<HomePage />);

    expect(
      screen.getByRole("heading", { name: /offerpilot/i }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("link", { name: /进入工作台/i }),
    ).toBeInTheDocument();
  });
});
