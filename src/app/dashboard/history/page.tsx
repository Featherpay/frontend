"use client";

// Tip history page — paginated full history.
import { Suspense, useState } from "react";
import { apiClient } from "@/lib/api";
import { tokens } from "@/styles/tokens";

interface HistoryPageProps {
  creatorId: string;
}

function HistoryContent({ creatorId }: HistoryPageProps) {
  const [page, setPage] = useState(1);
  const [history, setHistory] = useState<any>({ items: [], total: 0, page: 1, per_page: 20 });
  const [loading, setLoading] = useState(true);

  const fetchHistory = async (pageNum: number) => {
    setLoading(true);
    try {
      const data = await apiClient.getTipHistory(creatorId, pageNum);
      setHistory(data);
      setPage(pageNum);
    } catch (err) {
      console.error("Failed to fetch history:", err);
    } finally {
      setLoading(false);
    }
  };

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

  return (
    <div>
      <header style={{ marginBottom: tokens.spacing["2xl"] }}>
        <h1 style={{ fontSize: tokens.typography.fontSize["3xl"], fontWeight: tokens.typography.fontWeight.bold, margin: 0 }}>
          Tip History
        </h1>
        <p style={{ color: tokens.color.textMuted, marginTop: tokens.spacing.xs }}>
          All tips you&apos;ve received. {history.total} total.
        </p>
      </header>

      {loading ? (
        <div style={{ textAlign: "center", padding: tokens.spacing["3xl"] }}>Loading…</div>
      ) : history.items.length === 0 ? (
        <div style={{ textAlign: "center", padding: tokens.spacing["3xl"], color: tokens.color.textMuted }}>
          No tips yet. Share your tip link to start receiving tips!
        </div>
      ) : (
        <>
          <div style={{ display: "flex", flexDirection: "column", gap: tokens.spacing.md, marginBottom: tokens.spacing["2xl"] }}>
            {history.items.map((tip: any) => {
              const status = getStatusLabel(tip.status);
              const amount = `$${(tip.amount_cents / 100).toFixed(2)}`;

              return (
                <div
                  key={tip.id}
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
            })}
          </div>

          {/* Pagination */}
          <div style={{ display: "flex", justifyContent: "center", alignItems: "center", gap: tokens.spacing.md }}>
            <button
              onClick={() => fetchHistory(page - 1)}
              disabled={page <= 1 || loading}
              style={{
                padding: `${tokens.spacing.sm} ${tokens.spacing.lg}`,
                borderRadius: tokens.borderRadius.md,
                background: page <= 1 ? tokens.color.border : tokens.color.accent,
                color: page <= 1 ? tokens.color.textMuted : tokens.color.accentText,
                border: "none",
                fontWeight: tokens.typography.fontWeight.semibold,
                cursor: page <= 1 ? "not-allowed" : "pointer",
              }}
            >
              Previous
            </button>
            <span style={{ color: tokens.color.textMuted }}>
              Page {page} of {Math.ceil(history.total / 20)}
            </span>
            <button
              onClick={() => fetchHistory(page + 1)}
              disabled={page >= Math.ceil(history.total / 20) || loading}
              style={{
                padding: `${tokens.spacing.sm} ${tokens.spacing.lg}`,
                borderRadius: tokens.borderRadius.md,
                background: page >= Math.ceil(history.total / 20) ? tokens.color.border : tokens.color.accent,
                color: page >= Math.ceil(history.total / 20) ? tokens.color.textMuted : tokens.color.accentText,
                border: "none",
                fontWeight: tokens.typography.fontWeight.semibold,
                cursor: page >= Math.ceil(history.total / 20) ? "not-allowed" : "pointer",
              }}
            >
              Next
            </button>
          </div>
        </>
      )}
    </div>
  );
}

export default function HistoryPage() {
  const creatorId = "creator-1"; // Would come from auth

  return (
    <Suspense fallback={<div>Loading history…</div>}>
      <HistoryContent creatorId={creatorId} />
    </Suspense>
  );
}