import React from "react";
import { render, screen } from "@testing-library/react";
import HomePage from "@/app/page";

describe("HomePage", () => {
  it("renders the primary CTA for starting JD analysis", () => {
    render(<HomePage />);

    expect(
      screen.getByRole("heading", { name: /offerpilot/i }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("link", { name: /start with a jd/i }),
    ).toBeInTheDocument();
  });
});
