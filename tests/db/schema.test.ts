import { jdAnalyses, jobTargets, userProfiles } from "@/lib/db/schema";

describe("phase 1 database schema", () => {
  it("exports the three required tables", () => {
    expect(userProfiles).toBeDefined();
    expect(jobTargets).toBeDefined();
    expect(jdAnalyses).toBeDefined();
  });

  it("includes the expected key columns", () => {
    expect(userProfiles.resumeText.name).toBe("resume_text");
    expect(jobTargets.jdText.name).toBe("jd_text");
    expect(jdAnalyses.overallSummary.name).toBe("overall_summary");
  });
});
