import React from "react";

import { JdAnalysisView } from "@/components/job/jd-analysis-view";
import { getJobRecord } from "@/lib/services/job-store";

export default async function JobDetailPage({
  params,
}: {
  params: Promise<{ jobId: string }>;
}) {
  const { jobId } = await params;
  const record = getJobRecord(jobId);

  if (!record) {
    return (
      <main style={{ padding: "56px 24px" }}>
        <section
          style={{
            maxWidth: "760px",
            margin: "0 auto",
            padding: "28px",
            borderRadius: "24px",
            background: "#fff8ef",
          }}
        >
          <h1 style={{ marginTop: 0 }}>Job target not found</h1>
          <p style={{ marginBottom: 0 }}>
            Create a new JD target first, then return to this page.
          </p>
        </section>
      </main>
    );
  }

  if (!record.analysis) {
    return (
      <main style={{ padding: "56px 24px" }}>
        <section
          style={{
            maxWidth: "760px",
            margin: "0 auto",
            padding: "28px",
            borderRadius: "24px",
            background: "#fff8ef",
          }}
        >
          <h1 style={{ marginTop: 0 }}>Analysis pending</h1>
          <p style={{ marginBottom: 0 }}>
            The JD has been captured, but analysis is not available yet.
          </p>
        </section>
      </main>
    );
  }

  return (
    <main style={{ minHeight: "100vh", padding: "48px 24px", background: "#f4efe6" }}>
      <div style={{ maxWidth: "960px", margin: "0 auto" }}>
        <JdAnalysisView
          companyName={record.companyName}
          roleName={record.roleName}
          analysis={record.analysis}
        />
      </div>
    </main>
  );
}
