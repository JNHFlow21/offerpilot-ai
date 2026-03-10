import React from "react";
import { render, screen } from "@testing-library/react";

import PreparePage from "@/app/prepare/page";
import { getCurrentUser } from "@/lib/auth/current-user";
import { getJobRepository } from "@/lib/services/job-repository";
import { getResumeWorkspaceStore } from "@/lib/services/resume-workspace-service";

vi.mock("@/lib/auth/current-user", () => ({
  getCurrentUser: vi.fn(),
}));

vi.mock("@/lib/services/job-repository", () => ({
  getJobRepository: vi.fn(),
}));

vi.mock("@/lib/services/resume-workspace-service", () => ({
  getResumeWorkspaceStore: vi.fn(),
}));

describe("prepare page", () => {
  it("renders the Chinese single-workspace copy", async () => {
    vi.mocked(getCurrentUser).mockResolvedValue({
      id: "user-1",
      email: "user@example.com",
    } as never);
    vi.mocked(getResumeWorkspaceStore).mockReturnValue({
      getCurrentWorkspace: vi.fn().mockResolvedValue(null),
    } as never);
    vi.mocked(getJobRepository).mockReturnValue({
      listJobs: vi.fn().mockResolvedValue([]),
    } as never);

    const Page = await PreparePage();
    render(Page);

    expect(
      screen.getByRole("heading", { name: /围绕一个目标岗位，完成简历改写与面试准备/i }),
    ).toBeInTheDocument();
    expect(screen.getByText(/当前账号：user@example.com/i)).toBeInTheDocument();
    expect(
      screen.getByText(/这不是分散的工具集合，而是一条连续主路径/i),
    ).toBeInTheDocument();
  });
});
