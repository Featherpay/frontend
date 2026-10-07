// Lightweight, pluggable conversion-funnel analytics.
//
// This client is a no-op in test environments and never logs raw card data,
// email addresses, or amounts. The actual analytics backend is configured via
// `NEXT_PUBLIC_ANALYTICS_PROVIDER` — nothing here is hardcoded.
//
// Full event wiring is implemented on Day 7; this file exists so the
// directory structure is complete and the pluggable contract is defined.

export type AnalyticsEvent =
  | "tip_page_viewed"
  | "amount_selected"
  | "card_entry_started"
  | "card_entry_completed"
  | "tip_submitted"
  | "tip_succeeded"
  | "tip_failed";

export type AmountSelectionType = "quick-select" | "custom";

export type TipFailedErrorType =
  | "card_declined"
  | "api_error"
  | "settlement_delayed";

export interface AnalyticsProperties {
  creatorHandle?: string;
  referrer?: "direct" | "social" | "embed";
  selectionType?: AmountSelectionType;
  errorType?: TipFailedErrorType;
  [key: string]: unknown;
}

export interface AnalyticsBackend {
  track(event: AnalyticsEvent, properties?: AnalyticsProperties): void;
}

/** No-op backend used in tests and whenever no provider is configured. */
class NoopBackend implements AnalyticsBackend {
  track(_event: AnalyticsEvent, _properties?: AnalyticsProperties): void {
    // Intentionally silent.
  }
}

function resolveBackend(): AnalyticsBackend {
  if (typeof process === "undefined") return new NoopBackend();
  if (process.env.NODE_ENV === "test") return new NoopBackend();
  const provider = process.env.NEXT_PUBLIC_ANALYTICS_PROVIDER;
  if (!provider || provider === "noop") return new NoopBackend();
  // A real provider would be dynamically imported here. For now the noop is
  // the only built-in; consumers can register their own via `setBackend`.
  return new NoopBackend();
}

class AnalyticsClient {
  private backend: AnalyticsBackend;

  constructor() {
    this.backend = resolveBackend();
  }

  setBackend(backend: AnalyticsBackend): void {
    this.backend = backend;
  }

  track(event: AnalyticsEvent, properties?: AnalyticsProperties): void {
    this.backend.track(event, properties);
  }
}

export const analytics = new AnalyticsClient();