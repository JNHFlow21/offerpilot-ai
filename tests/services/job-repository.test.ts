import {
  getJobRepository,
  resetMemoryJobRepository,
} from "@/lib/services/job-repository";

describe("job repository", () => {
  beforeEach(() => {
    resetMemoryJobRepository();
    vi.unstubAllEnvs();
  });

  it("falls back to the in-memory repository when DATABASE_URL is missing", async () => {
    const repository = getJobRepository();
    const created = await repository.createJob({
      companyName: "Anthropic",
      roleName: "AI PM",
      jdText: "Build eval loops for AI product quality and reliability.",
    });

    const loaded = await repository.getJobById(created.id);

    expect(loaded?.roleName).toBe("AI PM");
  });

  it("throws in production when DATABASE_URL is missing", () => {
    vi.stubEnv("NODE_ENV", "production");
    vi.stubEnv("VERCEL", "1");

    expect(() => getJobRepository()).toThrow(/database_url/i);
  });
});
