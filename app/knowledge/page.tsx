import React from "react";

import { KnowledgeWorkspace } from "@/components/knowledge/knowledge-workspace";
import { getKnowledgeStore } from "@/lib/services/knowledge-service";

export default async function KnowledgePage() {
  const sources = await getKnowledgeStore().listSources();

  return (
    <main
      style={{
        minHeight: "100vh",
        padding: "48px 24px 72px",
        background:
          "radial-gradient(circle at top left, rgba(232, 219, 196, 0.58), transparent 28%), #f4efe6",
      }}
    >
      <section
        style={{
          maxWidth: "1180px",
          margin: "0 auto",
          display: "grid",
          gap: "24px",
        }}
      >
        <header
          style={{
            maxWidth: "760px",
            display: "grid",
            gap: "12px",
          }}
        >
          <p
            style={{
              margin: 0,
              textTransform: "uppercase",
              letterSpacing: "0.16em",
              color: "#866747",
              fontSize: "12px",
            }}
          >
            Phase 2
          </p>
          <h1
            style={{
              margin: 0,
              fontSize: "52px",
              lineHeight: 0.95,
              letterSpacing: "-0.05em",
            }}
          >
            Build your bounded prep knowledge.
          </h1>
          <p
            style={{
              margin: 0,
              color: "#5c4732",
              lineHeight: 1.75,
              fontSize: "18px",
            }}
          >
            Save only the material you want the system to cite back. This is not
            an open chat box. It is a source-bounded prep workspace.
          </p>
        </header>

        <KnowledgeWorkspace initialSources={sources} autoLoad={false} />
      </section>
    </main>
  );
}
