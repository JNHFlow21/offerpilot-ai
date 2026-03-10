import {
  getResumeWorkspaceStore,
  resetMemoryResumeWorkspaceStore,
} from "@/lib/services/resume-workspace-service";

describe("resume workspace service", () => {
  beforeEach(() => {
    resetMemoryResumeWorkspaceStore();
    vi.unstubAllEnvs();
  });

  it("returns null when no workspace exists", async () => {
    const workspace = await getResumeWorkspaceStore().getCurrentWorkspace("user-1");

    expect(workspace).toBeNull();
  });

  it("creates and updates the current workspace with structured fields", async () => {
    const store = getResumeWorkspaceStore();

    const created = await store.upsertCurrentWorkspace("user-1", {
      rawResumeText: [
        "Fujun Hao",
        "AI product intern focused on workflow tooling.",
        "- Built an agent workflow for meeting note synthesis.",
        "- Shipped a retrieval-based support copilot prototype.",
      ].join("\n"),
      rewriteFocus: "Push project bullets closer to AI PM screening language.",
    });

    expect(created.resumeSummary).toMatch(/AI product intern/i);
    expect(created.keyProjectBullets).toEqual([
      "Built an agent workflow for meeting note synthesis.",
      "Shipped a retrieval-based support copilot prototype.",
    ]);

    const updated = await store.upsertCurrentWorkspace("user-1", {
      rawResumeText: [
        "Fujun Hao",
        "AI product intern focused on workflow tooling.",
        "- Built an agent workflow for meeting note synthesis.",
        "- Shipped a retrieval-based support copilot prototype.",
        "- Added eval instrumentation for failure review.",
      ].join("\n"),
      resumeSummary: "Hands-on AI PM candidate with workflow and eval experience.",
      keyProjectBullets: [
        "Built an agent workflow for meeting note synthesis.",
        "Added eval instrumentation for failure review.",
      ],
      rewriteFocus: "Highlight evaluation and PM ownership.",
    });

    expect(updated.id).toBe(created.id);
    expect(updated.resumeSummary).toBe(
      "Hands-on AI PM candidate with workflow and eval experience.",
    );
    expect(updated.keyProjectBullets).toEqual([
      "Built an agent workflow for meeting note synthesis.",
      "Added eval instrumentation for failure review.",
    ]);
    expect(updated.rewriteFocus).toBe("Highlight evaluation and PM ownership.");
  });

  it("isolates current workspace by user id", async () => {
    const store = getResumeWorkspaceStore();

    await store.upsertCurrentWorkspace("user-1", {
      rawResumeText: "用户一的简历文本，突出 AI 工作流产品经验。",
    });
    await store.upsertCurrentWorkspace("user-2", {
      rawResumeText: "用户二的简历文本，突出模型评测与产品策略。",
    });

    const userOneWorkspace = await store.getCurrentWorkspace("user-1");
    const userTwoWorkspace = await store.getCurrentWorkspace("user-2");

    expect(userOneWorkspace?.rawResumeText).toContain("用户一");
    expect(userTwoWorkspace?.rawResumeText).toContain("用户二");
  });
});
