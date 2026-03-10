"use client";

import React, { useState } from "react";

import { getSupabaseBrowserClient } from "@/lib/supabase/browser-client";

export function SignOutButton() {
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSignOut() {
    setIsSubmitting(true);

    try {
      const supabase = getSupabaseBrowserClient();
      await supabase.auth.signOut();
      window.location.href = "/login";
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <button
      type="button"
      onClick={() => void handleSignOut()}
      disabled={isSubmitting}
      style={{
        borderRadius: "999px",
        border: "1px solid rgba(73, 54, 31, 0.12)",
        padding: "10px 14px",
        background: "rgba(255, 252, 247, 0.92)",
        color: "#20170f",
        fontWeight: 700,
        cursor: isSubmitting ? "progress" : "pointer",
        opacity: isSubmitting ? 0.72 : 1,
      }}
    >
      {isSubmitting ? "退出中..." : "退出登录"}
    </button>
  );
}
