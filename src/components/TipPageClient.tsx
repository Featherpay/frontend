// TipPageClient.tsx
// Interactive client-side component for the tip flow.

import { useCallback, useEffect, useRef, useState } from "react";
import { apiClient } from "@/lib/api";
import { TipAmountSelector } from "@/components/TipAmountSelector";
import { PaymentForm } from "@/components/PaymentForm";
import { tokens } from "@/styles/tokens";

export interface TipPageClientProps {
  creatorHandle: string;
  creatorName: string;
  minCents: number;
  maxCents: number;
}

export default function TipPageClient({
  creatorHandle,
  creatorName,
  minCents,
  maxCents,
}: TipPageClientProps) {
  const [amountCents, setAmountCents] = useState(500); // Pre-select $5
  const [customValue, setCustomValue] = useState("");
  const [customError, setCustomError] = useState<string | null>(null);
  const [hasInteracted, setHasInteracted] = useState(false);
  const [cardReady, setCardReady] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [settlementDelayed, setSettlementDelayed] = useState(false);
  const idempotencyKeyRef = useRef<string | null>(null);

  const currency = "USD";

  function formatAmount(cents: number): string {
    const dollars = (cents / 100).toFixed(2);
    return `$${dollars}`;
  }

  function selectQuick(cents: number) {
    setHasInteracted(true);
    setCustomValue("");
    setCustomError(null);
    setAmountCents(cents);
  }

  function onCustomChange(value: string) {
    setHasInteracted(true);
    setCustomValue(value);
    setCustomError(null);

    const trimmed = value.trim();
    if (trimmed === "") {
      return;
    }

    const parsed = Number(trimmed);
    if (!Number.isFinite(parsed)) {
      setCustomError("Enter a whole number of dollars.");
      return;
    }

    const cents = Math.round(parsed * 100);
    if (cents < minCents) {
      setCustomError(`Tips must be at least ${formatAmount(minCents)}.`);
      return;
    }
    if (cents > maxCents) {
      setCustomError(`Tips can't be more than ${formatAmount(maxCents)}.`);
      return;
    }

    setAmountCents(cents);
  }

  const isCustomSelected =
    amountCents !== null && ![100, 500, 1000].includes(amountCents);

  async function handleSubmit() {
    if (submitting) return;
    if (amountCents === null || !cardReady) return;

    // Client-side UUID for idempotency key (preserved on retry)
    if (!idempotencyKeyRef.current) {
      idempotencyKeyRef.current = crypto.randomUUID();
    }

    setSubmitting(true);
    setError(null);
    setSuccessMessage(null);
    setSettlementDelayed(false);

    try {
      const response = await apiClient.submitTip({
        tipperId: "tipper_placeholder", // Would come from auth in real app
        creatorId: creatorHandle, // Simplified - real app would map handle to ID
        amountCents,
        currency,
        processorPaymentMethodId: `pm_mock_${Date.now()}`, // From processor
        idempotencyKey: idempotencyKeyRef.current,
      });

      // Check for settlement delayed signal from API
      if (response.settlement_delayed) {
        setSettlementDelayed(true);
        setSuccessMessage(
          `Your tip was received and is being processed — ${creatorName} will see it soon.`
        );
      } else {
        setSuccessMessage(
          `Your ${formatAmount(amountCents)} tip is on its way to ${creatorName} ✓`
        );
      }
    } catch (err: any) {
      if (err.isApiError && err.isSettlementDelayed) {
        // Settlement delayed — show calm message, not error
        setSettlementDelayed(true);
        setSuccessMessage(
          `Your tip was received and is being processed — ${creatorName} will see it soon.`
        );
      } else if (err.isApiError && err.isCardDeclined) {
        setError("Your card wasn't accepted. Please try a different card.");
      } else {
        // Network or API error — friendly message, allow retry with same key
        setError("Something went wrong. Your card wasn't charged.");
      }
    } finally {
      setSubmitting(false);
    }
  }

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
        color: tokens.color.text,
        fontFamily: tokens.typography.fontFamily.sans,
      }}
    >
      <div style={{ width: "100%", maxWidth: "26rem" }}>
        <h1
          style={{
            fontSize: tokens.typography.fontSize["4xl"],
            fontWeight: tokens.typography.fontWeight.bold,
            margin: 0,
            textAlign: "center",
          }}
        >
          Support {creatorName}
        </h1>
        <p
          style={{
            color: tokens.color.textMuted,
            fontSize: tokens.typography.fontSize.base,
            margin: `${tokens.spacing.sm} 0 0`,
            textAlign: "center",
          }}
        >
          Send a quick tip — no account needed.
        </p>

        <div style={{ marginTop: tokens.spacing["3xl"] }}>
          <TipAmountSelector
            minCents={minCents}
            maxCents={maxCents}
            currency={currency}
            onChange={setAmountCents}
            id="tip-amount-selector"
          />
        </div>

        <div style={{ marginTop: tokens.spacing["3xl"] }}>
          <PaymentForm
            amountCents={amountCents}
            creatorName={creatorName}
            currency={currency}
            publishableKey={
              process.env.NEXT_PUBLIC_PAYMENT_PROCESSOR_PUBLIC_KEY ?? ""
            }
            onSubmit={handleSubmit}
            isSubmitting={submitting}
            error={error}
            successMessage={successMessage || (settlementDelayed ? undefined : null)}
          />
        </div>

        {successMessage && !settlementDelayed && !submitting ? (
          <div
            role="status"
            aria-live="polite"
            style={{
              marginTop: tokens.spacing["2xl"],
              textAlign: "center",
              color: tokens.color.success,
              fontSize: tokens.typography.fontSize.lg,
            }}
          >
            {successMessage}
          </div>
        ) : null}
      </div>
    </main>
  );
}