import { POST } from "@/app/api/prepare/run/route";
import { runPreparePipeline } from "@/lib/services/prepare-run-service";
import { extractResumeTextFromPdfFile } from "@/lib/services/pdf-resume";

vi.mock("@/lib/services/prepare-run-service", () => ({
  runPreparePipeline: vi.fn(),
}));

vi.mock("@/lib/services/pdf-resume", () => ({
  extractResumeTextFromPdfFile: vi.fn(),
}));

describe("prepare run route", () => {
  it("accepts multipart form data and returns staged rewrite-ready results", async () => {
    vi.mocked(extractResumeTextFromPdfFile).mockResolvedValue(
      "负责 AI 产品从调研到上线，推进算法、设计、研发协作并跟踪指标结果，主导多个功能迭代落地。",
    );
    vi.mocked(runPreparePipeline).mockResolvedValue({
      workspace: { id: "workspace-1" },
      job: { id: "job-1" },
      rewrite: { id: "rewrite-1" },
      status: "rewrite_ready",
    } as never);

    const form = new FormData();
    form.set(
      "resumeFile",
      new File([new Uint8Array([1, 2, 3])], "resume.pdf", { type: "application/pdf" }),
    );
    form.set("companyName", "字节跳动");
    form.set("roleName", "AI 产品经理实习生");
    form.set("jdText", "负责 AI 产品规划、跨团队协作与指标优化，需要超过二十个字符。");
    form.set("sourceUrl", "https://jobs.bytedance.com/trae-ai-pm");

    const response = await POST({
      formData: vi.fn().mockResolvedValue(form),
    } as unknown as Request);

    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toEqual({
      workspace: { id: "workspace-1" },
      job: { id: "job-1" },
      rewrite: { id: "rewrite-1" },
      status: "rewrite_ready",
    });
  });
});
