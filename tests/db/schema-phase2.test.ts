import {
  knowledgeChunks,
  knowledgeSources,
} from "@/lib/db/schema";

describe("phase 2 database schema", () => {
  it("exports the knowledge tables", () => {
    expect(knowledgeSources).toBeDefined();
    expect(knowledgeChunks).toBeDefined();
  });

  it("includes the expected key columns", () => {
    expect(knowledgeSources.sourceType.name).toBe("source_type");
    expect(knowledgeSources.contentText.name).toBe("content_text");
    expect(knowledgeChunks.sourceId.name).toBe("source_id");
    expect(knowledgeChunks.content.name).toBe("content");
  });
});
