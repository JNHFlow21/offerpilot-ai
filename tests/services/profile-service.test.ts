import {
  getProfileStore,
  resetMemoryProfileStore,
} from "@/lib/services/profile-service";

describe("profile service", () => {
  beforeEach(() => {
    resetMemoryProfileStore();
    vi.unstubAllEnvs();
  });

  it("returns null when no profile exists yet", async () => {
    const store = getProfileStore();

    await expect(store.getProfile()).resolves.toBeNull();
  });

  it("upserts and reloads the current profile in memory mode", async () => {
    const store = getProfileStore();

    const created = await store.upsertProfile({
      displayName: "Fujun",
      targetRoles: ["AI Product Intern"],
      targetCity: "Shanghai",
      resumeText: "Built AI workflow products.",
      resumeSummary: "Product-minded builder.",
      selfIntroDraft: "I turn ambiguous AI ideas into shippable products.",
    });

    const updated = await store.upsertProfile({
      displayName: "Fujun Hao",
      targetRoles: ["AI Product Intern", "PM Intern"],
      targetCity: "Shanghai",
      resumeText: "Built AI workflow products and interview prep tools.",
      resumeSummary: "Product-minded builder with applied AI experience.",
      selfIntroDraft: "I connect user needs, product logic, and AI execution.",
    });

    expect(updated.id).toBe(created.id);
    expect(updated.displayName).toBe("Fujun Hao");
    await expect(store.getProfile()).resolves.toMatchObject({
      id: created.id,
      displayName: "Fujun Hao",
      targetRoles: ["AI Product Intern", "PM Intern"],
    });
  });
});
