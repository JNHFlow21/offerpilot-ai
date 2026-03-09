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
    const workspace = await getResumeWorkspaceStore().getCurrentWorkspace();

    expect(workspace).toBeNull();
  });

  it("creates and updates the current workspace with structured fields", async () => {
    const store = getResumeWorkspaceStore();

    const created = await store.upsertCurrentWorkspace({
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

    const updated = await store.upsertCurrentWorkspace({
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
});
