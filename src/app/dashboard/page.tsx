// Dashboard overview — earnings summary and recent tips.
import { Suspense } from "react";
import { apiClient } from "@/lib/api";
import { tokens } from "@/styles/tokens";
import { EarningsChart } from "@/components/EarningsChart";

export const dynamic = "force-dynamic";

interface DashboardPageProps {
  creatorId: string;
}

async function DashboardContent({ creatorId }: DashboardPageProps) {
  const [earnings, history] = await Promise.all([
    apiClient.getEarnings(creatorId),
    apiClient.getTipHistory(creatorId, 1),
  ]);

  return (
    <div>
      <header style={{ marginBottom: tokens.spacing["2xl"] }}>
        <h1 style={{ fontSize: tokens.typography.fontSize["3xl"], fontWeight: tokens.typography.fontWeight.bold, margin: 0 }}>
          Dashboard
        </h1>
        <p style={{ color: tokens.color.textMuted, marginTop: tokens.spacing.xs }}>
          Welcome back! Here's your earnings overview.
        </p>
      </header>

      {/* Earnings Summary */}
      <section style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: tokens.spacing.lg, marginBottom: tokens.spacing["2xl"] }}>
        <StatCard
          label="Total Earned"
          value={`$${(earnings.total_earned_cents / 100).toFixed(2)}`}
          icon="💰"
        />
        <StatCard
          label="Available to Withdraw"
          value={`$${(earnings.available_balance_cents / 100).toFixed(2)}`}
          icon="💵"
          highlight
        />
        <StatCard
          label="Processing"
          value={`$${(earnings.pending_balance_cents / 100).toFixed(2)}`}
          icon="⏳"
        />
      </section>

      {/* Earnings Chart */}
      <section style={{ marginBottom: tokens.spacing["2xl"] }}>
        <h2 style={{ fontSize: tokens.typography.fontSize.xl, fontWeight: tokens.typography.fontWeight.semibold, marginBottom: tokens.spacing.md }}>
          Earnings (Last 30 Days)
        </h2>
        <div style={{ background: tokens.color.surface, borderRadius: tokens.borderRadius.lg, padding: tokens.spacing.xl, boxShadow: tokens.shadow.md }}>
          <EarningsChart history={history.items} />
        </div>
      </section>

      {/* Recent Tips */}
      <section>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: tokens.spacing.md }}>
          <h2 style={{ fontSize: tokens.typography.fontSize.xl, fontWeight: tokens.typography.fontWeight.semibold, margin: 0 }}>
            Recent Tips
          </h2>
          <a
            href="/dashboard/history"
            style={{
              color: tokens.color.accent,
              textDecoration: "none",
              fontSize: tokens.typography.fontSize.sm,
              fontWeight: tokens.typography.fontWeight.medium,
            }}
          >
            View all →
          </a>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: tokens.spacing.md }}>
          {history.items.length === 0 ? (
            <div style={{ textAlign: "center", padding: tokens.spacing["3xl"], color: tokens.color.textMuted }}>
              No tips yet. Share your tip link to start receiving tips!
            </div>
          ) : (
            history.items.map((tip) => (
              <TipRow key={tip.id} tip={tip} />
            ))
          )}
        </div>
      </section>
    </div>
  );
}

function StatCard({ label, value, icon, highlight = false }: { label: string; value: string; icon: string; highlight?: boolean }) {
  return (
    <div
      style={{
        background: highlight ? tokens.color.accentSoft : tokens.color.surface,
        border: highlight ? `2px solid ${tokens.color.accent}` : `1px solid ${tokens.color.border}`,
        borderRadius: tokens.borderRadius.lg,
        padding: tokens.spacing.lg,
        display: "flex",
        flexDirection: "column",
        gap: tokens.spacing.xs,
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: tokens.spacing.sm }}>
        <span style={{ fontSize: tokens.typography.fontSize["2xl"] }}>{icon}</span>
        <span style={{ fontSize: tokens.typography.fontSize.sm, color: tokens.color.textMuted, fontWeight: tokens.typography.fontWeight.medium }}>
          {label}
        </span>
      </div>
      <div style={{ fontSize: tokens.typography.fontSize["2xl"], fontWeight: tokens.typography.fontWeight.bold, color: highlight ? tokens.color.accent : tokens.color.text }}>
        {value}
      </div>
    </div>
  );
}

function TipRow({ tip }: { tip: any }) {
  const formatDate = (dateStr: string) => new Date(dateStr).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
  const getStatusLabel = (status: string) => {
    switch (status) {
      case "settled": return { label: "Received", color: tokens.color.success };
      case "converted": return { label: "Processing", color: tokens.color.warning };
      case "failed": return { label: "Not completed", color: tokens.color.error };
      case "refunded": return { label: "Refunded", color: tokens.color.textMuted };
      default: return { label: status, color: tokens.color.textMuted };
    }
  };

  const status = getStatusLabel(tip.status);
  const amount = `$${(tip.amount_cents / 100).toFixed(2)}`;

  return (
    <div
      style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        padding: tokens.spacing.md,
        background: tokens.color.surface,
        borderRadius: tokens.borderRadius.md,
        border: `1px solid ${tokens.color.border}`,
      }}
    >
      <div style={{ display: "flex", flexDirection: "column", gap: tokens.spacing.xs }}>
        <span style={{ fontWeight: tokens.typography.fontWeight.semibold, fontSize: tokens.typography.fontSize.base }}>
          {amount}
        </span>
        <span style={{ fontSize: tokens.typography.fontSize.sm, color: tokens.color.textMuted }}>
          {formatDate(tip.created_at)}
        </span>
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: tokens.spacing.md }}>
        <span
          style={{
            padding: `${tokens.spacing.xs} ${tokens.spacing.sm}`,
            borderRadius: tokens.borderRadius.md,
            fontSize: tokens.typography.fontSize.xs,
            fontWeight: tokens.typography.fontWeight.semibold,
            background: `${status.color}20`,
            color: status.color,
          }}
        >
          {status.label}
        </span>
        {tip.status === "settled" && tip.contract_tx_hash && (
          <a
            href={`https://stellar.expert/explorer/public/tx/${tip.contract_tx_hash}`}
            target="_blank"
            rel="noopener noreferrer"
            style={{
              fontSize: tokens.typography.fontSize.sm,
              color: tokens.color.accent,
              textDecoration: "none",
              fontWeight: tokens.typography.fontWeight.medium,
            }}
          >
            View confirmation
          </a>
        )}
      </div>
    </div>
  );
}

export default function DashboardPage() {
  const creatorId = "creator-1"; // Would come from auth

  return (
    <Suspense fallback={<div>Loading dashboard…</div>}>
      <DashboardContent creatorId={creatorId} />
    </Suspense>
  );
}