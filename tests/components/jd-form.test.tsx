import React from "react";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";

import { JdForm } from "@/components/job/jd-form";

const push = vi.fn();
const refresh = vi.fn();

vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push,
    refresh,
  }),
}));

describe("JdForm", () => {
  beforeEach(() => {
    push.mockReset();
    refresh.mockReset();
    vi.restoreAllMocks();
  });

  it("shows the server error returned by /api/jobs", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(
        new Response(JSON.stringify({ error: "password authentication failed" }), {
          status: 500,
          headers: {
            "content-type": "application/json",
          },
        }),
      ),
    );

    render(<JdForm />);

    fireEvent.change(screen.getByLabelText(/公司名称/i), {
      target: { value: "bytedance" },
    });
    fireEvent.change(screen.getByLabelText(/岗位名称/i), {
      target: { value: "AI产品实习生-TRAE" },
    });
    fireEvent.change(screen.getByLabelText(/岗位 jd/i), {
      target: {
        value: "这是一个足够长的 JD 文本，用来验证错误信息是否能展示给用户。需要超过二十个字符。",
      },
    });
    fireEvent.change(screen.getByLabelText(/岗位来源链接/i), {
      target: { value: "https://jobs.bytedance.com/trae-ai-pm" },
    });

    fireEvent.submit(screen.getByRole("button", { name: /保存并解析 jd/i }));

    await waitFor(() => {
      expect(screen.getByText(/password authentication failed/i)).toBeInTheDocument();
    });
  });
});
