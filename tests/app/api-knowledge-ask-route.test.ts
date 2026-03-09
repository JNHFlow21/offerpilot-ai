import { POST } from "@/app/api/knowledge/ask/route";
import { askKnowledgeQuestion, getKnowledgeStore } from "@/lib/services/knowledge-service";

vi.mock("@/lib/services/knowledge-service", () => ({
  getKnowledgeStore: vi.fn(),
  askKnowledgeQuestion: vi.fn(),
}));

describe("knowledge ask route", () => {
  it("rejects an empty question", async () => {
    const request = new Request("http://localhost/api/knowledge/ask", {
      method: "POST",
      headers: {
        "content-type": "application/json",
      },
      body: JSON.stringify({
        question: "",
      }),
    });

    const response = await POST(request);

    expect(response.status).toBe(400);
    await expect(response.json()).resolves.toEqual({
      error: "Invalid knowledge question payload.",
    });
  });

  it("returns the structured answer payload", async () => {
    vi.mocked(getKnowledgeStore).mockReturnValue({} as never);
    vi.mocked(askKnowledgeQuestion).mockResolvedValue({
      answer: "Use recall and groundedness as the first two evaluation signals.",
      citations: [
        {
          sourceId: "source-1",
          sourceTitle: "RAG evaluation note",
          chunkId: "chunk-1",
          excerpt: "Track recall and groundedness.",
        },
      ],
      scopeNotice: "Answer limited to the current saved sources.",
    });

    const request = new Request("http://localhost/api/knowledge/ask", {
      method: "POST",
      headers: {
        "content-type": "application/json",
      },
      body: JSON.stringify({
        question: "How should I evaluate a RAG system?",
        scope: "all",
      }),
    });

    const response = await POST(request);

    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toEqual({
      answer: {
        answer: "Use recall and groundedness as the first two evaluation signals.",
        citations: [
          {
            sourceId: "source-1",
            sourceTitle: "RAG evaluation note",
            chunkId: "chunk-1",
            excerpt: "Track recall and groundedness.",
          },
        ],
        scopeNotice: "Answer limited to the current saved sources.",
      },
    });
  });
});
