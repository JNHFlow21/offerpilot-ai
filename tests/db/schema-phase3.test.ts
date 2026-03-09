import {
  resumeRewrites,
  resumeWorkspaces,
} from "@/lib/db/schema";

describe("phase 3 database schema", () => {
  it("exports the resume rewrite tables", () => {
    expect(resumeWorkspaces).toBeDefined();
    expect(resumeRewrites).toBeDefined();
  });

  it("includes the expected key columns", () => {
    expect(resumeWorkspaces.rawResumeText.name).toBe("raw_resume_text");
    expect(resumeWorkspaces.keyProjectBullets.name).toBe("key_project_bullets");
    expect(resumeRewrites.workspaceId.name).toBe("workspace_id");
    expect(resumeRewrites.revisedBullets.name).toBe("revised_bullets");
  });
});
