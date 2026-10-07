// Featherpay API client — typed end-to-end.
//
// This is the ONLY place in the frontend that talks to `featherpay/api`. All
// functions are typed on both request and response so a bad payload fails at
// compile time, not at runtime.

import { createApiError, type ApiError } from "./errors";

export const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000";

// ---------------------------------------------------------------------------
// Request / response types
// ---------------------------------------------------------------------------

export interface CreateAccountRequest {
  email: string;
  role: "creator" | "tipper";
}

export interface CreateAccountResponse {
  id: string;
  email: string;
  role: string;
  wallet_public_key: string;
  tip_link?: string;
}

export interface CreatorProfile {
  id: string;
  tip_link: string;
  display_name?: string;
}

export interface SubmitTipRequest {
  tipperId: string;
  creatorId: string;
  amountCents: number;
  currency: string;
  processorPaymentMethodId: string;
  idempotencyKey: string;
}

export interface SubmitTipResponse {
  id: string;
  tipper_id: string;
  creator_id: string;
  amount_cents: number;
  currency: string;
  status: "pending" | "converted" | "settled" | "failed" | "refunded";
  batch_id: string | null;
  contract_tx_hash: string | null;
  idempotency_key: string;
  created_at: string;
  /** Emitted by the API when the TipRouter contract circuit breaker is active.
   *  The frontend must surface this as a calm delay — never as an error. */
  settlement_delayed?: boolean;
}

export interface EarningsSummary {
  creator_id: string;
  total_earned_cents: number;
  available_balance_cents: number;
  pending_balance_cents: number;
  currency: string;
}

export interface TipHistoryItem {
  id: string;
  tipper_id: string;
  creator_id: string;
  amount_cents: number;
  currency: string;
  status: "pending" | "converted" | "settled" | "failed" | "refunded";
  batch_id: string | null;
  contract_tx_hash: string | null;
  created_at: string;
}

export interface TipHistoryResponse {
  items: TipHistoryItem[];
  page: number;
  per_page: number;
  total: number;
}

export interface RequestWithdrawalRequest {
  creatorId: string;
  amountCents: number;
  currency: string;
  processorBankAccountId: string;
  idempotencyKey: string;
}

export interface RequestWithdrawalResponse {
  id: string;
  creator_id: string;
  amount_cents: number;
  currency: string;
  status: "pending" | "processing" | "complete" | "failed";
  created_at: string;
}

export interface WithdrawalStatusResponse {
  id: string;
  creator_id: string;
  amount_cents: number;
  currency: string;
  status: "pending" | "processing" | "complete" | "failed";
  created_at: string;
  updated_at: string;
}

// ---------------------------------------------------------------------------
// Client
// ---------------------------------------------------------------------------

export interface ApiClient {
  createAccount(params: CreateAccountRequest): Promise<CreateAccountResponse>;
  getCreator(handle: string): Promise<CreatorProfile>;
  submitTip(params: SubmitTipRequest): Promise<SubmitTipResponse>;
  getEarnings(creatorId: string): Promise<EarningsSummary>;
  getTipHistory(
    creatorId: string,
    page?: number,
  ): Promise<TipHistoryResponse>;
  requestWithdrawal(
    params: RequestWithdrawalRequest,
  ): Promise<RequestWithdrawalResponse>;
  getWithdrawalStatus(id: string): Promise<WithdrawalStatusResponse>;
}

async function request<T>(
  path: string,
  init: RequestInit = {},
): Promise<T> {
  const res = await fetch(`${API_BASE_URL}${path}`, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...(init.headers ?? {}),
    },
  });

  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw createApiError(res.status, body);
  }

  return (await res.json()) as T;
}

export function createApiClient(): ApiClient {
  return {
    async createAccount(params) {
      return request<CreateAccountResponse>("/accounts", {
        method: "POST",
        body: JSON.stringify(params),
      });
    },

    async getCreator(handle) {
      return request<CreatorProfile>(`/creators/${encodeURIComponent(handle)}`);
    },

    async submitTip(params) {
      return request<SubmitTipResponse>("/tips", {
        method: "POST",
        headers: { "Idempotency-Key": params.idempotencyKey },
        body: JSON.stringify(params),
      });
    },

    async getEarnings(creatorId) {
      return request<EarningsSummary>(
        `/creators/${encodeURIComponent(creatorId)}/earnings`,
      );
    },

    async getTipHistory(creatorId, page = 1) {
      return request<TipHistoryResponse>(
        `/creators/${encodeURIComponent(creatorId)}/tips?page=${page}`,
      );
    },

    async requestWithdrawal(params) {
      return request<RequestWithdrawalResponse>("/withdrawals", {
        method: "POST",
        headers: { "Idempotency-Key": params.idempotencyKey },
        body: JSON.stringify(params),
      });
    },

    async getWithdrawalStatus(id) {
      return request<WithdrawalStatusResponse>(
        `/withdrawals/${encodeURIComponent(id)}`,
      );
    },
  };
}

/** Shared, configured instance. Consumers import this rather than building
 *  their own client. */
export const apiClient: ApiClient = createApiClient();