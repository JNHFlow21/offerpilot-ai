import React from "react";
import { render, screen } from "@testing-library/react";

import PreparePage from "@/app/prepare/page";

describe("prepare page", () => {
  it("renders the Chinese single-workspace copy", async () => {
    const Page = await PreparePage();
    render(Page);

    expect(
      screen.getByRole("heading", { name: /围绕一个目标岗位，完成简历改写与面试准备/i }),
    ).toBeInTheDocument();
    expect(
      screen.getByText(/这不是分散的工具集合，而是一条连续主路径/i),
    ).toBeInTheDocument();
  });
});
