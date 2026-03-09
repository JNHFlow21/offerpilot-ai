import React from "react";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";

import { KnowledgeWorkspace } from "@/components/knowledge/knowledge-workspace";

describe("KnowledgeWorkspace", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it("renders the source list and question workflow", async () => {
    vi.stubGlobal(
      "fetch",
      vi
        .fn()
        .mockResolvedValueOnce(
          new Response(
            JSON.stringify({
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
            }),
            {
              status: 200,
              headers: {
                "content-type": "application/json",
              },
            },
          ),
        )
        .mockResolvedValueOnce(
          new Response(
            JSON.stringify({
              answer: {
                answer: "The JD emphasizes AI product workflow delivery and cross-functional collaboration.",
                citations: [
                  {
                    sourceId: "source-1",
                    sourceTitle: "ByteDance JD",
                    chunkId: "chunk-1",
                    excerpt: "Build AI product workflows.",
                  },
                ],
                scopeNotice: "Answer limited to the current saved sources.",
              },
            }),
            {
              status: 200,
              headers: {
                "content-type": "application/json",
              },
            },
          ),
        ),
    );

    render(<KnowledgeWorkspace />);

    expect(await screen.findByText(/ByteDance JD/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/ask a source-bounded question/i)).toBeInTheDocument();

    fireEvent.change(screen.getByLabelText(/ask a source-bounded question/i), {
      target: { value: "What does this JD care about most?" },
    });
    fireEvent.submit(screen.getByRole("button", { name: /ask knowledge/i }));

    await waitFor(() => {
      expect(screen.getByText(/AI product workflow delivery/i)).toBeInTheDocument();
    });
    expect(screen.getAllByText(/ByteDance JD/i).length).toBeGreaterThan(0);
    expect(screen.getByText(/Answer limited to the current saved sources/i)).toBeInTheDocument();
  });
});
