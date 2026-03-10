"use client";

import React, { useState } from "react";

import {
  getAuthRedirectUrl,
  isOAuthProviderEnabled,
} from "@/lib/supabase/auth-config";
import { getSupabaseBrowserClient } from "@/lib/supabase/browser-client";

const fieldStyle = {
  width: "100%",
  borderRadius: "18px",
  border: "1px solid rgba(73, 54, 31, 0.12)",
  background: "rgba(255, 252, 247, 0.92)",
  padding: "14px 16px",
  fontSize: "15px",
  color: "#20170f",
} satisfies React.CSSProperties;

function formatError(error: unknown, fallbackMessage: string) {
  return error instanceof Error ? error.message : fallbackMessage;
}

export function LoginPanel() {
  const [email, setEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const googleEnabled = isOAuthProviderEnabled("google");
  const githubEnabled = isOAuthProviderEnabled("github");

  async function handleEmailLogin() {
    setIsSubmitting(true);
    setError(null);
    setMessage(null);

    try {
      const supabase = getSupabaseBrowserClient();
      const { error: authError } = await supabase.auth.signInWithOtp({
        email,
        options: {
          emailRedirectTo: getAuthRedirectUrl(),
        },
      });

      if (authError) {
        throw authError;
      }

      setMessage("登录链接已发送，请到邮箱完成登录。");
    } catch (authError) {
      setError(formatError(authError, "邮箱登录失败。"));
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleOAuthLogin(provider: "google" | "github") {
    setIsSubmitting(true);
    setError(null);

    try {
      const supabase = getSupabaseBrowserClient();
      const { error: authError } = await supabase.auth.signInWithOAuth({
        provider,
        options: {
          redirectTo: getAuthRedirectUrl(),
        },
      });

      if (authError) {
        throw authError;
      }
    } catch (authError) {
      setError(formatError(authError, `${provider} 登录失败。`));
      setIsSubmitting(false);
    }
  }

  return (
    <section
      style={{
        maxWidth: "520px",
        display: "grid",
        gap: "18px",
        padding: "30px",
        borderRadius: "28px",
        background: "rgba(255, 248, 238, 0.96)",
        boxShadow: "0 20px 50px rgba(56, 38, 17, 0.08)",
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
          OfferPilot
        </p>
        <h2 style={{ margin: 0, fontSize: "32px", lineHeight: 1.02, letterSpacing: "-0.04em" }}>
          登录后开始你的求职准备
        </h2>
        <p style={{ margin: 0, color: "#5c4732", lineHeight: 1.7 }}>
          登录后即可保存你的简历、目标岗位和后续面试记录。主流程会统一收敛到一个中文工作台。
        </p>
      </div>

      <label style={{ display: "grid", gap: "8px", fontWeight: 600 }}>
        邮箱
        <input
          type="email"
          aria-label="邮箱"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          placeholder="name@example.com"
          style={fieldStyle}
        />
      </label>

      {error ? <p style={{ margin: 0, color: "#b42318", fontSize: "14px" }}>{error}</p> : null}
      {message ? <p style={{ margin: 0, color: "#176448", fontSize: "14px" }}>{message}</p> : null}

      <div style={{ display: "grid", gap: "12px" }}>
        <button
          type="button"
          onClick={() => void handleEmailLogin()}
          disabled={isSubmitting || !email}
          style={{
            border: 0,
            borderRadius: "999px",
            padding: "14px 18px",
            background: "#181512",
            color: "#fff8ec",
            fontWeight: 700,
            cursor: isSubmitting ? "progress" : "pointer",
            opacity: isSubmitting || !email ? 0.72 : 1,
          }}
        >
          邮箱登录
        </button>

        {googleEnabled ? (
          <button
            type="button"
            onClick={() => void handleOAuthLogin("google")}
            disabled={isSubmitting}
            style={{
              borderRadius: "999px",
              padding: "14px 18px",
              background: "rgba(255, 252, 247, 0.92)",
              border: "1px solid rgba(73, 54, 31, 0.12)",
              color: "#20170f",
              fontWeight: 700,
              cursor: isSubmitting ? "progress" : "pointer",
            }}
          >
            Google 登录
          </button>
        ) : null}

        {githubEnabled ? (
          <button
            type="button"
            onClick={() => void handleOAuthLogin("github")}
            disabled={isSubmitting}
            style={{
              borderRadius: "999px",
              padding: "14px 18px",
              background: "rgba(255, 252, 247, 0.92)",
              border: "1px solid rgba(73, 54, 31, 0.12)",
              color: "#20170f",
              fontWeight: 700,
              cursor: isSubmitting ? "progress" : "pointer",
            }}
          >
            GitHub 登录
          </button>
        ) : null}

        {!googleEnabled && !githubEnabled ? (
          <p style={{ margin: 0, color: "#6f5d48", fontSize: "14px", lineHeight: 1.6 }}>
            Google 和 GitHub 登录暂未开放，请先使用邮箱登录。
          </p>
        ) : null}
      </div>
    </section>
  );
}
