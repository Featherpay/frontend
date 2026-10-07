// Typed API error type. The frontend never inspects raw HTTP status codes or
// error payloads from `featherpay/api` when presenting messages to users —
// everything goes through a friendly, non-technical message.

export interface ApiErrorPayload {
  error?: string;
  message?: string;
}

export class ApiError extends Error {
  readonly _tag = "ApiError";
  readonly status: number;
  readonly code: string | undefined;

  constructor(status: number, body: ApiErrorPayload) {
    super(body?.message ?? "Something went wrong.");
    this.name = "ApiError";
    this.status = status;
    this.code = body?.error;
  }

  /** True when the API signals settlement is temporarily delayed by the
   *  TipRouter contract circuit breaker. */
  get isSettlementDelayed(): boolean {
    return this.code === "settlement_delayed";
  }

  /** True when the card was declined by the processor. */
  get isCardDeclined(): boolean {
    return this.code === "card_declined";
  }

  /** True when the failure is a network/transport-level problem, not a
   *  server-side validation error. */
  get isNetworkError(): boolean {
    return this.status === 0 || this.status >= 500;
  }
}

export function createApiError(
  status: number,
  body: ApiErrorPayload,
): ApiError {
  return new ApiError(status, body);
}

/** Class guard that works even across realm boundaries (e.g. when an error is
 *  re-thrown from a worker). */
export function isApiError(err: unknown): err is ApiError {
  return (
    err instanceof Error &&
    "_tag" in err &&
    (err as { _tag?: unknown })._tag === "ApiError"
  );
}