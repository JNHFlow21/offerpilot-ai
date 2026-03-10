import React from "react";
import { render, screen } from "@testing-library/react";

import LoginPage from "@/app/login/page";

describe("login page", () => {
  it("renders email login and hides unavailable OAuth providers by default", async () => {
    const Page = await LoginPage();
    render(Page);

    expect(
      screen.getByRole("heading", { name: /登录后开始你的求职准备/i }),
    ).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /邮箱登录/i })).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: /google 登录/i })).not.toBeInTheDocument();
    expect(screen.queryByRole("button", { name: /github 登录/i })).not.toBeInTheDocument();
    expect(screen.getByText(/google 和 github 登录暂未开放/i)).toBeInTheDocument();
  });
});
