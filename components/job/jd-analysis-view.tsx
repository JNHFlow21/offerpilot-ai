import React from "react";

import type { JdAnalysisResult } from "@/lib/ai/schemas/jd-analysis";

export function JdAnalysisView({
  companyName,
  roleName,
  analysis,
}: {
  companyName?: string;
  roleName: string;
  analysis: JdAnalysisResult;
}) {
  return (
    <section
      style={{
        display: "grid",
        gap: "24px",
        padding: "32px",
        borderRadius: "28px",
        background: "rgba(255, 252, 247, 0.96)",
        boxShadow: "0 18px 50px rgba(52, 37, 19, 0.08)",
      }}
    >
      <header>
        <p
          style={{
            margin: 0,
            textTransform: "uppercase",
            letterSpacing: "0.14em",
            color: "#866747",
            fontSize: "12px",
          }}
        >
          JD Analysis
        </p>
        <h1 style={{ margin: "10px 0 8px", fontSize: "40px", lineHeight: 1 }}>
          {roleName}
        </h1>
        {companyName ? (
          <p style={{ margin: 0, color: "#6b5640", fontSize: "16px" }}>
            {companyName}
          </p>
        ) : null}
      </header>

      <section>
        <h2 style={{ marginBottom: "10px" }}>Overall Summary</h2>
        <p style={{ margin: 0, lineHeight: 1.7 }}>{analysis.overallSummary}</p>
      </section>

      <section>
        <h2 style={{ marginBottom: "10px" }}>Keywords</h2>
        <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
          {analysis.keywords.map((keyword) => (
            <span
              key={keyword}
              style={{
                borderRadius: "999px",
                background: "#efe4d2",
                padding: "8px 12px",
                fontSize: "14px",
              }}
            >
              {keyword}
            </span>
          ))}
        </div>
      </section>

      <section>
        <h2 style={{ marginBottom: "10px" }}>Capability Dimensions</h2>
        <div style={{ display: "grid", gap: "14px" }}>
          {analysis.capabilityDimensions.map((dimension) => (
            <article
              key={dimension.name}
              style={{
                borderRadius: "20px",
                padding: "18px",
                background: "#f8f2ea",
              }}
            >
              <strong>{dimension.name}</strong>
              <p style={{ margin: "10px 0 0", lineHeight: 1.6 }}>
                {dimension.preparationAdvice}
              </p>
            </article>
          ))}
        </div>
      </section>
    </section>
  );
}
