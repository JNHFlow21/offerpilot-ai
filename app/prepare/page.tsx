import React from "react";

import { PrepareWorkspace } from "@/components/prepare/prepare-workspace";
import { getJobRepository } from "@/lib/services/job-repository";
import { getResumeWorkspaceStore } from "@/lib/services/resume-workspace-service";

export default async function PreparePage() {
  const [workspace, jobs] = await Promise.all([
    getResumeWorkspaceStore().getCurrentWorkspace(),
    getJobRepository().listJobs(),
  ]);

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
          maxWidth: "1400px",
          margin: "0 auto",
          display: "grid",
          gap: "24px",
        }}
      >
        <header
          style={{
            maxWidth: "780px",
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
            Phase 3
          </p>
          <h1
            style={{
              margin: 0,
              fontSize: "58px",
              lineHeight: 0.94,
              letterSpacing: "-0.05em",
            }}
          >
            Rewrite your story for one target role.
          </h1>
          <p
            style={{
              margin: 0,
              color: "#5c4732",
              lineHeight: 1.75,
              fontSize: "18px",
            }}
          >
            Keep the workspace narrow: one resume, one target JD, one prep path. Save
            the raw resume, tighten the positioning, then turn the rewritten bullets into
            likely interview pressure.
          </p>
        </header>

        <PrepareWorkspace initialWorkspace={workspace} initialJobs={jobs} />
      </section>
    </main>
  );
}
