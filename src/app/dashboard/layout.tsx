"use client";

// Dashboard layout — auth-gated, shared chrome for all dashboard routes.
import { redirect } from "next/navigation";
import { apiClient } from "@/lib/api";
import { tokens } from "@/styles/tokens";
import Link from "next/link";

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export default async function DashboardLayout({ children }: DashboardLayoutProps) {
  // In a real app, this would check auth via cookie/session
  // For now, we'll simulate with a header check or redirect to signup
  const creatorId = "creator-1"; // Would come from auth

  // Verify user is a creator
  let profile: Awaited<ReturnType<typeof apiClient.getCreator>>;
  try {
    profile = await apiClient.getCreator(creatorId);
  } catch {
    redirect("/dashboard/signup");
  }

  if (!profile) {
    redirect("/dashboard/signup");
  }

  const name = profile.display_name ?? creatorId;
  const tipLink = `https://featherpay.io/@${creatorId}`;
  const embedSnippet = `<script src="https://featherpay.io/embed.js" data-creator="${creatorId}"></script>`;

  return (
    <div
      style={{
        minHeight: "100vh",
        background: tokens.color.background,
        color: tokens.color.text,
        fontFamily: tokens.typography.fontFamily.sans,
      }}
    >
      <header
        style={{
          borderBottom: `1px solid ${tokens.color.border}`,
          padding: `${tokens.spacing.lg} ${tokens.spacing.xl}`,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          background: tokens.color.surface,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: tokens.spacing.lg }}>
          <Link
            href="/dashboard"
            style={{
              fontSize: tokens.typography.fontSize["2xl"],
              fontWeight: tokens.typography.fontWeight.bold,
              color: tokens.color.text,
              textDecoration: "none",
            }}
          >
            Featherpay
          </Link>
          <nav style={{ display: "flex", gap: tokens.spacing.md }}>
            <Link
              href="/dashboard"
              style={{
                color: tokens.color.text,
                textDecoration: "none",
                padding: `${tokens.spacing.sm} ${tokens.spacing.md}`,
                borderRadius: tokens.borderRadius.md,
                fontWeight: tokens.typography.fontWeight.medium,
              }}
            >
              Overview
            </Link>
            <Link
              href="/dashboard/history"
              style={{
                color: tokens.color.text,
                textDecoration: "none",
                padding: `${tokens.spacing.sm} ${tokens.spacing.md}`,
                borderRadius: tokens.borderRadius.md,
                fontWeight: tokens.typography.fontWeight.medium,
              }}
            >
              Tip History
            </Link>
            <Link
              href="/dashboard/withdraw"
              style={{
                color: tokens.color.text,
                textDecoration: "none",
                padding: `${tokens.spacing.sm} ${tokens.spacing.md}`,
                borderRadius: tokens.borderRadius.md,
                fontWeight: tokens.typography.fontWeight.medium,
              }}
            >
              Withdraw
            </Link>
          </nav>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: tokens.spacing.md }}>
          <span style={{ color: tokens.color.textMuted, fontSize: tokens.typography.fontSize.sm }}>
            {name}
          </span>
        </div>
      </header>

      <main style={{ padding: tokens.spacing.xl, maxWidth: "800px", margin: "0 auto" }}>
        {children}
      </main>

      {/* Tip link and embed snippet — always visible */}
      <aside
        style={{
          borderTop: `1px solid ${tokens.color.border}`,
          padding: tokens.spacing.xl,
          background: tokens.color.surface,
          marginTop: tokens.spacing["2xl"],
        }}
      >
        <h2 style={{ fontSize: tokens.typography.fontSize.lg, marginBottom: tokens.spacing.md }}>
          Your Tip Link & Widget
        </h2>
        <div style={{ display: "flex", flexDirection: "column", gap: tokens.spacing.lg }}>
          <div>
            <label style={{ display: "block", fontSize: tokens.typography.fontSize.sm, color: tokens.color.textMuted, marginBottom: tokens.spacing.xs }}>
              Tip Link
            </label>
            <div style={{ display: "flex", gap: tokens.spacing.sm }}>
              <input
                readOnly
                value={tipLink}
                style={{
                  flex: 1,
                  padding: tokens.spacing.md,
                  borderRadius: tokens.borderRadius.md,
                  border: `1px solid ${tokens.color.border}`,
                  background: tokens.color.background,
                  color: tokens.color.text,
                  fontSize: tokens.typography.fontSize.base,
                }}
              />
              <button
                onClick={() => navigator.clipboard.writeText(tipLink)}
                style={{
                  padding: `${tokens.spacing.md} ${tokens.spacing.lg}`,
                  borderRadius: tokens.borderRadius.md,
                  background: tokens.color.accent,
                  color: tokens.color.accentText,
                  border: "none",
                  fontWeight: tokens.typography.fontWeight.semibold,
                  cursor: "pointer",
                }}
              >
                Copy
              </button>
            </div>
          </div>
          <div>
            <label style={{ display: "block", fontSize: tokens.typography.fontSize.sm, color: tokens.color.textMuted, marginBottom: tokens.spacing.xs }}>
              Embed Widget Snippet
            </label>
            <div style={{ display: "flex", gap: tokens.spacing.sm }}>
              <textarea
                readOnly
                value={embedSnippet}
                rows={2}
                style={{
                  flex: 1,
                  padding: tokens.spacing.md,
                  borderRadius: tokens.borderRadius.md,
                  border: `1px solid ${tokens.color.border}`,
                  background: tokens.color.background,
                  color: tokens.color.text,
                  fontSize: tokens.typography.fontSize.sm,
                  fontFamily: tokens.typography.fontFamily.mono,
                }}
              />
              <button
                onClick={() => navigator.clipboard.writeText(embedSnippet)}
                style={{
                  padding: `${tokens.spacing.md} ${tokens.spacing.lg}`,
                  borderRadius: tokens.borderRadius.md,
                  background: tokens.color.accent,
                  color: tokens.color.accentText,
                  border: "none",
                  fontWeight: tokens.typography.fontWeight.semibold,
                  cursor: "pointer",
                  alignSelf: "flex-end",
                }}
              >
                Copy
              </button>
            </div>
          </div>
        </div>
      </aside>
    </div>
  );
}