import {
  interviewSessions,
  interviewTurns,
} from "@/lib/db/schema";

describe("phase 4 interview database schema", () => {
  it("exports the interview tables", () => {
    expect(interviewSessions).toBeDefined();
    expect(interviewTurns).toBeDefined();
  });

  it("includes the expected key columns", () => {
    expect(interviewSessions.jobTargetId.name).toBe("job_target_id");
    expect(interviewSessions.workspaceId.name).toBe("workspace_id");
    expect(interviewSessions.status.name).toBe("status");
    expect(interviewTurns.sessionId.name).toBe("session_id");
    expect(interviewTurns.question.name).toBe("question");
    expect(interviewTurns.answer.name).toBe("answer");
    expect(interviewTurns.score.name).toBe("score");
  });
});
