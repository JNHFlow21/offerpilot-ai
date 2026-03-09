import { POST } from "@/app/api/jobs/route";
import { getJobRepository } from "@/lib/services/job-repository";

vi.mock("@/lib/services/job-repository", () => ({
  getJobRepository: vi.fn(),
}));

describe("POST /api/jobs", () => {
  it("returns the created job id when persistence succeeds", async () => {
    vi.mocked(getJobRepository).mockReturnValue({
      createJob: vi.fn().mockResolvedValue({
        id: "job-123",
      }),
    } as never);

    const request = new Request("http://localhost/api/jobs", {
      method: "POST",
      headers: {
        "content-type": "application/json",
      },
      body: JSON.stringify({
        companyName: "bytedance",
        roleName: "AI产品实习生-TRAE",
        jdText: "这是一个足够长的 JD 文本，用来验证创建接口是否成功。需要超过二十个字符。",
      }),
    });

    const response = await POST(request);

    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toEqual({
      jobId: "job-123",
    });
  });

  it("returns a 500 payload with the repository error message", async () => {
    vi.mocked(getJobRepository).mockReturnValue({
      createJob: vi
        .fn()
        .mockRejectedValue(new Error("password authentication failed")),
    } as never);

    const request = new Request("http://localhost/api/jobs", {
      method: "POST",
      headers: {
        "content-type": "application/json",
      },
      body: JSON.stringify({
        companyName: "bytedance",
        roleName: "AI产品实习生-TRAE",
        jdText: "这是一个足够长的 JD 文本，用来验证错误信息是否能返回给前端。需要超过二十个字符。",
      }),
    });

    const response = await POST(request);

    expect(response.status).toBe(500);
    await expect(response.json()).resolves.toEqual({
      error: "password authentication failed",
    });
  });
});
