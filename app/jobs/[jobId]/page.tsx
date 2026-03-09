import React from "react";

import { JdAnalysisView } from "@/components/job/jd-analysis-view";
import { getJobRepository } from "@/lib/services/job-repository";

export default async function JobDetailPage({
  params,
}: {
  params: Promise<{ jobId: string }>;
}) {
  const { jobId } = await params;
  const record = await getJobRepository().getJobById(jobId);

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
          <h1 style={{ marginTop: 0 }}>未找到该岗位 JD</h1>
          <p style={{ marginBottom: 0 }}>
            请先保存一个新的岗位 JD，再回到这个页面。
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
          <h1 style={{ marginTop: 0 }}>JD 解析尚未完成</h1>
          <p style={{ marginBottom: 0 }}>
            岗位 JD 已保存，但结构化解析结果暂时还不可用。
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
