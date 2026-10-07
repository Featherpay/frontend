// Public tip page — built fully on Day 2 (M1).
// This placeholder exists so the route compiles from Day 1.

import { tokens } from "@/styles/tokens";

export default function CreatorHandlePage() {
  return (
    <main
      style={{
        background: tokens.color.background,
        color: tokens.color.text,
        padding: tokens.spacing["4xl"],
        fontFamily: tokens.typography.fontFamily.sans,
        minHeight: "100vh",
      }}
    >
      <p style={{ margin: 0, color: tokens.color.textMuted }}>Tip page</p>
    </main>
  );
}