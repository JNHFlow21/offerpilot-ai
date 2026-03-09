"use client";

import React, { useEffect, useState } from "react";

import type { KnowledgeAnswer } from "@/lib/ai/schemas/knowledge-answer";
import type {
  KnowledgeScope,
  KnowledgeSourceRecord,
  SourceType,
} from "@/lib/ai/schemas/knowledge-source";

const fieldStyle = {
  width: "100%",
  borderRadius: "18px",
  border: "1px solid rgba(73, 54, 31, 0.12)",
  background: "rgba(255, 252, 247, 0.92)",
  padding: "14px 16px",
  fontSize: "15px",
  color: "#20170f",
} satisfies React.CSSProperties;

const sourceTypeOptions: Array<{ value: SourceType; label: string }> = [
  { value: "jd", label: "JD" },
  { value: "resume", label: "简历" },
  { value: "project", label: "项目经历" },
  { value: "interview_note", label: "面经笔记" },
  { value: "knowledge_note", label: "知识笔记" },
];

const scopeOptions: Array<{ value: KnowledgeScope; label: string }> = [
  { value: "all", label: "全部资料源" },
  { value: "jd", label: "仅 JD" },
  { value: "resume", label: "仅简历" },
  { value: "project", label: "仅项目经历" },
  { value: "interview_note", label: "仅面经笔记" },
  { value: "knowledge_note", label: "仅知识笔记" },
];

interface SourceFormState {
  sourceType: SourceType;
  title: string;
  contentText: string;
}

async function readErrorMessage(response: Response, fallbackMessage: string) {
  try {
    const data = (await response.json()) as { error?: string };
    return data.error || fallbackMessage;
  } catch {
    return fallbackMessage;
  }
}

function sourceTypeLabel(sourceType: SourceType) {
  return sourceTypeOptions.find((option) => option.value === sourceType)?.label ?? sourceType;
}

export function KnowledgeWorkspace({
  initialSources = [],
  autoLoad = true,
}: {
  initialSources?: KnowledgeSourceRecord[];
  autoLoad?: boolean;
}) {
  const [sources, setSources] = useState<KnowledgeSourceRecord[]>(initialSources);
  const [isLoadingSources, setIsLoadingSources] = useState(autoLoad);
  const [sourceForm, setSourceForm] = useState<SourceFormState>({
    sourceType: "knowledge_note",
    title: "",
    contentText: "",
  });
  const [scope, setScope] = useState<KnowledgeScope>("all");
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState<KnowledgeAnswer | null>(null);
  const [sourceError, setSourceError] = useState<string | null>(null);
  const [questionError, setQuestionError] = useState<string | null>(null);
  const [sourceSavedMessage, setSourceSavedMessage] = useState<string | null>(null);
  const [isSavingSource, setIsSavingSource] = useState(false);
  const [isAsking, setIsAsking] = useState(false);

  useEffect(() => {
    if (!autoLoad) {
      setIsLoadingSources(false);
      return;
    }

    let isCancelled = false;

    async function loadSources() {
      try {
        const response = await fetch("/api/knowledge/sources");

        if (!response.ok) {
          throw new Error(
            await readErrorMessage(response, "加载资料源失败。"),
          );
        }

        const data = (await response.json()) as {
          sources?: KnowledgeSourceRecord[];
        };

        if (!isCancelled) {
          setSources(data.sources ?? []);
        }
      } catch (error) {
        if (!isCancelled) {
          setSourceError(
            error instanceof Error
              ? error.message
              : "加载资料源失败。",
          );
        }
      } finally {
        if (!isCancelled) {
          setIsLoadingSources(false);
        }
      }
    }

    void loadSources();

    return () => {
      isCancelled = true;
    };
  }, [autoLoad]);

  function updateSourceForm<Key extends keyof SourceFormState>(
    key: Key,
    value: SourceFormState[Key],
  ) {
    setSourceForm((current) => ({
      ...current,
      [key]: value,
    }));
  }

  async function handleSourceSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSavingSource(true);
    setSourceError(null);
    setSourceSavedMessage(null);

    try {
      const response = await fetch("/api/knowledge/sources", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(sourceForm),
      });

      if (!response.ok) {
        throw new Error(
          await readErrorMessage(response, "保存资料源失败。"),
        );
      }

      const data = (await response.json()) as {
        source: KnowledgeSourceRecord;
        chunkCount: number;
      };

      setSources((current) => [data.source, ...current]);
      setSourceForm({
        sourceType: sourceForm.sourceType,
        title: "",
        contentText: "",
      });
      setSourceSavedMessage(`资料源已保存，已切成 ${data.chunkCount} 个片段。`);
    } catch (error) {
      setSourceError(
        error instanceof Error
          ? error.message
          : "保存资料源失败。",
      );
    } finally {
      setIsSavingSource(false);
    }
  }

  async function handleQuestionSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsAsking(true);
    setQuestionError(null);

    try {
      const response = await fetch("/api/knowledge/ask", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          question,
          scope,
        }),
      });

      if (!response.ok) {
        throw new Error(
          await readErrorMessage(response, "提问失败。"),
        );
      }

      const data = (await response.json()) as { answer: KnowledgeAnswer };
      setAnswer(data.answer);
    } catch (error) {
      setQuestionError(
        error instanceof Error ? error.message : "提问失败。",
      );
    } finally {
      setIsAsking(false);
    }
  }

  return (
    <section
      style={{
        display: "grid",
        gap: "24px",
        gridTemplateColumns: "minmax(0, 360px) minmax(0, 1fr)",
        alignItems: "start",
      }}
    >
      <aside
        style={{
          display: "grid",
          gap: "20px",
          padding: "26px",
          borderRadius: "30px",
          background: "rgba(255, 248, 238, 0.96)",
          boxShadow: "0 20px 50px rgba(56, 38, 17, 0.08)",
          alignSelf: "start",
        }}
      >
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
            资料边界
          </p>
          <h2
            style={{
              margin: 0,
              fontSize: "28px",
              lineHeight: 1.02,
              letterSpacing: "-0.04em",
            }}
          >
            只保存你愿意被引用的资料。
          </h2>
          <p style={{ margin: 0, color: "#5c4732", lineHeight: 1.7 }}>
            每一条资料都会成为后续回答与建议的可引用上下文。内容要具体、带标签，并尽量贴近真实面试准备场景。
          </p>
        </div>

        <form onSubmit={handleSourceSubmit} style={{ display: "grid", gap: "14px" }}>
          <label style={{ display: "grid", gap: "8px", fontWeight: 600 }}>
            资料类型
            <select
              value={sourceForm.sourceType}
              onChange={(event) =>
                updateSourceForm("sourceType", event.target.value as SourceType)
              }
              style={fieldStyle}
            >
              {sourceTypeOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </label>

          <label style={{ display: "grid", gap: "8px", fontWeight: 600 }}>
            标题
            <input
              aria-label="资料标题"
              value={sourceForm.title}
              onChange={(event) => updateSourceForm("title", event.target.value)}
              placeholder="例如：字节跳动 TRAE 岗位 JD"
              style={fieldStyle}
            />
          </label>

          <label style={{ display: "grid", gap: "8px", fontWeight: 600 }}>
            资料内容
            <textarea
              aria-label="资料内容"
              rows={8}
              value={sourceForm.contentText}
              onChange={(event) =>
                updateSourceForm("contentText", event.target.value)
              }
              placeholder="粘贴 JD、项目笔记、面经笔记，或一段需要后续被引用的知识内容。"
              style={{ ...fieldStyle, resize: "vertical" }}
            />
          </label>

          {sourceError ? (
            <p style={{ margin: 0, color: "#b42318", fontSize: "14px" }}>
              {sourceError}
            </p>
          ) : null}

          {sourceSavedMessage ? (
            <p style={{ margin: 0, color: "#176448", fontSize: "14px" }}>
              {sourceSavedMessage}
            </p>
          ) : null}

          <button
            type="submit"
            disabled={isSavingSource}
            style={{
              width: "fit-content",
              border: 0,
              borderRadius: "999px",
              padding: "12px 18px",
              background: "#181512",
              color: "#fff8ec",
              fontWeight: 700,
              cursor: isSavingSource ? "progress" : "pointer",
              opacity: isSavingSource ? 0.72 : 1,
            }}
          >
            {isSavingSource ? "保存中..." : "保存资料源"}
          </button>
        </form>

        <div
          style={{
            display: "grid",
            gap: "12px",
            paddingTop: "6px",
            borderTop: "1px solid rgba(88, 66, 36, 0.12)",
          }}
        >
          <h3 style={{ margin: 0, fontSize: "16px" }}>已保存资料源</h3>
          {isLoadingSources ? (
            <p style={{ margin: 0, color: "#6f5d48" }}>加载中...</p>
          ) : null}

          {!isLoadingSources && sources.length === 0 ? (
            <p style={{ margin: 0, color: "#6f5d48", lineHeight: 1.6 }}>
              还没有资料源。先在左侧保存第一条可引用资料。
            </p>
          ) : null}

          {sources.map((source) => (
            <article
              key={source.id}
              style={{
                display: "grid",
                gap: "8px",
                padding: "16px",
                borderRadius: "20px",
                background: "rgba(255, 253, 249, 0.92)",
                border: "1px solid rgba(73, 54, 31, 0.08)",
              }}
            >
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  gap: "12px",
                  alignItems: "flex-start",
                }}
              >
                <strong style={{ fontSize: "15px", lineHeight: 1.4 }}>
                  {source.title}
                </strong>
                <span
                  style={{
                    padding: "4px 9px",
                    borderRadius: "999px",
                    background: "rgba(134, 103, 71, 0.1)",
                    color: "#775738",
                    fontSize: "12px",
                    whiteSpace: "nowrap",
                  }}
                >
                  {sourceTypeLabel(source.sourceType)}
                </span>
              </div>
              <p
                style={{
                  margin: 0,
                  color: "#5c4732",
                  lineHeight: 1.65,
                  display: "-webkit-box",
                  WebkitLineClamp: 3,
                  WebkitBoxOrient: "vertical",
                  overflow: "hidden",
                }}
              >
                {source.contentText}
              </p>
            </article>
          ))}
        </div>
      </aside>

      <section
        style={{
          display: "grid",
          gap: "20px",
          padding: "28px",
          borderRadius: "32px",
          background: "rgba(255, 250, 242, 0.94)",
          boxShadow: "0 22px 60px rgba(56, 38, 17, 0.1)",
        }}
      >
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
            带范围提问
          </p>
          <h2
            style={{
              margin: 0,
              fontSize: "34px",
              lineHeight: 0.98,
              letterSpacing: "-0.05em",
            }}
          >
            只问资料能支撑的问题。
          </h2>
          <p style={{ margin: 0, color: "#5c4732", lineHeight: 1.75 }}>
            把阅读内容压缩成可引用的回答，再把这些回答转成后续面试时可复用的表达。
          </p>
        </div>

        <form onSubmit={handleQuestionSubmit} style={{ display: "grid", gap: "14px" }}>
          <label style={{ display: "grid", gap: "8px", fontWeight: 600 }}>
            提问范围
            <select
              value={scope}
              onChange={(event) => setScope(event.target.value as KnowledgeScope)}
              style={fieldStyle}
            >
              {scopeOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </label>

          <label style={{ display: "grid", gap: "8px", fontWeight: 600 }}>
            提一个带资料边界的问题
            <textarea
              aria-label="提一个带资料边界的问题"
              rows={5}
              value={question}
              onChange={(event) => setQuestion(event.target.value)}
              placeholder="例如：这个岗位最看重什么？我该如何表达 RAG 评估？哪段项目经历最适合展开？"
              style={{ ...fieldStyle, resize: "vertical" }}
            />
          </label>

          {questionError ? (
            <p style={{ margin: 0, color: "#b42318", fontSize: "14px" }}>
              {questionError}
            </p>
          ) : null}

          <button
            type="submit"
            disabled={isAsking}
            style={{
              width: "fit-content",
              border: 0,
              borderRadius: "999px",
              padding: "14px 20px",
              background: "#181512",
              color: "#fff8ec",
              fontWeight: 700,
              cursor: isAsking ? "progress" : "pointer",
              opacity: isAsking ? 0.72 : 1,
            }}
          >
            {isAsking ? "提问中..." : "开始提问"}
          </button>
        </form>

        <section
          style={{
            display: "grid",
            gap: "14px",
            padding: "22px",
            borderRadius: "28px",
            background: "rgba(255, 255, 255, 0.66)",
            border: "1px solid rgba(73, 54, 31, 0.08)",
            minHeight: "260px",
          }}
        >
          <div style={{ display: "grid", gap: "6px" }}>
            <p
              style={{
                margin: 0,
                textTransform: "uppercase",
                letterSpacing: "0.16em",
                color: "#866747",
                fontSize: "12px",
              }}
            >
              回答区
            </p>
            <h3 style={{ margin: 0, fontSize: "20px" }}>带引用回答</h3>
          </div>

          {answer ? (
            <>
              <p
                style={{
                  margin: 0,
                  color: "#2b2118",
                  lineHeight: 1.8,
                  fontSize: "16px",
                }}
              >
                {answer.answer}
              </p>
              <p style={{ margin: 0, color: "#6c5a46", lineHeight: 1.7 }}>
                {answer.scopeNotice}
              </p>
              <div style={{ display: "grid", gap: "12px" }}>
                {answer.citations.map((citation) => (
                  <article
                    key={`${citation.sourceId}-${citation.chunkId}`}
                    style={{
                      display: "grid",
                      gap: "6px",
                      padding: "14px 16px",
                      borderRadius: "18px",
                      background: "rgba(247, 241, 232, 0.9)",
                    }}
                  >
                    <strong style={{ fontSize: "14px" }}>
                      {citation.sourceTitle}
                    </strong>
                    <p style={{ margin: 0, color: "#5c4732", lineHeight: 1.7 }}>
                      {citation.excerpt}
                    </p>
                  </article>
                ))}
              </div>
            </>
          ) : (
            <p style={{ margin: 0, color: "#6f5d48", lineHeight: 1.7 }}>
              先准备好资料源，再开始提问。回答会始终绑定到已保存内容，并带上引用，而不是变成泛泛聊天。
            </p>
          )}
        </section>
      </section>
    </section>
  );
}
