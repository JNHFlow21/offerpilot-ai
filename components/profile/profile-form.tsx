"use client";

import React, { useState } from "react";

import type { ProfileRecord } from "@/lib/ai/schemas/profile";

interface ProfileFormState {
  displayName: string;
  targetRoles: string;
  targetCity: string;
  resumeText: string;
  resumeSummary: string;
  selfIntroDraft: string;
}

const fieldStyle = {
  width: "100%",
  borderRadius: "20px",
  border: "1px solid rgba(73, 54, 31, 0.12)",
  background: "rgba(255, 252, 247, 0.92)",
  padding: "14px 16px",
  fontSize: "16px",
  color: "#20170f",
} satisfies React.CSSProperties;

function toFormState(profile?: ProfileRecord | null): ProfileFormState {
  return {
    displayName: profile?.displayName ?? "",
    targetRoles: profile?.targetRoles.join(", ") ?? "",
    targetCity: profile?.targetCity ?? "",
    resumeText: profile?.resumeText ?? "",
    resumeSummary: profile?.resumeSummary ?? "",
    selfIntroDraft: profile?.selfIntroDraft ?? "",
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

export function ProfileForm({
  initialProfile,
}: {
  initialProfile?: ProfileRecord | null;
}) {
  const [form, setForm] = useState<ProfileFormState>(toFormState(initialProfile));
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [savedMessage, setSavedMessage] = useState<string | null>(null);

  function updateField<Key extends keyof ProfileFormState>(key: Key, value: string) {
    setForm((current) => ({
      ...current,
      [key]: value,
    }));
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSaving(true);
    setError(null);
    setSavedMessage(null);

    try {
      const response = await fetch("/api/profile", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          displayName: form.displayName,
          targetRoles: form.targetRoles
            .split(",")
            .map((role) => role.trim())
            .filter(Boolean),
          targetCity: form.targetCity,
          resumeText: form.resumeText,
          resumeSummary: form.resumeSummary,
          selfIntroDraft: form.selfIntroDraft,
        }),
      });

      if (!response.ok) {
        throw new Error(await readErrorMessage(response, "保存个人资料失败。"));
      }

      setSavedMessage("个人资料已保存。");
    } catch (submissionError) {
      setError(
        submissionError instanceof Error
          ? submissionError.message
          : "保存个人资料失败。",
      );
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      style={{
        display: "grid",
        gap: "18px",
      }}
    >
      <div
        style={{
          display: "grid",
          gap: "18px",
          gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
        }}
      >
        <label style={{ display: "grid", gap: "8px", fontWeight: 600 }}>
          姓名
          <input
            aria-label="姓名"
            name="displayName"
            style={fieldStyle}
            value={form.displayName}
            onChange={(event) => updateField("displayName", event.target.value)}
          />
        </label>

        <label style={{ display: "grid", gap: "8px", fontWeight: 600 }}>
          目标城市
          <input
            aria-label="目标城市"
            name="targetCity"
            style={fieldStyle}
            value={form.targetCity}
            onChange={(event) => updateField("targetCity", event.target.value)}
          />
        </label>
      </div>

      <label style={{ display: "grid", gap: "8px", fontWeight: 600 }}>
        目标岗位方向
        <input
          aria-label="目标岗位方向"
          name="targetRoles"
          placeholder="例如：AI 产品经理实习生、产品经理实习生"
          style={fieldStyle}
          value={form.targetRoles}
          onChange={(event) => updateField("targetRoles", event.target.value)}
        />
      </label>

      <label style={{ display: "grid", gap: "8px", fontWeight: 600 }}>
        简历摘要
        <textarea
          aria-label="简历摘要"
          name="resumeSummary"
          rows={4}
          style={{ ...fieldStyle, resize: "vertical" }}
          value={form.resumeSummary}
          onChange={(event) => updateField("resumeSummary", event.target.value)}
        />
      </label>

      <label style={{ display: "grid", gap: "8px", fontWeight: 600 }}>
        自我介绍草稿
        <textarea
          aria-label="自我介绍草稿"
          name="selfIntroDraft"
          rows={5}
          style={{ ...fieldStyle, resize: "vertical" }}
          value={form.selfIntroDraft}
          onChange={(event) => updateField("selfIntroDraft", event.target.value)}
        />
      </label>

      <label style={{ display: "grid", gap: "8px", fontWeight: 600 }}>
        简历全文
        <textarea
          aria-label="简历全文"
          name="resumeText"
          rows={10}
          style={{ ...fieldStyle, resize: "vertical" }}
          value={form.resumeText}
          onChange={(event) => updateField("resumeText", event.target.value)}
        />
      </label>

      {error ? (
        <p style={{ margin: 0, color: "#b42318", fontSize: "14px" }}>{error}</p>
      ) : null}

      {savedMessage ? (
        <p style={{ margin: 0, color: "#176448", fontSize: "14px" }}>
          {savedMessage}
        </p>
      ) : null}

      <button
        type="submit"
        disabled={isSaving}
        style={{
          width: "fit-content",
          border: 0,
          borderRadius: "999px",
          padding: "14px 20px",
          background: "#181512",
          color: "#fff8ec",
          fontWeight: 700,
          cursor: isSaving ? "progress" : "pointer",
          opacity: isSaving ? 0.7 : 1,
        }}
      >
        {isSaving ? "保存中..." : "保存个人资料"}
      </button>
    </form>
  );
}
