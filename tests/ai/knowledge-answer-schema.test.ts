import { knowledgeAnswerSchema } from "@/lib/ai/schemas/knowledge-answer";

describe("knowledge answer schema", () => {
  it("accepts a cited answer payload", () => {
    expect(
      knowledgeAnswerSchema.parse({
        answer:
          "RAG evaluation should balance retrieval recall with grounded answer quality.",
        citations: [
          {
            sourceId: "source-1",
            sourceTitle: "RAG evaluation note",
            chunkId: "chunk-1",
            excerpt:
              "Track recall, groundedness, and citation precision for retrieved evidence.",
          },
        ],
        scopeNotice: "Answer limited to the current saved sources.",
      }),
    ).toMatchObject({
      citations: [
        {
          sourceTitle: "RAG evaluation note",
        },
      ],
    });
  });

  it("rejects an empty answer", () => {
    expect(() =>
      knowledgeAnswerSchema.parse({
        answer: "",
        citations: [],
        scopeNotice: "No sources available.",
      }),
    ).toThrow();
  });
});
