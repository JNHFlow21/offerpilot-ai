import {
  askKnowledgeQuestion,
  getKnowledgeStore,
  resetMemoryKnowledgeStore,
} from "@/lib/services/knowledge-service";

describe("knowledge service", () => {
  beforeEach(() => {
    resetMemoryKnowledgeStore();
    vi.unstubAllEnvs();
  });

  it("creates a source and deterministic chunks in memory mode", async () => {
    const store = getKnowledgeStore();
    const created = await store.createSource({
      sourceType: "knowledge_note",
      title: "RAG evaluation note",
      contentText:
        "RAG systems should ground answers in retrieved evidence.\n\nEvaluation should track recall, groundedness, and citation quality.",
      metadata: {
        topic: "rag",
      },
    });

    expect(created.source.sourceType).toBe("knowledge_note");
    expect(created.source.title).toBe("RAG evaluation note");
    expect(created.chunks).toHaveLength(2);
    expect(created.chunks.map((chunk) => chunk.chunkIndex)).toEqual([0, 1]);
    expect(created.chunks[0]?.content).toContain("ground answers");
  });

  it("returns an empty-state answer when no source material exists", async () => {
    const store = getKnowledgeStore();
    const result = await askKnowledgeQuestion(
      {
        question: "How should I evaluate a RAG system?",
        scope: "all",
      },
      store,
    );

    expect(result.answer).toMatch(/don't have enough source material/i);
    expect(result.citations).toEqual([]);
    expect(result.scopeNotice).toMatch(/add jd, resume, project/i);
  });

  it("retrieves relevant chunks and formats a cited answer", async () => {
    const store = getKnowledgeStore();
    const created = await store.createSource({
      sourceType: "knowledge_note",
      title: "RAG evaluation note",
      contentText:
        "For RAG evaluation, track recall, groundedness, and citation precision.\n\nUse failure review to find unsupported claims.",
      metadata: {},
    });

    await store.createSource({
      sourceType: "project",
      title: "Analytics dashboard note",
      contentText:
        "Retention dashboards need weekly cohort analysis and funnel drop-off views.",
      metadata: {},
    });

    const answerer = {
      answer: vi.fn().mockResolvedValue({
        answer:
          "Start with recall, groundedness, and citation precision for the retrieved context.",
        citations: [
          {
            sourceId: created.source.id,
            sourceTitle: created.source.title,
            chunkId: created.chunks[0]?.id ?? "",
            excerpt: created.chunks[0]?.content ?? "",
          },
        ],
        scopeNotice: "Answer limited to the current saved sources.",
      }),
    };

    const result = await askKnowledgeQuestion(
      {
        question: "How should I evaluate a RAG system?",
        scope: "all",
      },
      store,
      answerer,
    );

    expect(answerer.answer).toHaveBeenCalledTimes(1);
    expect(result.answer).toMatch(/recall, groundedness/i);
    expect(result.citations[0]?.sourceTitle).toBe("RAG evaluation note");
  });
});
