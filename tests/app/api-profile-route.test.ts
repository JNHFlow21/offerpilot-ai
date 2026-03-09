import { GET, POST } from "@/app/api/profile/route";
import { getProfileStore } from "@/lib/services/profile-service";

vi.mock("@/lib/services/profile-service", () => ({
  getProfileStore: vi.fn(),
}));

describe("profile route", () => {
  it("returns an empty payload when the profile does not exist", async () => {
    vi.mocked(getProfileStore).mockReturnValue({
      getProfile: vi.fn().mockResolvedValue(null),
    } as never);

    const response = await GET();

    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toEqual({
      profile: null,
    });
  });

  it("upserts the profile and returns the saved payload", async () => {
    vi.mocked(getProfileStore).mockReturnValue({
      upsertProfile: vi.fn().mockResolvedValue({
        id: "profile-123",
        displayName: "Fujun",
        targetRoles: ["AI Product Intern"],
        targetCity: "Shanghai",
        resumeText: "Built AI workflow products.",
        resumeSummary: "Product-minded builder.",
        selfIntroDraft: "I turn AI ideas into product systems.",
        createdAt: "2026-03-09T00:00:00.000Z",
        updatedAt: "2026-03-09T00:00:00.000Z",
      }),
    } as never);

    const request = new Request("http://localhost/api/profile", {
      method: "POST",
      headers: {
        "content-type": "application/json",
      },
      body: JSON.stringify({
        displayName: "Fujun",
        targetRoles: ["AI Product Intern"],
        targetCity: "Shanghai",
        resumeText: "Built AI workflow products.",
        resumeSummary: "Product-minded builder.",
        selfIntroDraft: "I turn AI ideas into product systems.",
      }),
    });

    const response = await POST(request);

    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toEqual({
      profile: {
        id: "profile-123",
        displayName: "Fujun",
        targetRoles: ["AI Product Intern"],
        targetCity: "Shanghai",
        resumeText: "Built AI workflow products.",
        resumeSummary: "Product-minded builder.",
        selfIntroDraft: "I turn AI ideas into product systems.",
        createdAt: "2026-03-09T00:00:00.000Z",
        updatedAt: "2026-03-09T00:00:00.000Z",
      },
    });
  });
});
