"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";

interface JdFormState {
  companyName: string;
  roleName: string;
  jdText: string;
  sourceUrl: string;
}

async function readErrorMessage(
  response: Response,
  fallbackMessage: string,
): Promise<string> {
  try {
    const data = (await response.json()) as { error?: string };
    return data.error || fallbackMessage;
  } catch {
    return fallbackMessage;
  }
}

const fieldStyle = {
  width: "100%",
  borderRadius: "18px",
  border: "1px solid rgba(73, 54, 31, 0.12)",
  background: "rgba(255, 252, 247, 0.92)",
  padding: "14px 16px",
  fontSize: "16px",
  color: "#20170f",
} satisfies React.CSSProperties;

export function JdForm() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState<JdFormState>({
    companyName: "",
    roleName: "",
    jdText: "",
    sourceUrl: "",
  });

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      const createResponse = await fetch("/api/jobs", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(form),
      });

      if (!createResponse.ok) {
        throw new Error(
          await readErrorMessage(createResponse, "创建岗位 JD 失败。"),
        );
      }

      const created = (await createResponse.json()) as { jobId: string };

      const analyzeResponse = await fetch(`/api/jobs/${created.jobId}/analyze`, {
        method: "POST",
      });

      if (!analyzeResponse.ok) {
        throw new Error(
          await readErrorMessage(
            analyzeResponse,
              "解析岗位 JD 失败。",
          ),
        );
      }

      router.push(`/jobs/${created.jobId}`);
      router.refresh();
    } catch (submissionError) {
      setError(
        submissionError instanceof Error
          ? submissionError.message
          : "提交失败，请稍后重试。",
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  function updateField<Key extends keyof JdFormState>(key: Key, value: string) {
    setForm((current) => ({
      ...current,
      [key]: value,
    }));
  }

  return (
    <form
      onSubmit={handleSubmit}
      style={{
        display: "grid",
        gap: "18px",
        marginTop: "28px",
      }}
    >
      <label style={{ display: "grid", gap: "8px", fontWeight: 600 }}>
        公司名称
        <input
          aria-label="公司名称"
          name="companyName"
          style={fieldStyle}
          value={form.companyName}
          onChange={(event) => updateField("companyName", event.target.value)}
        />
      </label>

      <label style={{ display: "grid", gap: "8px", fontWeight: 600 }}>
        岗位名称
        <input
          aria-label="岗位名称"
          name="roleName"
          required
          style={fieldStyle}
          value={form.roleName}
          onChange={(event) => updateField("roleName", event.target.value)}
        />
      </label>

      <label style={{ display: "grid", gap: "8px", fontWeight: 600 }}>
        岗位 JD
        <textarea
          aria-label="岗位 JD"
          name="jdText"
          required
          rows={10}
          style={{ ...fieldStyle, resize: "vertical" }}
          value={form.jdText}
          onChange={(event) => updateField("jdText", event.target.value)}
        />
      </label>

      <label style={{ display: "grid", gap: "8px", fontWeight: 600 }}>
        岗位来源链接
        <input
          aria-label="岗位来源链接"
          name="sourceUrl"
          placeholder="https://jobs.example.com/..."
          style={fieldStyle}
          value={form.sourceUrl}
          onChange={(event) => updateField("sourceUrl", event.target.value)}
        />
      </label>

      {error ? (
        <p style={{ margin: 0, color: "#b42318", fontSize: "14px" }}>{error}</p>
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
          opacity: isSubmitting ? 0.7 : 1,
        }}
      >
        {isSubmitting ? "解析中..." : "保存并解析 JD"}
      </button>
    </form>
  );
}
