import Link from "next/link";
import { tokens } from "@/styles/tokens";

export default function HomePage() {
  return (
    <main
      style={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: tokens.spacing["4xl"],
        background: tokens.color.background,
        textAlign: "center",
      }}
    >
      <h1
        style={{
          fontSize: tokens.typography.fontSize["4xl"],
          fontWeight: tokens.typography.fontWeight.bold,
          color: tokens.color.text,
          margin: 0,
        }}
      >
        Featherpay
      </h1>
      <p
        style={{
          color: tokens.color.textMuted,
          fontSize: tokens.typography.fontSize.lg,
          marginTop: tokens.spacing.md,
          maxWidth: "28rem",
        }}
      >
        Send a quick, secure tip to your favorite creator. No account needed.
      </p>
    </main>
  );
}