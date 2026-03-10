import {
  getDefaultAiProvider,
  getGeminiInterviewModel,
  getGeminiJdModel,
  getGeminiRewriteModel,
} from "@/lib/ai/clients";

describe("getDefaultAiProvider", () => {
  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it("prefers Gemini when GEMINI_API_KEY is available", () => {
    vi.stubEnv("GEMINI_API_KEY", "test-key");
    vi.stubEnv("OPENAI_API_KEY", "");

    expect(getDefaultAiProvider()).toBe("gemini");
  });

  it("uses Flash for JD analysis by default", () => {
    vi.stubEnv("GEMINI_JD_MODEL", "");

    expect(getGeminiJdModel()).toBe("gemini-2.5-flash");
  });

  it("uses Pro for resume rewrite by default", () => {
    vi.stubEnv("GEMINI_REWRITE_MODEL", "");

    expect(getGeminiRewriteModel()).toBe("gemini-3.1-pro-preview");
  });

  it("uses Pro for interview generation by default", () => {
    vi.stubEnv("GEMINI_INTERVIEW_MODEL", "");

    expect(getGeminiInterviewModel()).toBe("gemini-3.1-pro-preview");
  });
});
