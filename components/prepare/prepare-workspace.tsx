"use client";

import React, { useState } from "react";

import type { InterviewAssistResult } from "@/lib/ai/schemas/interview-assist";
import type { ResumeRewriteRecord } from "@/lib/ai/schemas/resume-rewrite";
import type { ResumeWorkspaceRecord } from "@/lib/ai/schemas/resume-workspace";
import type { JobRecord } from "@/lib/services/job-repository";

const panelStyle = {
  padding: "24px",
  borderRadius: "28px",
  background: "rgba(255, 248, 238, 0.96)",
  boxShadow: "0 20px 50px rgba(56, 38, 17, 0.08)",
} satisfies React.CSSProperties;

const fieldStyle = {
  width: "100%",
  borderRadius: "18px",
  border: "1px solid rgba(73, 54, 31, 0.12)",
  background: "rgba(255, 252, 247, 0.92)",
  padding: "14px 16px",
  fontSize: "15px",
  color: "#20170f",
} satisfies React.CSSProperties;

interface PrepareFormState {
  companyName: string;
  roleName: string;
  jdText: string;
  sourceUrl: string;
}

async function readErrorMessage(response: Response, fallbackMessage: string) {
  try {
    const data = (await response.json()) as { error?: string };
    return data.error || fallbackMessage;
  } catch {
    return fallbackMessage;
  }
}

export function PrepareWorkspace({
  initialWorkspace,
}: {
  initialWorkspace?: ResumeWorkspaceRecord | null;
  initialJobs?: JobRecord[];
}) {
  const [form, setForm] = useState<PrepareFormState>({
    companyName: "",
    roleName: "",
    jdText: "",
    sourceUrl: "",
  });
  const [resumeFile, setResumeFile] = useState<File | null>(null);
  const [workspace, setWorkspace] = useState<ResumeWorkspaceRecord | null>(
    initialWorkspace ?? null,
  );
  const [job, setJob] = useState<JobRecord | null>(null);
  const [rewrite, setRewrite] = useState<ResumeRewriteRecord | null>(null);
  const [assist, setAssist] = useState<InterviewAssistResult | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [savedMessage, setSavedMessage] = useState<string | null>(null);

  function updateField<Key extends keyof PrepareFormState>(
    key: Key,
    value: PrepareFormState[Key],
  ) {
    setForm((current) => ({
      ...current,
      [key]: value,
    }));
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSubmitting(true);
    setError(null);
    setSavedMessage(null);

    try {
      if (!resumeFile) {
        throw new Error("请先上传 PDF 简历。");
      }

      const body = new FormData();
      body.set("resumeFile", resumeFile);
      body.set("companyName", form.companyName);
      body.set("roleName", form.roleName);
      body.set("jdText", form.jdText);
      body.set("sourceUrl", form.sourceUrl);

      const response = await fetch("/api/prepare/run", {
        method: "POST",
        body,
      });

      if (!response.ok) {
        throw new Error(await readErrorMessage(response, "生成准备方案失败。"));
      }

      const data = (await response.json()) as {
        workspace: ResumeWorkspaceRecord;
        job: JobRecord;
        rewrite: ResumeRewriteRecord;
        assist: InterviewAssistResult;
      };

      setWorkspace(data.workspace);
      setJob(data.job);
      setRewrite(data.rewrite);
      setAssist(data.assist);
      setSavedMessage("准备方案已生成。系统已自动完成简历提取、JD 解析、改写建议和模拟面试辅助。");
    } catch (submissionError) {
      setError(submissionError instanceof Error ? submissionError.message : "生成准备方案失败。");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <section
      style={{
        display: "grid",
        gap: "24px",
        gridTemplateColumns: "minmax(0, 420px) minmax(0, 1.05fr) minmax(320px, 0.9fr)",
        alignItems: "start",
      }}
    >
      <form onSubmit={handleSubmit} style={{ ...panelStyle, display: "grid", gap: "16px" }}>
        <div style={{ display: "grid", gap: "8px" }}>
          <p
            style={{
              margin: 0,
              textTransform: "uppercase",
              letterSpacing: "0.16em",
              color: "#866747",
              fontSize: "12px",
            }}
          >
            步骤 1
          </p>
          <h2 style={{ margin: 0, fontSize: "28px", lineHeight: 1.02, letterSpacing: "-0.04em" }}>
            我的简历
          </h2>
          <p style={{ margin: 0, color: "#5c4732", lineHeight: 1.7 }}>
            你只需要上传 PDF 简历。系统会自动提取文本、生成摘要，并把当前版本保存到你的账号。
          </p>
        </div>

        <label style={{ display: "grid", gap: "8px", fontWeight: 600 }}>
          上传 PDF 简历
          <input
            aria-label="上传 PDF 简历"
            type="file"
            accept="application/pdf"
            onChange={(event) => setResumeFile(event.target.files?.[0] ?? null)}
            style={fieldStyle}
          />
        </label>

        {resumeFile ? (
          <p style={{ margin: 0, color: "#5c4732", fontSize: "14px" }}>
            当前选择：{resumeFile.name}
          </p>
        ) : null}

        {workspace ? (
          <div
            style={{
              borderRadius: "20px",
              padding: "14px 16px",
              background: "rgba(246, 235, 218, 0.72)",
              color: "#5c4732",
              lineHeight: 1.6,
              fontSize: "14px",
            }}
          >
            <strong style={{ display: "block", color: "#20170f" }}>当前已保存简历摘要</strong>
            {workspace.resumeSummary || workspace.rawResumeText.slice(0, 120)}
          </div>
        ) : null}

        <div style={{ display: "grid", gap: "8px", marginTop: "8px" }}>
          <p
            style={{
              margin: 0,
              textTransform: "uppercase",
              letterSpacing: "0.16em",
              color: "#866747",
              fontSize: "12px",
            }}
          >
            步骤 2
          </p>
          <h2 style={{ margin: 0, fontSize: "28px", lineHeight: 1.02, letterSpacing: "-0.04em" }}>
            目标岗位 JD
          </h2>
          <p style={{ margin: 0, color: "#5c4732", lineHeight: 1.7 }}>
            填一份目标岗位的 JD。系统会自动保存这个岗位，并以它为主线生成后续建议。
          </p>
        </div>

        <label style={{ display: "grid", gap: "8px", fontWeight: 600 }}>
          公司名称
          <input
            aria-label="公司名称"
            value={form.companyName}
            onChange={(event) => updateField("companyName", event.target.value)}
            style={fieldStyle}
          />
        </label>

        <label style={{ display: "grid", gap: "8px", fontWeight: 600 }}>
          岗位名称
          <input
            aria-label="岗位名称"
            value={form.roleName}
            onChange={(event) => updateField("roleName", event.target.value)}
            style={fieldStyle}
            required
          />
        </label>

        <label style={{ display: "grid", gap: "8px", fontWeight: 600 }}>
          岗位 JD
          <textarea
            aria-label="岗位 JD"
            rows={10}
            value={form.jdText}
            onChange={(event) => updateField("jdText", event.target.value)}
            style={{ ...fieldStyle, resize: "vertical" }}
            required
          />
        </label>

        <label style={{ display: "grid", gap: "8px", fontWeight: 600 }}>
          岗位来源链接
          <input
            aria-label="岗位来源链接"
            value={form.sourceUrl}
            onChange={(event) => updateField("sourceUrl", event.target.value)}
            placeholder="https://jobs.example.com/..."
            style={fieldStyle}
          />
        </label>

        {error ? <p style={{ margin: 0, color: "#b42318", fontSize: "14px" }}>{error}</p> : null}
        {savedMessage ? (
          <p style={{ margin: 0, color: "#176448", fontSize: "14px", lineHeight: 1.6 }}>
            {savedMessage}
          </p>
        ) : null}

        <button
          type="submit"
          disabled={isSubmitting}
          style={{
            width: "fit-content",
            border: 0,
            borderRadius: "999px",
            padding: "14px 20px",
            background: "#181512",
            color: "#fff8ec",
            fontWeight: 700,
            cursor: isSubmitting ? "progress" : "pointer",
            opacity: isSubmitting ? 0.72 : 1,
          }}
        >
          {isSubmitting ? "生成中..." : "开始生成准备方案"}
        </button>
      </form>

      <section style={{ ...panelStyle, display: "grid", gap: "18px" }}>
        <div style={{ display: "grid", gap: "8px" }}>
          <p
            style={{
              margin: 0,
              textTransform: "uppercase",
              letterSpacing: "0.16em",
              color: "#866747",
              fontSize: "12px",
            }}
          >
            步骤 3
          </p>
          <h2 style={{ margin: 0, fontSize: "28px", lineHeight: 1.02, letterSpacing: "-0.04em" }}>
            改写建议
          </h2>
          <p style={{ margin: 0, color: "#5c4732", lineHeight: 1.7 }}>
            改写建议会优先紧扣岗位 JD，其次再参考平台知识库，不要求你手动配置任何资料检索。
          </p>
        </div>

        {job ? (
          <div
            style={{
              borderRadius: "20px",
              padding: "14px 16px",
              background: "rgba(246, 235, 218, 0.72)",
              color: "#5c4732",
              lineHeight: 1.6,
              fontSize: "14px",
            }}
          >
            <strong style={{ display: "block", color: "#20170f" }}>
              当前岗位：{[job.companyName, job.roleName].filter(Boolean).join(" · ")}
            </strong>
            {job.jdText.slice(0, 160)}
            {job.jdText.length > 160 ? "..." : ""}
          </div>
        ) : null}

        {rewrite ? (
          <div style={{ display: "grid", gap: "18px" }}>
            <div
              style={{
                borderRadius: "20px",
                padding: "16px",
                background: "rgba(246, 235, 218, 0.72)",
              }}
            >
              <strong style={{ display: "block", marginBottom: "8px" }}>改写总览</strong>
              <p style={{ margin: 0, lineHeight: 1.7, color: "#3d2c1d" }}>{rewrite.rewriteSummary}</p>
            </div>

            <div style={{ display: "grid", gap: "14px" }}>
              {rewrite.sectionSuggestions.map((suggestion) => (
                <article
                  key={`${suggestion.sectionTitle}-${suggestion.currentIssue}`}
                  style={{
                    borderRadius: "22px",
                    border: "1px solid rgba(73, 54, 31, 0.12)",
                    padding: "18px",
                    background: "rgba(255, 252, 247, 0.92)",
                    display: "grid",
                    gap: "8px",
                  }}
                >
                  <h3 style={{ margin: 0, fontSize: "18px" }}>{suggestion.sectionTitle}</h3>
                  <p style={{ margin: 0, color: "#5c4732", lineHeight: 1.65 }}>
                    <strong style={{ color: "#20170f" }}>当前问题：</strong>
                    {suggestion.currentIssue}
                  </p>
                  <p style={{ margin: 0, color: "#5c4732", lineHeight: 1.65 }}>
                    <strong style={{ color: "#20170f" }}>建议修改：</strong>
                    {suggestion.recommendedChange}
                  </p>
                  <p style={{ margin: 0, color: "#5c4732", lineHeight: 1.65 }}>
                    <strong style={{ color: "#20170f" }}>为什么更贴岗位：</strong>
                    {suggestion.jdAlignmentReason}
                  </p>
                </article>
              ))}
            </div>
          </div>
        ) : (
          <div
            style={{
              borderRadius: "24px",
              border: "1px dashed rgba(73, 54, 31, 0.24)",
              padding: "22px",
              color: "#5c4732",
              lineHeight: 1.7,
            }}
          >
            上传 PDF 简历并填写岗位 JD 后，系统会自动在这里输出改写建议，不需要你手动再点下一步。
          </div>
        )}
      </section>

      <section style={{ ...panelStyle, display: "grid", gap: "18px" }}>
        <div style={{ display: "grid", gap: "8px" }}>
          <p
            style={{
              margin: 0,
              textTransform: "uppercase",
              letterSpacing: "0.16em",
              color: "#866747",
              fontSize: "12px",
            }}
          >
            步骤 4
          </p>
          <h2 style={{ margin: 0, fontSize: "28px", lineHeight: 1.02, letterSpacing: "-0.04em" }}>
            模拟面试
          </h2>
          <p style={{ margin: 0, color: "#5c4732", lineHeight: 1.7 }}>
            这里会自动生成高频问题、追问点和答题框架，后续再继续升级成完整多轮 Agent 面试。
          </p>
        </div>

        {assist ? (
          <div style={{ display: "grid", gap: "14px" }}>
            <div
              style={{
                borderRadius: "18px",
                padding: "16px",
                background: "rgba(246, 235, 218, 0.72)",
                color: "#3d2c1d",
                lineHeight: 1.7,
              }}
            >
              {assist.overview}
            </div>

            {assist.questions.map((item) => (
              <article
                key={item.question}
                style={{
                  borderRadius: "22px",
                  border: "1px solid rgba(73, 54, 31, 0.12)",
                  padding: "18px",
                  background: "rgba(255, 252, 247, 0.92)",
                  display: "grid",
                  gap: "12px",
                }}
              >
                <h3 style={{ margin: 0, fontSize: "18px", lineHeight: 1.45 }}>{item.question}</h3>
                <div style={{ display: "grid", gap: "6px" }}>
                  <strong>可能追问</strong>
                  <ul style={{ margin: 0, paddingLeft: "18px", display: "grid", gap: "6px" }}>
                    {item.followUps.map((followUp) => (
                      <li key={followUp} style={{ lineHeight: 1.6 }}>
                        {followUp}
                      </li>
                    ))}
                  </ul>
                </div>
              </article>
            ))}
          </div>
        ) : (
          <div
            style={{
              borderRadius: "24px",
              border: "1px dashed rgba(73, 54, 31, 0.24)",
              padding: "22px",
              color: "#5c4732",
              lineHeight: 1.7,
            }}
          >
            提交后系统会自动生成第一版模拟面试问题和追问点，不再需要你手动触发。
          </div>
        )}
      </section>
    </section>
  );
}
