"use client";

import React, { useMemo, useState } from "react";

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
  rawResumeText: string;
  resumeSummary: string;
  keyProjectBullets: string;
  rewriteFocus: string;
  jobId: string;
}

function toFormState(
  workspace: ResumeWorkspaceRecord | null | undefined,
  jobs: JobRecord[],
): PrepareFormState {
  return {
    rawResumeText: workspace?.rawResumeText ?? "",
    resumeSummary: workspace?.resumeSummary ?? "",
    keyProjectBullets: workspace?.keyProjectBullets.join("\n") ?? "",
    rewriteFocus: workspace?.rewriteFocus ?? "",
    jobId: jobs[0]?.id ?? "",
  };
}

async function readErrorMessage(response: Response, fallbackMessage: string) {
  try {
    const data = (await response.json()) as { error?: string };
    return data.error || fallbackMessage;
  } catch {
    return fallbackMessage;
  }
}

function jobLabel(job: JobRecord) {
  return [job.companyName, job.roleName].filter(Boolean).join(" · ");
}

export function PrepareWorkspace({
  initialWorkspace,
  initialJobs,
}: {
  initialWorkspace?: ResumeWorkspaceRecord | null;
  initialJobs?: JobRecord[];
}) {
  const jobs = initialJobs ?? [];
  const [form, setForm] = useState<PrepareFormState>(toFormState(initialWorkspace, jobs));
  const [workspace, setWorkspace] = useState<ResumeWorkspaceRecord | null>(
    initialWorkspace ?? null,
  );
  const [rewrite, setRewrite] = useState<ResumeRewriteRecord | null>(null);
  const [assist, setAssist] = useState<InterviewAssistResult | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isRewriting, setIsRewriting] = useState(false);
  const [isGeneratingAssist, setIsGeneratingAssist] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [savedMessage, setSavedMessage] = useState<string | null>(null);

  const selectedJob = useMemo(
    () => jobs.find((job) => job.id === form.jobId) ?? null,
    [form.jobId, jobs],
  );

  function updateField<Key extends keyof PrepareFormState>(
    key: Key,
    value: PrepareFormState[Key],
  ) {
    setForm((current) => ({
      ...current,
      [key]: value,
    }));
  }

  async function saveWorkspace() {
    const response = await fetch("/api/resume", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        rawResumeText: form.rawResumeText,
        resumeSummary: form.resumeSummary,
        keyProjectBullets: form.keyProjectBullets
          .split("\n")
          .map((bullet) => bullet.trim())
          .filter(Boolean),
        rewriteFocus: form.rewriteFocus,
      }),
    });

    if (!response.ok) {
      throw new Error(await readErrorMessage(response, "保存简历失败。"));
    }

    const data = (await response.json()) as { workspace: ResumeWorkspaceRecord };
    setWorkspace(data.workspace);
    setForm((current) => ({
      ...current,
      resumeSummary: data.workspace.resumeSummary,
      keyProjectBullets: data.workspace.keyProjectBullets.join("\n"),
    }));
    setSavedMessage("简历工作区已保存。");
  }

  async function handleSaveWorkspace(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSaving(true);
    setError(null);
    setSavedMessage(null);

    try {
      await saveWorkspace();
    } catch (submissionError) {
      setError(submissionError instanceof Error ? submissionError.message : "保存简历失败。");
    } finally {
      setIsSaving(false);
    }
  }

  async function handleRewrite() {
    if (!form.jobId) {
      setError("请先选择一个目标岗位 JD。");
      return;
    }

    setIsRewriting(true);
    setError(null);
    setSavedMessage(null);

    try {
      await saveWorkspace();

      const response = await fetch("/api/resume/rewrite", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          jobId: form.jobId,
          knowledgeScope: "all",
        }),
      });

      if (!response.ok) {
        throw new Error(await readErrorMessage(response, "生成改写建议失败。"));
      }

      const data = (await response.json()) as { rewrite: ResumeRewriteRecord };
      setRewrite(data.rewrite);
      setAssist(null);
      setSavedMessage("改写建议已生成。");
    } catch (submissionError) {
      setError(
        submissionError instanceof Error ? submissionError.message : "生成改写建议失败。",
      );
    } finally {
      setIsRewriting(false);
    }
  }

  async function handleGenerateAssist() {
    if (!form.jobId) {
      setError("请先选择一个目标岗位 JD。");
      return;
    }

    setIsGeneratingAssist(true);
    setError(null);

    try {
      if (!rewrite) {
        await handleRewrite();
      }

      const response = await fetch("/api/interview/assist", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          jobId: form.jobId,
          knowledgeScope: "all",
        }),
      });

      if (!response.ok) {
        throw new Error(await readErrorMessage(response, "生成面试辅助失败。"));
      }

      const data = (await response.json()) as { assist: InterviewAssistResult };
      setAssist(data.assist);
      setSavedMessage("面试辅助已生成。");
    } catch (submissionError) {
      setError(
        submissionError instanceof Error ? submissionError.message : "生成面试辅助失败。",
      );
    } finally {
      setIsGeneratingAssist(false);
    }
  }

  return (
    <section
      style={{
        display: "grid",
        gap: "24px",
        gridTemplateColumns: "minmax(0, 380px) minmax(0, 1.1fr) minmax(320px, 0.9fr)",
        alignItems: "start",
      }}
    >
      <form onSubmit={handleSaveWorkspace} style={{ ...panelStyle, display: "grid", gap: "16px" }}>
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
            简历默认会绑定到你的账号。先保存当前简历版本，再围绕一个目标岗位生成改写建议。
          </p>
        </div>

        <label style={{ display: "grid", gap: "8px", fontWeight: 600 }}>
          步骤 2 · 目标岗位 JD
          <select
            aria-label="目标岗位 JD"
            value={form.jobId}
            onChange={(event) => updateField("jobId", event.target.value)}
            style={fieldStyle}
          >
            {jobs.length === 0 ? <option value="">还没有已保存的 JD</option> : null}
            {jobs.map((job) => (
              <option key={job.id} value={job.id}>
                {jobLabel(job)}
              </option>
            ))}
          </select>
        </label>

        <label style={{ display: "grid", gap: "8px", fontWeight: 600 }}>
          简历全文
          <textarea
            aria-label="简历全文"
            rows={14}
            value={form.rawResumeText}
            onChange={(event) => updateField("rawResumeText", event.target.value)}
            placeholder="粘贴你当前正在投递的简历内容。"
            style={{ ...fieldStyle, resize: "vertical" }}
          />
        </label>

        <label style={{ display: "grid", gap: "8px", fontWeight: 600 }}>
          简历摘要
          <textarea
            aria-label="简历摘要"
            rows={4}
            value={form.resumeSummary}
            onChange={(event) => updateField("resumeSummary", event.target.value)}
            placeholder="可选。如果留空，系统会根据简历自动概括。"
            style={{ ...fieldStyle, resize: "vertical" }}
          />
        </label>

        <label style={{ display: "grid", gap: "8px", fontWeight: 600 }}>
          关键项目要点
          <textarea
            aria-label="关键项目要点"
            rows={6}
            value={form.keyProjectBullets}
            onChange={(event) => updateField("keyProjectBullets", event.target.value)}
            placeholder="每行一个项目要点。"
            style={{ ...fieldStyle, resize: "vertical" }}
          />
        </label>

        <label style={{ display: "grid", gap: "8px", fontWeight: 600 }}>
          改写重点
          <textarea
            aria-label="改写重点"
            rows={4}
            value={form.rewriteFocus}
            onChange={(event) => updateField("rewriteFocus", event.target.value)}
            placeholder="例如：突出 AI 产品 owner 意识、指标意识、跨团队推进和落地能力。"
            style={{ ...fieldStyle, resize: "vertical" }}
          />
        </label>

        {selectedJob ? (
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
            <strong style={{ display: "block", color: "#20170f" }}>{jobLabel(selectedJob)}</strong>
            {selectedJob.jdText.slice(0, 180)}
            {selectedJob.jdText.length > 180 ? "..." : ""}
          </div>
        ) : null}

        {error ? <p style={{ margin: 0, color: "#b42318", fontSize: "14px" }}>{error}</p> : null}
        {savedMessage ? (
          <p style={{ margin: 0, color: "#176448", fontSize: "14px" }}>{savedMessage}</p>
        ) : null}

        <div style={{ display: "flex", gap: "12px", flexWrap: "wrap" }}>
          <button
            type="submit"
            disabled={isSaving}
            style={{
              border: 0,
              borderRadius: "999px",
              padding: "14px 18px",
              background: "#181512",
              color: "#fff8ec",
              fontWeight: 700,
              cursor: isSaving ? "progress" : "pointer",
              opacity: isSaving ? 0.72 : 1,
            }}
          >
            {isSaving ? "保存中..." : "保存简历"}
          </button>

          <button
            type="button"
            onClick={() => void handleRewrite()}
            disabled={isRewriting}
            style={{
              border: "1px solid rgba(24, 21, 18, 0.16)",
              borderRadius: "999px",
              padding: "14px 18px",
              background: "#f6ede1",
              color: "#20170f",
              fontWeight: 700,
              cursor: isRewriting ? "progress" : "pointer",
              opacity: isRewriting ? 0.72 : 1,
            }}
          >
            {isRewriting ? "生成中..." : "生成改写建议"}
          </button>
        </div>
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
            这里不强制替你改简历，而是给出可解释的建议：该改哪里、为什么更贴岗位、哪些表达更适合出现在简历里。
          </p>
        </div>

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

            <div style={{ display: "grid", gap: "14px" }}>
              {rewrite.revisedBullets.map((section) => (
                <article
                  key={`revised-${section.sectionTitle}`}
                  style={{
                    borderRadius: "22px",
                    padding: "18px",
                    background: "#181512",
                    color: "#fff8ec",
                    display: "grid",
                    gap: "10px",
                  }}
                >
                  <h3 style={{ margin: 0, fontSize: "18px" }}>{section.sectionTitle}</h3>
                  <ul style={{ margin: 0, paddingLeft: "20px", display: "grid", gap: "8px" }}>
                    {section.bullets.map((bullet) => (
                      <li key={bullet} style={{ lineHeight: 1.65 }}>
                        {bullet}
                      </li>
                    ))}
                  </ul>
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
            先保存简历并生成一次改写建议。这里会展示分段建议和可落到简历上的新 bullet，方便你判断哪些内容值得吸收。
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
            基于当前简历、目标 JD 和平台知识库，先生成高频问题、追问点和答题框架，下一步再进入完整多轮面试。
          </p>
        </div>

        <button
          type="button"
          onClick={() => void handleGenerateAssist()}
          disabled={isGeneratingAssist}
          style={{
            width: "fit-content",
            border: 0,
            borderRadius: "999px",
            padding: "14px 18px",
            background: "#20170f",
            color: "#fff8ec",
            fontWeight: 700,
            cursor: isGeneratingAssist ? "progress" : "pointer",
            opacity: isGeneratingAssist ? 0.72 : 1,
          }}
        >
          {isGeneratingAssist ? "生成中..." : "生成模拟面试问题"}
        </button>

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

                <div style={{ display: "grid", gap: "6px" }}>
                  <strong>答题框架</strong>
                  <ol style={{ margin: 0, paddingLeft: "18px", display: "grid", gap: "6px" }}>
                    {item.answerFramework.map((point) => (
                      <li key={point} style={{ lineHeight: 1.6 }}>
                        {point}
                      </li>
                    ))}
                  </ol>
                </div>

                {item.citations.length > 0 ? (
                  <div style={{ display: "grid", gap: "6px" }}>
                    <strong>知识支撑</strong>
                    {item.citations.map((citation) => (
                      <div
                        key={citation.chunkId}
                        style={{
                          borderRadius: "16px",
                          padding: "12px 14px",
                          background: "rgba(246, 235, 218, 0.72)",
                          color: "#5c4732",
                          lineHeight: 1.6,
                          fontSize: "14px",
                        }}
                      >
                        <strong style={{ display: "block", color: "#20170f" }}>
                          {citation.sourceTitle}
                        </strong>
                        {citation.excerpt}
                      </div>
                    ))}
                  </div>
                ) : null}
              </article>
            ))}

            <p style={{ margin: 0, color: "#866747", fontSize: "14px", lineHeight: 1.6 }}>
              {assist.scopeNotice}
            </p>
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
            先生成一次面试辅助。这里会作为后续多轮 Agent 模拟面试的入口，而不是让用户自己先去拼凑问题。
          </div>
        )}

        {workspace && !rewrite ? (
          <p style={{ margin: 0, color: "#866747", fontSize: "14px" }}>
            当前简历最近更新于 {new Date(workspace.updatedAt).toLocaleString()}。
          </p>
        ) : null}
      </section>
    </section>
  );
}
