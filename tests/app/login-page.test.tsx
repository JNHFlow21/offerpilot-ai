import React from "react";
import { render, screen } from "@testing-library/react";

import LoginPage from "@/app/login/page";

describe("login page", () => {
  it("renders Chinese login entry points", async () => {
    const Page = await LoginPage();
    render(Page);

    expect(
      screen.getByRole("heading", { name: /登录后开始你的求职准备/i }),
    ).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /邮箱登录/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /google 登录/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /github 登录/i })).toBeInTheDocument();
  });
});
