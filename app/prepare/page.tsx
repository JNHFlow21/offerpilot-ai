import React from "react";
import { redirect } from "next/navigation";

import { SignOutButton } from "@/components/auth/sign-out-button";
import { PrepareWorkspace } from "@/components/prepare/prepare-workspace";
import { getCurrentUser } from "@/lib/auth/current-user";
import { getJobRepository } from "@/lib/services/job-repository";
import { getResumeWorkspaceStore } from "@/lib/services/resume-workspace-service";

export default async function PreparePage() {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login");
  }

  const [workspace, jobs] = await Promise.all([
    getResumeWorkspaceStore().getCurrentWorkspace(user.id),
    getJobRepository().listJobs(user.id),
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
            maxWidth: "980px",
            display: "grid",
            gap: "12px",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              gap: "16px",
              flexWrap: "wrap",
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
              单一工作台
            </p>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "12px",
              }}
            >
              <span
                style={{
                  borderRadius: "999px",
                  padding: "10px 14px",
                  background: "rgba(255, 248, 238, 0.92)",
                  color: "#5c4732",
                  fontSize: "14px",
                }}
              >
                当前账号：{user.email ?? "已登录用户"}
              </span>
              <SignOutButton />
            </div>
          </div>
          <h1
            style={{
              margin: 0,
              fontSize: "58px",
              lineHeight: 0.94,
              letterSpacing: "-0.05em",
            }}
          >
            围绕一个目标岗位，完成简历改写与面试准备。
          </h1>
          <p
            style={{
              margin: 0,
              color: "#5c4732",
              lineHeight: 1.75,
              fontSize: "18px",
            }}
          >
            这不是分散的工具集合，而是一条连续主路径：固定你的简历，选择一个目标岗位 JD，生成改写建议，再进入模拟面试。
          </p>
        </header>

        <PrepareWorkspace
          currentUserEmail={user.email ?? undefined}
          initialWorkspace={workspace}
          initialJobs={jobs}
        />
      </section>
    </main>
  );
}
