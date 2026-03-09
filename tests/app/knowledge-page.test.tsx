import React from "react";
import { render, screen } from "@testing-library/react";

import KnowledgePage from "@/app/knowledge/page";

describe("knowledge page", () => {
  it("renders the Chinese knowledge workspace copy", async () => {
    const Page = await KnowledgePage();
    render(Page);

    expect(
      screen.getByRole("heading", { name: /平台知识库与个人资料源/i }),
    ).toBeInTheDocument();
    expect(
      screen.getByText(/这不是开放聊天窗口，而是带引用的资料层/i),
    ).toBeInTheDocument();
  });
});
