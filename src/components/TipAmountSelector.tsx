// TipAmountSelector.tsx
import { useEffect, useRef, useState } from "react";
import { tokens } from "@/styles/tokens";

export interface TipAmountSelectorProps {
  minCents: number;
  maxCents: number;
  defaultCents?: number;
  currency?: string;
  onChange: (cents: number) => void;
  id?: string;
}

const QUICK_SELECT_CENTS = [100, 500, 1000];

function formatAmount(cents: number, currency: string): string {
  const dollars = (cents / 100).toFixed(2);
  if (currency === "USD") return `$${dollars}`;
  return `${currency} ${dollars}`;
}

export function TipAmountSelector(props: TipAmountSelectorProps) {
  const { minCents, maxCents, defaultCents = 500, currency = "USD", onChange, id = "tip-amount" } = props;
  const [selectedCents, setSelectedCents] = useState<number>(defaultCents);
  const [customValue, setCustomValue] = useState<string>("");
  const [customError, setCustomError] = useState<string | null>(null);
  const [hasInteracted, setHasInteracted] = useState(false);
  const buttonRefs = useRef<Array<HTMLButtonElement | null>>(Array(3).fill(null));
  const customInputRef = useRef<HTMLInputElement | null>(null);

  // Pre-select the default on first mount.
  useEffect(() => {
    onChange(defaultCents);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Focus the button when focusedIndex changes
  // useEffect(() => {
  //   if (buttonRefs.current[focusedIndex]) {
  //     buttonRefs.current[focusedIndex].focus();
  //   }
  // }, [focusedIndex]);

  function selectQuick(cents: number) {
    setHasInteracted(true);
    setCustomValue("");
    setCustomError(null);
    setSelectedCents(cents);
    onChange(cents);
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
      setCustomError("Tips must be at least $1.00.");
      return;
    }
    if (cents > maxCents) {
      setCustomError("Tips can't be more than $100.00.");
      return;
    }

    setSelectedCents(cents);
    onChange(cents);
  }

  const isCustomSelected =
    selectedCents !== null && !QUICK_SELECT_CENTS.includes(selectedCents);

  return (
    <div
      id={id}
      role="radiogroup"
      aria-label={`Tip amount (selectedCents: ${selectedCents})`}
    >
      {QUICK_SELECT_CENTS.map((amountValue, index) => {
        const checked = selectedCents === amountValue;
        const amount = (amountValue / 100).toFixed(2);
        return (
          <button
            key={amountValue}
            type="button"
            role="radio"
            aria-checked={checked}
            aria-label={`$${amount}`}
            onClick={() => {
              selectQuick(amountValue);
            }}
            onKeyDown={(e) => {
              // Handle keyboard navigation
              if (e.key === "ArrowRight") {
                e.preventDefault();
                const currentIndex = buttonRefs.current.indexOf(e.target as HTMLButtonElement);
                if (currentIndex < QUICK_SELECT_CENTS.length - 1) {
                  buttonRefs.current[currentIndex + 1]?.focus();
                }
              } else if (e.key === "ArrowLeft") {
                e.preventDefault();
                const currentIndex = buttonRefs.current.indexOf(e.target as HTMLButtonElement);
                if (currentIndex > 0) {
                  buttonRefs.current[currentIndex - 1]?.focus();
                }
              } else if (e.key === "Tab") {
                e.preventDefault();
                const currentIndex = buttonRefs.current.indexOf(e.target as HTMLButtonElement);
                if (currentIndex < QUICK_SELECT_CENTS.length - 1) {
                  buttonRefs.current[currentIndex + 1]?.focus();
                } else {
                  // On the last radio button, Tab should move to the custom input
                  customInputRef.current?.focus();
                }
              }
            }}
            ref={(el) => {
              buttonRefs.current[index] = el;
            }}
            style={{
              minHeight: tokens.touchTarget.min,
              minWidth: tokens.touchTarget.min,
              padding: `${tokens.spacing.sm} ${tokens.spacing.lg}`,
              borderRadius: tokens.borderRadius.lg,
              border: checked ? `2px solid ${tokens.color.accent}` : `1px solid ${tokens.color.border}`,
              background: checked ? tokens.color.accentSoft : tokens.color.surface,
              color: checked ? tokens.color.accentText : tokens.color.text,
              fontWeight: checked ? tokens.typography.fontWeight.semibold : tokens.typography.fontWeight.medium,
              cursor: "pointer",
              textAlign: "center",
              transition: `border-color ${tokens.duration.fast}, background ${tokens.duration.fast}`
            }}
          >
            ${amount}
          </button>
        );
      })}
      <div style={{ display: "flex", flexDirection: "column", gap: tokens.spacing.xs }}>
        <label htmlFor={`${id}-custom`}>
          Or enter a custom amount
        </label>
        <div style={{ display: "flex", alignItems: "center", gap: tokens.spacing.xs }}>
          <span
            style={{
              color: tokens.color.text,
              fontSize: tokens.typography.fontSize.lg,
              fontWeight: tokens.typography.fontWeight.medium
            }}
          >
            $
          </span>
          <input
            ref={customInputRef}
            id={`${id}-custom`}
            type="number"
            inputMode="decimal"
            min={minCents / 100}
            max={maxCents / 100}
            step="0.01"
            placeholder="0.00"
            value={customValue}
            onChange={(e) => onCustomChange(e.target.value)}
            style={{
              flex: 1,
              minHeight: tokens.touchTarget.min,
              padding: `${tokens.spacing.sm} ${tokens.spacing.md}`,
              borderRadius: tokens.borderRadius.lg,
              border: `1px solid ${customError ? tokens.color.error : tokens.color.border}`,
              background: tokens.color.surface,
              color: tokens.color.text,
              fontSize: tokens.typography.fontSize.lg,
              textAlign: "center",
            }}
          />
        </div>
        {customError ? (
          <span
            role="alert"
            style={{ color: tokens.color.error, fontSize: tokens.typography.fontSize.sm }}
          >
            {customError}
          </span>
        ) : (
          <span style={{ color: tokens.color.textSubtle, fontSize: tokens.typography.fontSize.xs }}>
            Between {formatAmount(minCents, currency)} and {formatAmount(maxCents, currency)}.
          </span>
        )}
      </div>
    </div>
  );
}