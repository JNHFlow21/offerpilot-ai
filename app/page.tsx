import React from "react";
import Link from "next/link";

export default function HomePage() {
  return (
    <main
      style={{
        minHeight: "100vh",
        display: "grid",
        placeItems: "center",
        padding: "48px 24px",
      }}
    >
      <section
        style={{
          maxWidth: "900px",
          width: "100%",
          borderRadius: "32px",
          padding: "40px",
          background:
            "linear-gradient(135deg, rgba(255,250,241,0.98), rgba(235,225,209,0.96))",
          boxShadow: "0 20px 60px rgba(46, 28, 8, 0.12)",
        }}
      >
        <p
          style={{
            margin: 0,
            fontSize: "13px",
            letterSpacing: "0.18em",
            textTransform: "uppercase",
            color: "#7a5e3a",
          }}
        >
          中文 AI 求职准备工作台
        </p>
        <h1
          style={{
            margin: "16px 0 12px",
            fontSize: "clamp(2.8rem, 7vw, 5.6rem)",
            lineHeight: 0.96,
            letterSpacing: "-0.06em",
          }}
        >
          OfferPilot
        </h1>
        <p
          style={{
            maxWidth: "52ch",
            margin: 0,
            fontSize: "18px",
            lineHeight: 1.6,
            color: "#4b3a28",
          }}
        >
          登录后保存你的简历与目标岗位 JD。系统会基于岗位要求和平台知识库给出改写建议，再继续进入模拟面试。
        </p>
        <div
          style={{
            display: "flex",
            gap: "12px",
            flexWrap: "wrap",
            marginTop: "32px",
          }}
        >
          <Link
            href="/login"
            style={{
              borderRadius: "999px",
              padding: "14px 20px",
              background: "#181512",
              color: "#fff8ec",
              fontWeight: 600,
            }}
          >
            进入工作台
          </Link>
        </div>
      </section>
    </main>
  );
}
