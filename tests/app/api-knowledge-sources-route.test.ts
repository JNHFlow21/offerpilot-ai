import { GET, POST } from "@/app/api/knowledge/sources/route";
import { getKnowledgeStore } from "@/lib/services/knowledge-service";

vi.mock("@/lib/services/knowledge-service", () => ({
  getKnowledgeStore: vi.fn(),
}));

describe("knowledge sources route", () => {
  it("returns the existing source list", async () => {
    vi.mocked(getKnowledgeStore).mockReturnValue({
      listSources: vi.fn().mockResolvedValue([
        {
          id: "source-1",
          sourceType: "jd",
          title: "ByteDance JD",
          contentText: "Build AI product workflows.",
          metadata: {},
          createdAt: "2026-03-09T00:00:00.000Z",
          updatedAt: "2026-03-09T00:00:00.000Z",
        },
      ]),
    } as never);

    const response = await GET();

    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toEqual({
      sources: [
        {
          id: "source-1",
          sourceType: "jd",
          title: "ByteDance JD",
          contentText: "Build AI product workflows.",
          metadata: {},
          createdAt: "2026-03-09T00:00:00.000Z",
          updatedAt: "2026-03-09T00:00:00.000Z",
        },
      ],
    });
  });

  it("creates a source and returns its chunk count", async () => {
    vi.mocked(getKnowledgeStore).mockReturnValue({
      createSource: vi.fn().mockResolvedValue({
        source: {
          id: "source-1",
          sourceType: "knowledge_note",
          title: "RAG note",
          contentText: "RAG should ground answers.",
          metadata: {},
          createdAt: "2026-03-09T00:00:00.000Z",
          updatedAt: "2026-03-09T00:00:00.000Z",
        },
        chunks: [
          {
            id: "chunk-1",
            sourceId: "source-1",
            chunkIndex: 0,
            content: "RAG should ground answers.",
            tokenCount: 4,
            metadata: {},
            createdAt: "2026-03-09T00:00:00.000Z",
          },
        ],
      }),
    } as never);

    const request = new Request("http://localhost/api/knowledge/sources", {
      method: "POST",
      headers: {
        "content-type": "application/json",
      },
      body: JSON.stringify({
        sourceType: "knowledge_note",
        title: "RAG note",
        contentText: "RAG should ground answers.",
      }),
    });

    const response = await POST(request);

    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toEqual({
      source: {
        id: "source-1",
        sourceType: "knowledge_note",
        title: "RAG note",
        contentText: "RAG should ground answers.",
        metadata: {},
        createdAt: "2026-03-09T00:00:00.000Z",
        updatedAt: "2026-03-09T00:00:00.000Z",
      },
      chunkCount: 1,
    });
  });

  it("rejects an invalid source type", async () => {
    const request = new Request("http://localhost/api/knowledge/sources", {
      method: "POST",
      headers: {
        "content-type": "application/json",
      },
      body: JSON.stringify({
        sourceType: "random_note",
        title: "Bad note",
        contentText: "This should fail.",
      }),
    });

    const response = await POST(request);

    expect(response.status).toBe(400);
    await expect(response.json()).resolves.toEqual({
      error: "Invalid knowledge source payload.",
    });
  });
});
