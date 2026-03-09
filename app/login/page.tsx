import React from "react";

import { LoginPanel } from "@/components/auth/login-panel";

export default async function LoginPage() {
  return (
    <main
      style={{
        minHeight: "100vh",
        display: "grid",
        placeItems: "center",
        padding: "48px 24px",
        background:
          "radial-gradient(circle at top left, rgba(232, 219, 196, 0.58), transparent 28%), #f4efe6",
      }}
    >
      <LoginPanel />
    </main>
  );
}
