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
      userId: "user-1",
      companyName: "Anthropic",
      roleName: "AI PM",
      jdText: "Build eval loops for AI product quality and reliability.",
    });

    const loaded = await repository.getJobById(created.id, "user-1");

    expect(loaded?.roleName).toBe("AI PM");
  });

  it("lists and loads jobs only for the requested user", async () => {
    const repository = getJobRepository();

    const first = await repository.createJob({
      userId: "user-1",
      companyName: "Anthropic",
      roleName: "AI PM",
      jdText: "Build eval loops for AI product quality and reliability.",
    });

    await repository.createJob({
      userId: "user-2",
      companyName: "OpenAI",
      roleName: "Growth PM",
      jdText: "Drive product growth experiments and user retention analysis.",
    });

    const jobs = await repository.listJobs("user-1");
    const visibleJob = await repository.getJobById(first.id, "user-1");
    const hiddenJob = await repository.getJobById(first.id, "user-2");

    expect(jobs).toHaveLength(1);
    expect(visibleJob?.roleName).toBe("AI PM");
    expect(hiddenJob).toBeNull();
  });

  it("throws in production when DATABASE_URL is missing", () => {
    vi.stubEnv("NODE_ENV", "production");
    vi.stubEnv("VERCEL", "1");

    expect(() => getJobRepository()).toThrow(/database_url/i);
  });
});
