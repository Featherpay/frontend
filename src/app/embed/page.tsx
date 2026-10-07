// Embeddable widget entry point — minimal bundle.
//
// Full widget implementation lands on Day 4 (M2). This page exists so the
// separate embed bundle compiles cleanly from Day 1.

import { tokens } from "@/styles/tokens";

export default function EmbedPage() {
  return (
    <main
      style={{
        background: tokens.color.background,
        color: tokens.color.text,
        padding: tokens.spacing.lg,
        fontFamily: tokens.typography.fontFamily.sans,
      }}
    >
      <p style={{ margin: 0, color: tokens.color.textMuted }}>Featherpay embed</p>
    </main>
  );
}