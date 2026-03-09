import React from "react";

import { ProfileForm } from "@/components/profile/profile-form";
import { getProfileStore } from "@/lib/services/profile-service";

export default async function ProfilePage() {
  const profile = await getProfileStore().getProfile();

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
          maxWidth: "1080px",
          margin: "0 auto",
          display: "grid",
          gap: "24px",
          gridTemplateColumns: "minmax(0, 320px) minmax(0, 1fr)",
        }}
      >
        <aside
          style={{
            padding: "28px",
            borderRadius: "28px",
            background: "rgba(255, 248, 238, 0.95)",
            boxShadow: "0 20px 50px rgba(56, 38, 17, 0.08)",
            alignSelf: "start",
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
            Phase 2
          </p>
          <h1
            style={{
              margin: "14px 0 12px",
              fontSize: "42px",
              lineHeight: 0.98,
              letterSpacing: "-0.05em",
            }}
          >
            Build your prep profile.
          </h1>
          <p style={{ margin: 0, color: "#5c4732", lineHeight: 1.7 }}>
            Turn your raw background into reusable prep context. This page should
            become the source of truth for every later module.
          </p>
          <div
            style={{
              marginTop: "22px",
              display: "grid",
              gap: "10px",
              color: "#4f3f31",
              lineHeight: 1.6,
            }}
          >
            <div>1. Lock target roles and location.</div>
            <div>2. Compress your resume into reusable signals.</div>
            <div>3. Draft the self-intro you can train against later.</div>
          </div>
        </aside>

        <section
          style={{
            padding: "32px",
            borderRadius: "32px",
            background: "rgba(255, 250, 242, 0.92)",
            boxShadow: "0 22px 60px rgba(56, 38, 17, 0.1)",
          }}
        >
          <ProfileForm initialProfile={profile} />
        </section>
      </section>
    </main>
  );
}
