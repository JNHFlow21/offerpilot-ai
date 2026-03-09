import React from "react";
import { render, screen } from "@testing-library/react";

import ProfilePage from "@/app/profile/page";

describe("profile page", () => {
  it("renders the profile workspace copy", async () => {
    const Page = await ProfilePage();
    render(Page);

    expect(
      screen.getByRole("heading", { name: /build your prep profile/i }),
    ).toBeInTheDocument();
    expect(screen.getByText(/turn your raw background into reusable prep context/i)).toBeInTheDocument();
  });
});
