// Conversion funnel analytics — lightweight, pluggable, no PII.
import { tokens } from "@/styles/tokens";

type EventName =
  | "tip_page_viewed"
  | "amount_selected"
  | "card_entry_started"
  | "card_entry_completed"
  | "tip_submitted"
  | "tip_succeeded"
  | "tip_failed";

interface TipEvent {
  name: EventName;
  properties?: Record<string, string | number | boolean>;
  timestamp: number;
}

type AnalyticsBackend = "console" | "posthog" | "mixpanel" | "custom";

interface AnalyticsConfig {
  backend: AnalyticsBackend;
  apiKey?: string;
  host?: string;
  customSend?: (event: TipEvent) => Promise<void>;
}

let config: AnalyticsConfig = {
  backend: "console",
};

let isTestEnv = false;

export function configureAnalytics(cfg: Partial<AnalyticsConfig>) {
  config = { ...config, ...cfg };
}

export function setTestEnv(test: boolean) {
  isTestEnv = test;
}

const eventQueue: TipEvent[] = [];
let isProcessing = false;

async function processQueue() {
  if (isProcessing || eventQueue.length === 0) return;
  isProcessing = true;

  while (eventQueue.length > 0) {
    const event = eventQueue.shift()!;
    try {
      await sendEvent(event);
    } catch (err) {
      console.error("Analytics send failed:", err);
      // Re-queue on failure
      eventQueue.unshift(event);
      break;
    }
  }

  isProcessing = false;
}

async function sendEvent(event: TipEvent) {
  if (isTestEnv) return; // No-op in tests

  switch (config.backend) {
    case "console":
      console.log("[Analytics]", event.name, event.properties);
      break;
    case "posthog":
      if (config.apiKey && config.host) {
        await fetch(`${config.host}/capture/`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            api_key: config.apiKey,
            event: event.name,
            properties: {
              ...event.properties,
              $timestamp: new Date(event.timestamp).toISOString(),
            },
          }),
        });
      }
      break;
    case "mixpanel":
      if (config.apiKey) {
        await fetch("https://api.mixpanel.com/track", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            event: event.name,
            properties: {
              ...event.properties,
              token: config.apiKey,
              time: Math.floor(event.timestamp / 1000),
            },
          }),
        });
      }
      break;
    case "custom":
      if (config.customSend) {
        await config.customSend(event);
      }
      break;
  }
}

export function track(name: EventName, properties?: Record<string, string | number | boolean>) {
  if (isTestEnv) return;

  const event: TipEvent = {
    name,
    properties,
    timestamp: Date.now(),
  };

  eventQueue.push(event);
  // Process asynchronously
  setTimeout(processQueue, 0);
}

// Convenience methods for each funnel step
export const analytics = {
  tipPageViewed: (creatorHandle: string, referrer: "direct" | "social" | "embed") =>
    track("tip_page_viewed", { creator_handle: creatorHandle, referrer }),

  amountSelected: (type: "quick" | "custom") =>
    track("amount_selected", { type }),

  cardEntryStarted: () =>
    track("card_entry_started"),

  cardEntryCompleted: () =>
    track("card_entry_completed"),

  tipSubmitted: () =>
    track("tip_submitted"),

  tipSucceeded: () =>
    track("tip_succeeded"),

  tipFailed: (errorType: "card_declined" | "api_error" | "settlement_delayed") =>
    track("tip_failed", { error_type: errorType }),
};

export default analytics;