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
            知识层
          </p>
          <h1
            style={{
              margin: 0,
              fontSize: "52px",
              lineHeight: 0.95,
              letterSpacing: "-0.05em",
            }}
          >
            平台知识库与个人资料源。
          </h1>
          <p
            style={{
              margin: 0,
              color: "#5c4732",
              lineHeight: 1.75,
              fontSize: "18px",
            }}
          >
            这不是开放聊天窗口，而是带引用的资料层。平台后续会默认预置知识库，这里主要用于补充你自己的资料源。
          </p>
        </header>

        <KnowledgeWorkspace initialSources={sources} autoLoad={false} />
      </section>
    </main>
  );
}
