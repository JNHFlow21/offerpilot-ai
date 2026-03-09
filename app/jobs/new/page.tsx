import React from "react";

import { JdForm } from "@/components/job/jd-form";

export default async function NewJobPage() {
  return (
    <main
      style={{
        minHeight: "100vh",
        padding: "48px 24px 72px",
        background:
          "radial-gradient(circle at top left, rgba(232, 219, 196, 0.58), transparent 30%), #f4efe6",
      }}
    >
      <section
        style={{
          maxWidth: "860px",
          margin: "0 auto",
          padding: "36px",
          borderRadius: "32px",
          background: "rgba(255, 250, 242, 0.9)",
          boxShadow: "0 22px 60px rgba(56, 38, 17, 0.1)",
        }}
      >
        <p
          style={{
            margin: 0,
            textTransform: "uppercase",
            letterSpacing: "0.14em",
            color: "#866747",
            fontSize: "12px",
          }}
        >
          第一步
        </p>
        <h1 style={{ margin: "12px 0", fontSize: "48px", lineHeight: 0.96 }}>
          保存一个目标岗位 JD。
        </h1>
        <p style={{ margin: 0, color: "#5c4732", lineHeight: 1.7 }}>
          一次只围绕一个岗位准备。保存 JD 后，后续改写建议和模拟面试都会围绕它展开。
        </p>
        <JdForm />
      </section>
    </main>
  );
}
