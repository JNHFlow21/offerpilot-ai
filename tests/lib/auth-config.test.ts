import { describe, expect, it, vi } from "vitest";

describe("auth config", () => {
  it("falls back to the production app url when running on localhost", async () => {
    vi.resetModules();
    vi.stubGlobal("window", {
      location: {
        origin: "http://localhost:3000",
      },
    });

    const { getAuthRedirectUrl } = await import("@/lib/supabase/auth-config");

    expect(getAuthRedirectUrl()).toBe("https://offerpilot-ai.vercel.app/auth/callback");
  });
});
