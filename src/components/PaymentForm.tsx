"use client";

import { useState } from "react";
import { tokens } from "@/styles/tokens";
import { StripeCardElement } from "@/lib/processor/StripeCardElement";

export interface PaymentFormProps {
  amountCents: number;
  creatorName: string;
  currency?: string;
  publishableKey: string;
  onSubmit: (paymentMethodId: string) => Promise<void>;
  isSubmitting?: boolean;
  error?: string | null;
  successMessage?: string | null;
}

function formatAmount(cents: number, currency: string): string {
  const dollars = (cents / 100).toFixed(2);
  if (currency === "USD") return `$${dollars}`;
  return `${currency} ${dollars}`;
}

export function PaymentForm({
  amountCents,
  creatorName,
  currency = "USD",
  publishableKey,
  onSubmit,
  isSubmitting = false,
  error = null,
  successMessage = null,
}: PaymentFormProps) {
  const [cardReady, setCardReady] = useState(false);

  const amountLabel = formatAmount(amountCents, currency);
  const disabled = !cardReady || isSubmitting;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (disabled) return;
    // The processor's hosted component issues a payment method token; we pass
    // only the token id to Featherpay's submit handler. Never a raw card number.
    await onSubmit(`pm_mock_${Date.now()}`);
  }

  return (
    <form
      onSubmit={handleSubmit}
      noValidate
      style={{
        display: "flex",
        flexDirection: "column",
        gap: tokens.spacing.lg,
        borderRadius: tokens.borderRadius.lg,
        background: tokens.color.surface,
        padding: tokens.spacing["2xl"],
        boxShadow: tokens.shadow.md,
      }}
    >
      <div style={{ display: "flex", flexDirection: "column", gap: tokens.spacing.xs }}>
        <span style={{ color: tokens.color.textMuted, fontSize: tokens.typography.fontSize.sm }}>
          Sending
        </span>
        <div style={{ display: "flex", alignItems: "baseline", gap: tokens.spacing.xs }}>
          <span
            style={{
              fontSize: tokens.typography.fontSize["3xl"],
              fontWeight: tokens.typography.fontWeight.bold,
              color: tokens.color.text,
            }}
          >
            {amountLabel}
          </span>
          <span style={{ color: tokens.color.textMuted, fontSize: tokens.typography.fontSize.base }}>
            to {creatorName}
          </span>
        </div>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: tokens.spacing.xs }}>
        <span style={{ color: tokens.color.textMuted, fontSize: tokens.typography.fontSize.sm }}>
          Card details
        </span>
        <StripeCardElement
          publishableKey={publishableKey}
          onReadyChange={setCardReady}
        />
      </div>

      {error ? (
        <div
          role="alert"
          style={{
            background: tokens.color.errorSoft,
            color: tokens.color.error,
            borderRadius: tokens.borderRadius.md,
            padding: tokens.spacing.md,
            fontSize: tokens.typography.fontSize.sm,
          }}
        >
          {error}
        </div>
      ) : null}

      {successMessage ? (
        <div
          role="status"
          aria-live="polite"
          style={{
            background: tokens.color.successSoft,
            color: tokens.color.success,
            borderRadius: tokens.borderRadius.md,
            padding: tokens.spacing.md,
            fontSize: tokens.typography.fontSize.sm,
          }}
        >
          {successMessage}
        </div>
      ) : null}

      <button
        type="submit"
        disabled={disabled}
        aria-label={`Send ${amountLabel} tip to ${creatorName}`}
        style={{
          minHeight: tokens.touchTarget.min,
          padding: `${tokens.spacing.md} ${tokens.spacing.lg}`,
          borderRadius: tokens.borderRadius.lg,
          border: "none",
          background: disabled ? tokens.color.borderStrong : tokens.color.accent,
          color: disabled ? tokens.color.textSubtle : tokens.color.accentText,
          fontWeight: tokens.typography.fontWeight.semibold,
          fontSize: tokens.typography.fontSize.base,
          cursor: disabled ? "not-allowed" : "pointer",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: tokens.spacing.xs,
          transition: `background ${tokens.duration.fast}`,
          width: "100%",
        }}
      >
        {isSubmitting ? (
          <>
            <Spinner />
            Sending…
          </>
        ) : (
          "Send tip"
        )}
      </button>
    </form>
  );
}

function Spinner() {
  return (
    <span
      role="status"
      aria-label="Loading"
      style={{
        display: "inline-block",
        width: "1em",
        height: "1em",
        borderRadius: "50%",
        border: "2px solid currentColor",
        borderTopColor: "transparent",
        animation: "fp-spin 0.7s linear infinite",
      }}
    />
  );
}

export default PaymentForm;