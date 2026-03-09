import React from "react";
import { render, screen } from "@testing-library/react";

import KnowledgePage from "@/app/knowledge/page";

describe("knowledge page", () => {
  it("renders the bounded knowledge workspace copy", async () => {
    const Page = await KnowledgePage();
    render(Page);

    expect(
      screen.getByRole("heading", { name: /build your bounded prep knowledge/i }),
    ).toBeInTheDocument();
    expect(
      screen.getByText(/save only the material you want the system to cite back/i),
    ).toBeInTheDocument();
  });
});
