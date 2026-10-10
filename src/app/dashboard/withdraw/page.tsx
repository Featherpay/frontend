"use client";

// Withdraw page — creator withdrawal flow.
import { Suspense, useState, useEffect, useRef } from "react";
import { apiClient } from "@/lib/api";
import { tokens } from "@/styles/tokens";

interface WithdrawPageProps {
  creatorId: string;
}

function WithdrawContent({ creatorId }: WithdrawPageProps) {
  const [step, setStep] = useState<"amount" | "confirm" | "status">("amount");
  const [amount, setAmount] = useState("");
  const [amountError, setAmountError] = useState<string | null>(null);
  const [bankAccountId, setBankAccountId] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [withdrawalId, setWithdrawalId] = useState<string | null>(null);
  const [withdrawalStatus, setWithdrawalStatus] = useState<string | null>(null);
  const [availableBalance, setAvailableBalance] = useState(0);
  const idempotencyKeyRef = useRef<string | null>(null);

  const DAILY_CAP = Number(process.env.NEXT_PUBLIC_WITHDRAWAL_DAILY_CAP_CENTS ?? 500000);
  const MIN_TIP = Number(process.env.NEXT_PUBLIC_MIN_TIP_CENTS ?? 100);

  // Fetch earnings on mount
  useEffect(() => {
    apiClient.getEarnings(creatorId).then((e) => setAvailableBalance(e.available_balance_cents));
  }, [creatorId]);

  function formatAmount(cents: number): string {
    return `$${(cents / 100).toFixed(2)}`;
  }

  function validateAmount() {
    const cents = Math.round(Number(amount) * 100);
    if (!Number.isFinite(cents) || cents <= 0) {
      setAmountError("Enter a valid amount.");
      return false;
    }
    if (cents < MIN_TIP) {
      setAmountError(`Minimum withdrawal is ${formatAmount(MIN_TIP)}.`);
      return false;
    }
    if (cents > availableBalance) {
      setAmountError(`Amount exceeds available balance (${formatAmount(availableBalance)}).`);
      return false;
    }
    if (cents > DAILY_CAP) {
      setAmountError(`Daily withdrawal cap is ${formatAmount(DAILY_CAP)}.`);
      return false;
    }
    setAmountError(null);
    return true;
  }

  async function handleSubmit() {
    if (!validateAmount()) return;
    if (!bankAccountId) {
      setError("Please connect your bank account.");
      return;
    }

    if (!idempotencyKeyRef.current) {
      idempotencyKeyRef.current = crypto.randomUUID();
    }

    setSubmitting(true);
    setError(null);

    try {
      const response = await apiClient.requestWithdrawal({
        creatorId,
        amountCents: Math.round(Number(amount) * 100),
        currency: "USD",
        processorBankAccountId: bankAccountId,
        idempotencyKey: idempotencyKeyRef.current,
      });

      setWithdrawalId(response.id);
      setStep("status");
      pollWithdrawalStatus(response.id);
    } catch (err: any) {
      if (err.isApiError && err.error === "insufficient_balance") {
        setAmountError("Insufficient balance.");
      } else if (err.isApiError && err.error === "daily_cap_exceeded") {
        setAmountError("Daily withdrawal cap exceeded.");
      } else {
        setError("Something went wrong. Please try again.");
      }
    } finally {
      setSubmitting(false);
    }
  }

  async function pollWithdrawalStatus(id: string) {
    const poll = async () => {
      try {
        const status = await apiClient.getWithdrawalStatus(id);
        setWithdrawalStatus(status.status);

        if (status.status === "processing" || status.status === "pending") {
          setTimeout(poll, 10000); // Poll every 10 seconds
        }
      } catch (err) {
        console.error("Failed to poll withdrawal status:", err);
        setTimeout(poll, 10000);
      }
    };
    poll();
  }

  function getStatusMessage() {
    switch (withdrawalStatus) {
      case "pending":
      case "processing":
        return "Your withdrawal is being processed. This usually takes 1–3 business days.";
      case "complete":
        return `Withdrawal complete. ${formatAmount(Math.round(Number(amount) * 100))} has been sent to your bank account.`;
      case "failed":
        return "Withdrawal could not be completed. Your balance has been restored. Please try again or contact support.";
      default:
        return "";
    }
  }

  if (step === "status") {
    return (
      <div style={{ maxWidth: "400px", margin: "0 auto" }}>
        <h1 style={{ fontSize: tokens.typography.fontSize["3xl"], fontWeight: tokens.typography.fontWeight.bold, marginBottom: tokens.spacing.md }}>
          Withdrawal Status
        </h1>
        <div
          style={{
            padding: tokens.spacing.xl,
            borderRadius: tokens.borderRadius.lg,
            background: tokens.color.surface,
            border: `1px solid ${tokens.color.border}`,
          }}
        >
          <div
            style={{
              padding: `${tokens.spacing.md} ${tokens.spacing.lg}`,
              borderRadius: tokens.borderRadius.md,
              fontSize: tokens.typography.fontSize.sm,
              fontWeight: tokens.typography.fontWeight.semibold,
              background:
                withdrawalStatus === "complete"
                  ? `${tokens.color.success}20`
                  : withdrawalStatus === "failed"
                  ? `${tokens.color.error}20`
                  : `${tokens.color.warning}20`,
              color:
                withdrawalStatus === "complete"
                  ? tokens.color.success
                  : withdrawalStatus === "failed"
                  ? tokens.color.error
                  : tokens.color.warning,
            }}
          >
            {withdrawalStatus ? withdrawalStatus.charAt(0).toUpperCase() + withdrawalStatus.slice(1) : "Unknown"}
          </div>
          <p style={{ marginTop: tokens.spacing.lg, color: tokens.color.textMuted, lineHeight: 1.6 }}>
            {getStatusMessage()}
          </p>
          {withdrawalStatus === "complete" && (
            <button
              onClick={() => {
                setStep("amount");
                setAmount("");
                setWithdrawalId(null);
                setWithdrawalStatus(null);
              }}
              style={{
                marginTop: tokens.spacing.lg,
                padding: `${tokens.spacing.md} ${tokens.spacing.lg}`,
                borderRadius: tokens.borderRadius.md,
                background: tokens.color.accent,
                color: tokens.color.accentText,
                border: "none",
                fontWeight: tokens.typography.fontWeight.semibold,
                cursor: "pointer",
                width: "100%",
              }}
            >
              Done
            </button>
          )}
        </div>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: "400px", margin: "0 auto" }}>
      <h1 style={{ fontSize: tokens.typography.fontSize["3xl"], fontWeight: tokens.typography.fontWeight.bold, marginBottom: tokens.spacing.xs }}>
        Withdraw Earnings
      </h1>
      <p style={{ color: tokens.color.textMuted, marginBottom: tokens.spacing["2xl"] }}>
        Available balance: <strong>{formatAmount(availableBalance)}</strong>
      </p>

      <div style={{ background: tokens.color.surface, borderRadius: tokens.borderRadius.lg, padding: tokens.spacing.xl, border: `1px solid ${tokens.color.border}` }}>
        <div style={{ marginBottom: tokens.spacing.lg }}>
          <label style={{ display: "block", fontSize: tokens.typography.fontSize.sm, color: tokens.color.textMuted, marginBottom: tokens.spacing.xs }}>
            Withdrawal Amount (USD)
          </label>
          <div style={{ display: "flex", alignItems: "center", gap: tokens.spacing.sm }}>
            <span style={{ fontSize: tokens.typography.fontSize["2xl"], fontWeight: tokens.typography.fontWeight.bold, color: tokens.color.text }}>
              $
            </span>
            <input
              type="number"
              inputMode="decimal"
              step="0.01"
              min={MIN_TIP / 100}
              max={Math.min(availableBalance, DAILY_CAP) / 100}
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              onBlur={validateAmount}
              style={{
                flex: 1,
                padding: tokens.spacing.md,
                borderRadius: tokens.borderRadius.md,
                border: `1px solid ${amountError ? tokens.color.error : tokens.color.border}`,
                background: tokens.color.background,
                color: tokens.color.text,
                fontSize: tokens.typography.fontSize["2xl"],
                fontWeight: tokens.typography.fontWeight.bold,
                textAlign: "center",
                outline: "none",
              }}
            />
          </div>
          {amountError && (
            <p style={{ marginTop: tokens.spacing.xs, color: tokens.color.error, fontSize: tokens.typography.fontSize.sm }}>
              {amountError}
            </p>
          )}
        </div>

        <div style={{ marginBottom: tokens.spacing.lg }}>
          <label style={{ display: "block", fontSize: tokens.typography.fontSize.sm, color: tokens.color.textMuted, marginBottom: tokens.spacing.xs }}>
            Bank Account
          </label>
          <div style={{ display: "flex", alignItems: "center", gap: tokens.spacing.sm, padding: tokens.spacing.md, borderRadius: tokens.borderRadius.md, border: `1px solid ${tokens.color.border}`, background: tokens.color.background }}>
            <span style={{ flex: 1, color: tokens.color.textMuted, fontSize: tokens.typography.fontSize.sm }}>
              {bankAccountId ? "Connected" : "Connect your bank account"}
            </span>
            <button
              disabled={submitting}
              style={{
                padding: `${tokens.spacing.sm} ${tokens.spacing.md}`,
                borderRadius: tokens.borderRadius.md,
                background: tokens.color.accent,
                color: tokens.color.accentText,
                border: "none",
                fontWeight: tokens.typography.fontWeight.semibold,
                cursor: "pointer",
              }}
            >
              {bankAccountId ? "Change" : "Connect"}
            </button>
          </div>
          <p style={{ marginTop: tokens.spacing.xs, fontSize: tokens.typography.fontSize.xs, color: tokens.color.textMuted }}>
            Bank details are handled securely by our payment processor. We never see your account numbers.
          </p>
        </div>

        <div style={{ marginBottom: tokens.spacing.lg, padding: tokens.spacing.md, background: `${tokens.color.accent}10`, borderRadius: tokens.borderRadius.md, border: `1px solid ${tokens.color.accent}40` }}>
          <div style={{ display: "flex", justifyContent: "space-between", fontSize: tokens.typography.fontSize.sm }}>
            <span>Daily withdrawal cap</span>
            <strong>{formatAmount(DAILY_CAP)}</strong>
          </div>
        </div>

        {error && (
          <div
            style={{
              marginBottom: tokens.spacing.lg,
              padding: tokens.spacing.md,
              borderRadius: tokens.borderRadius.md,
              background: `${tokens.color.error}15`,
              color: tokens.color.error,
              border: `1px solid ${tokens.color.error}40`,
            }}
          >
            {error}
          </div>
        )}

        <button
          onClick={() => setStep("confirm")}
          disabled={submitting || !validateAmount() || !bankAccountId}
          style={{
            width: "100%",
            padding: `${tokens.spacing.md} ${tokens.spacing.lg}`,
            borderRadius: tokens.borderRadius.lg,
            background: submitting || !validateAmount() || !bankAccountId ? tokens.color.borderStrong : tokens.color.accent,
            color: submitting || !validateAmount() || !bankAccountId ? tokens.color.textSubtle : tokens.color.accentText,
            border: "none",
            fontWeight: tokens.typography.fontWeight.semibold,
            fontSize: tokens.typography.fontSize.base,
            cursor: submitting || !validateAmount() || !bankAccountId ? "not-allowed" : "pointer",
          }}
        >
          {submitting ? "Processing…" : "Continue to Confirm"}
        </button>
      </div>
    </div>
  );
}

export default function WithdrawPage() {
  const creatorId = "creator-1"; // Would come from auth

  return (
    <Suspense fallback={<div>Loading…</div>}>
      <WithdrawContent creatorId={creatorId} />
    </Suspense>
  );
}