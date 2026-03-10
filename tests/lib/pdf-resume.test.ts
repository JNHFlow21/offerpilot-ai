import { describe, expect, it, vi } from "vitest";

describe("pdf resume extraction", () => {
  it("extracts trimmed text from a PDF file", async () => {
    const parser = vi.fn().mockResolvedValue({
      text:
        "  第一段简历内容强调 AI 产品经验和跨团队协作。\n第二段说明项目落地、指标结果和复杂问题拆解能力。  ",
    });
    const { extractResumeTextFromPdfFile } = await import("@/lib/services/pdf-resume");

    const file = {
      arrayBuffer: vi.fn().mockResolvedValue(new Uint8Array([1, 2, 3]).buffer),
    } as unknown as File;

    await expect(extractResumeTextFromPdfFile(file, parser)).resolves.toBe(
      "第一段简历内容强调 AI 产品经验和跨团队协作。\n第二段说明项目落地、指标结果和复杂问题拆解能力。",
    );
  });
});
