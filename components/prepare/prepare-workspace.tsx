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
      throw new Error(await readErrorMessage(response, "Failed to save resume workspace."));
    }

    const data = (await response.json()) as { workspace: ResumeWorkspaceRecord };
    setWorkspace(data.workspace);
    setForm((current) => ({
      ...current,
      resumeSummary: data.workspace.resumeSummary,
      keyProjectBullets: data.workspace.keyProjectBullets.join("\n"),
    }));
    setSavedMessage("Resume workspace saved.");
  }

  async function handleSaveWorkspace(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSaving(true);
    setError(null);
    setSavedMessage(null);

    try {
      await saveWorkspace();
    } catch (submissionError) {
      setError(
        submissionError instanceof Error
          ? submissionError.message
          : "Failed to save resume workspace.",
      );
    } finally {
      setIsSaving(false);
    }
  }

  async function handleRewrite() {
    if (!form.jobId) {
      setError("Select one target job before rewriting.");
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
        throw new Error(await readErrorMessage(response, "Failed to rewrite resume."));
      }

      const data = (await response.json()) as { rewrite: ResumeRewriteRecord };
      setRewrite(data.rewrite);
      setAssist(null);
      setSavedMessage("Rewrite generated.");
    } catch (submissionError) {
      setError(
        submissionError instanceof Error
          ? submissionError.message
          : "Failed to rewrite resume.",
      );
    } finally {
      setIsRewriting(false);
    }
  }

  async function handleGenerateAssist() {
    if (!form.jobId) {
      setError("Select one target job before generating interview assist.");
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
        throw new Error(
          await readErrorMessage(response, "Failed to generate interview assist."),
        );
      }

      const data = (await response.json()) as { assist: InterviewAssistResult };
      setAssist(data.assist);
      setSavedMessage("Interview assist generated.");
    } catch (submissionError) {
      setError(
        submissionError instanceof Error
          ? submissionError.message
          : "Failed to generate interview assist.",
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
            Input
          </p>
          <h2 style={{ margin: 0, fontSize: "28px", lineHeight: 1.02, letterSpacing: "-0.04em" }}>
            Tighten one resume against one target.
          </h2>
          <p style={{ margin: 0, color: "#5c4732", lineHeight: 1.7 }}>
            Save the raw material first. Then generate a rewrite that is closer to the JD
            and easier to defend in an interview.
          </p>
        </div>

        <label style={{ display: "grid", gap: "8px", fontWeight: 600 }}>
          Target Job
          <select
            aria-label="Target Job"
            value={form.jobId}
            onChange={(event) => updateField("jobId", event.target.value)}
            style={fieldStyle}
          >
            {jobs.length === 0 ? (
              <option value="">No saved JD yet</option>
            ) : null}
            {jobs.map((job) => (
              <option key={job.id} value={job.id}>
                {jobLabel(job)}
              </option>
            ))}
          </select>
        </label>

        <label style={{ display: "grid", gap: "8px", fontWeight: 600 }}>
          Resume Text
          <textarea
            aria-label="Resume Text"
            rows={14}
            value={form.rawResumeText}
            onChange={(event) => updateField("rawResumeText", event.target.value)}
            placeholder="Paste the current version of your resume."
            style={{ ...fieldStyle, resize: "vertical" }}
          />
        </label>

        <label style={{ display: "grid", gap: "8px", fontWeight: 600 }}>
          Resume Summary
          <textarea
            aria-label="Resume Summary"
            rows={4}
            value={form.resumeSummary}
            onChange={(event) => updateField("resumeSummary", event.target.value)}
            placeholder="Optional. If left blank, the system will infer one."
            style={{ ...fieldStyle, resize: "vertical" }}
          />
        </label>

        <label style={{ display: "grid", gap: "8px", fontWeight: 600 }}>
          Key Project Bullets
          <textarea
            aria-label="Key Project Bullets"
            rows={6}
            value={form.keyProjectBullets}
            onChange={(event) => updateField("keyProjectBullets", event.target.value)}
            placeholder="One bullet per line."
            style={{ ...fieldStyle, resize: "vertical" }}
          />
        </label>

        <label style={{ display: "grid", gap: "8px", fontWeight: 600 }}>
          Rewrite Focus
          <textarea
            aria-label="Rewrite Focus"
            rows={4}
            value={form.rewriteFocus}
            onChange={(event) => updateField("rewriteFocus", event.target.value)}
            placeholder="e.g. Emphasize AI PM ownership, metrics, and cross-functional decision-making."
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
            {isSaving ? "Saving..." : "Save Resume Workspace"}
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
            {isRewriting ? "Rewriting..." : "Rewrite Resume"}
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
            Rewrite
          </p>
          <h2 style={{ margin: 0, fontSize: "28px", lineHeight: 1.02, letterSpacing: "-0.04em" }}>
            Rewrite Suggestions
          </h2>
          <p style={{ margin: 0, color: "#5c4732", lineHeight: 1.7 }}>
            The middle column is for positioning. It should tell you what to change,
            why it aligns with the JD, and what new bullets are safe to claim.
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
              <strong style={{ display: "block", marginBottom: "8px" }}>Rewrite Summary</strong>
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
                    <strong style={{ color: "#20170f" }}>Current issue:</strong> {suggestion.currentIssue}
                  </p>
                  <p style={{ margin: 0, color: "#5c4732", lineHeight: 1.65 }}>
                    <strong style={{ color: "#20170f" }}>Change:</strong> {suggestion.recommendedChange}
                  </p>
                  <p style={{ margin: 0, color: "#5c4732", lineHeight: 1.65 }}>
                    <strong style={{ color: "#20170f" }}>Why this fits the JD:</strong>{" "}
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
            Save the workspace and run one rewrite. This area will show section-level
            changes and revised bullets you can actually defend in an interview.
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
            Assist
          </p>
          <h2 style={{ margin: 0, fontSize: "28px", lineHeight: 1.02, letterSpacing: "-0.04em" }}>
            Interview Assist
          </h2>
          <p style={{ margin: 0, color: "#5c4732", lineHeight: 1.7 }}>
            Use the rewritten story to predict what the interviewer will press on next.
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
          {isGeneratingAssist ? "Generating..." : "Generate Interview Assist"}
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
                  <strong>Likely Follow-ups</strong>
                  <ul style={{ margin: 0, paddingLeft: "18px", display: "grid", gap: "6px" }}>
                    {item.followUps.map((followUp) => (
                      <li key={followUp} style={{ lineHeight: 1.6 }}>
                        {followUp}
                      </li>
                    ))}
                  </ul>
                </div>

                <div style={{ display: "grid", gap: "6px" }}>
                  <strong>Answer Framework</strong>
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
                    <strong>Support</strong>
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
            Generate the rewrite first. Then this panel will turn the new wording into likely
            interviewer questions, follow-ups, and answer framing.
          </div>
        )}

        {workspace && !rewrite ? (
          <p style={{ margin: 0, color: "#866747", fontSize: "14px" }}>
            Current workspace updated at {new Date(workspace.updatedAt).toLocaleString()}.
          </p>
        ) : null}
      </section>
    </section>
  );
}
