import { getDefaultAiProvider } from "@/lib/ai/clients";

describe("getDefaultAiProvider", () => {
  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it("prefers Gemini when GEMINI_API_KEY is available", () => {
    vi.stubEnv("GEMINI_API_KEY", "test-key");
    vi.stubEnv("OPENAI_API_KEY", "");

    expect(getDefaultAiProvider()).toBe("gemini");
  });
});
