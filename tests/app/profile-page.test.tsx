import React from "react";
import { render, screen } from "@testing-library/react";

import ProfilePage from "@/app/profile/page";

describe("profile page", () => {
  it("renders the Chinese profile workspace copy", async () => {
    const Page = await ProfilePage();
    render(Page);

    expect(
      screen.getByRole("heading", { name: /固定你的求职基础信息/i }),
    ).toBeInTheDocument();
    expect(screen.getByText(/这页负责沉淀你长期复用的资料/i)).toBeInTheDocument();
  });
});
