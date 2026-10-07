// Hosted card-entry wrapper around the payment processor's React SDK.
//
// Featherpay's own code NEVER receives, renders, or logs a raw card number
// field. All card entry happens inside the processor's hosted component,
// which keeps the app out of PCI-DSS scope for card data.
//
// This file is a Day-1 stub; the full hosted-component wiring lands on Day 2.

import { useEffect, useRef, useState } from "react";
import { loadStripe } from "@stripe/stripe-js";

export interface StripeCardElementProps {
  publishableKey: string;
  /** Called once the processor's hosted fields become complete/valid. */
  onReadyChange: (ready: boolean) => void;
}

// The processor's hosted CardElement type is opaque to Featherpay; we only
// interact with it through `mount`, `unmount`, and `on("change")`. Cast to a
// minimal structural type rather than importing Stripe's full namespace.
type HostedCardElement = {
  mount(node: HTMLElement): void;
  unmount(): void;
  on(
    event: "change",
    handler: (event: { complete: boolean }) => void,
  ): void;
};

export function StripeCardElement({
  publishableKey,
  onReadyChange,
}: StripeCardElementProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const readyRef = useRef(false);
  const [stripeReady, setStripeReady] = useState(false);

  useEffect(() => {
    let cancelled = false;
    let card: HostedCardElement | null = null;

    async function init() {
      const stripe = await loadStripe(publishableKey);
      if (!stripe || cancelled) return;

      const elements = stripe.elements({
        clientSecret: undefined,
        appearance: {
          theme: "stripe",
          variables: {
            colorPrimary: "#F59E0B",
            colorBackground: "#FFFFFF",
            colorText: "#2B2118",
            colorTextPlaceholder: "#8A7B6C",
            colorIcon: "#6B5E51",
            borderRadius: "10px",
          },
        },
      });

      const created = elements.create("card", {
        style: {
          base: {
            color: "#2B2118",
            fontFamily:
              "ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, sans-serif",
            fontSmoothing: "antialiased",
            "::placeholder": { color: "#8A7B6C" },
          },
        },
      }) as unknown as HostedCardElement;
      card = created;

      created.on("change", (event: { complete: boolean }) => {
        if (cancelled) return;
        const next = event.complete;
        readyRef.current = next;
        setStripeReady(next);
        onReadyChange(next);
      });

      // Mount into the container. The processor's hosted component owns the
      // DOM node; Featherpay only renders the container it mounts into.
      if (containerRef.current) {
        created.mount(containerRef.current);
      }
    }

    init();

    return () => {
      cancelled = true;
      card?.unmount();
    };
  }, [publishableKey, onReadyChange]);

  return (
    <div
      ref={containerRef}
      role="region"
      aria-label="Card details"
      title="Card details"
      style={{ minHeight: "64px" }}
    />
  );
}

export default StripeCardElement;