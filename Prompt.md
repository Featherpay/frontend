# Featherpay Frontend — 7-Day Intensive Development Prompt

> **Goal:** Reach ~90% completion of the `featherpay/frontend` app — covering M0 through M6 of the project plan — delivering a fully functional, accessible, and polished user-facing surface that contributors can extend with confidence.
>
> **Stack:** Next.js · TypeScript · Playwright (e2e) · Jest/Vitest (unit) · `featherpay/api` (backend)
>
> **Key constraint:** A mainstream, non-crypto user should never notice a blockchain is involved. Zero crypto vocabulary anywhere in the product copy. No wallet addresses, keys, or chain jargon — ever.

---

## Day 1 — Repo Scaffold, Design Tokens, and CI (M0)

**Objective:** Get a running Next.js app with the full directory structure, design tokens established, and CI green before any UI is built.

```
You are building `featherpay/frontend` — the user-facing surface of Featherpay: the tip widget, the embeddable snippet, and the creator dashboard.

Before writing any UI, complete the following:

1. Scaffold the repo with this exact structure:
   frontend/
   ├── src/
   │   ├── app/
   │   │   ├── [creatorHandle]/       # Public tip page (featherpay.io/@creatorname)
   │   │   ├── dashboard/             # Creator dashboard (auth-gated)
   │   │   │   ├── earnings/
   │   │   │   ├── history/
   │   │   │   └── withdraw/
   │   │   └── embed/                 # Embeddable widget entry point (minimal bundle)
   │   ├── components/
   │   │   ├── TipAmountSelector.tsx
   │   │   ├── PaymentForm.tsx        # Wraps the processor's hosted component
   │   │   └── EarningsChart.tsx
   │   ├── lib/
   │   │   ├── api/                   # featherpay/api client
   │   │   └── analytics/             # Conversion funnel tracking
   │   └── styles/
   │       └── tokens.ts              # Design tokens
   ├── public/
   ├── tests/
   ├── README.md
   └── PLAN.md

2. Define design tokens in `src/styles/tokens.ts`. The aesthetic is warm, simple, and "tip jar" — not fintech, not crypto, not a blockchain explorer. Include:
   - Color palette: warm neutrals, an approachable accent color (not bank-blue or exchange-orange)
   - Typography scale: readable at small sizes, friendly weight (not heavy/corporate)
   - Spacing scale
   - Border radius: slightly rounded — approachable, not clinical
   - Shadow scale: subtle, not dramatic
   Export tokens as typed constants, not raw CSS variables, so they're enforced at the TypeScript level.

3. Build the `featherpay/api` client skeleton in `src/lib/api/`:
   - `createAccount(params)` — POST /accounts
   - `getCreator(handle)` — GET /creators/:id
   - `submitTip(params)` — POST /tips (must forward `Idempotency-Key` header)
   - `getEarnings(creatorId)` — GET /creators/:id/earnings
   - `getTipHistory(creatorId, page)` — GET /creators/:id/tips
   - `requestWithdrawal(params)` — POST /withdrawals (must forward `Idempotency-Key` header)
   - `getWithdrawalStatus(id)` — GET /withdrawals/:id
   All functions must be typed end-to-end. Export a single `apiClient` instance configured from `NEXT_PUBLIC_API_URL`.

4. Set up CI (GitHub Actions) running on every PR:
   - `npm run lint`
   - `npm run typecheck`
   - `npm run test`
   - `npm run build`

5. Add a `npm run test:a11y` script stub (even if empty) and a `npm run test:e2e` script stub — these will be filled in during the week.

The app must compile cleanly with `npm run build` and `npm run typecheck` before Day 2 begins. Zero TypeScript errors, zero lint errors.
```

---

## Day 2 — Public Tip Page: Amount Selection and Card Entry (M1, Part 1)

**Objective:** Build the complete tip-entry UI on `/@creatorname` — amount selector, card entry via the processor's hosted component, and the success state.

```
Build the public tip page at `src/app/[creatorHandle]/` for `featherpay/frontend`.

This is the highest-conversion-sensitivity surface in the product. Every design decision must minimize friction between "I want to tip" and "tip sent." No account or login is required for a one-off tip.

**`src/components/TipAmountSelector.tsx`**

Requirements:
1. Display quick-select buttons for $1, $5, and $10.
2. Include a custom amount input field. Enforce `NEXT_PUBLIC_MIN_TIP_CENTS` and `NEXT_PUBLIC_MAX_TIP_CENTS` bounds with immediate inline feedback (do not wait for form submission to show a range error).
3. Exactly one amount must be selected at all times once the user has interacted. Pre-select $5 as the default.
4. Keyboard navigable: Tab moves between quick-select options, Enter/Space activates one. Custom amount field is reachable via Tab.
5. No pre-checked upsells, no hidden fee reveals, no dark patterns. The amount the user sees is the amount that will be charged, period.
6. ARIA: quick-select buttons must use `role="radio"` in a `role="radiogroup"`, labelled "Tip amount." Selected state must be conveyed via `aria-checked`, not color alone.

**`src/components/PaymentForm.tsx`**

Requirements:
1. Wraps the payment processor's hosted/embedded card entry component (e.g., Stripe Elements). Featherpay's own code must NEVER receive, render, or log a raw card number field — use only the processor's hosted component.
2. Shows the selected tip amount and creator name above the card entry area for confirmation.
3. Submit button copy: "Send tip" — not "Pay," not "Submit," not "Confirm payment."
4. Disabled state: submit button is disabled until the processor's hosted component signals readiness (card fields complete and valid).
5. Loading state during submission: button shows a spinner and is non-interactive. No double-submission possible.
6. ARIA: submit button has a descriptive `aria-label` that includes the amount (e.g., "Send $5 tip to Alex").

**The tip page (`src/app/[creatorHandle]/page.tsx`)**

1. Load the creator's public profile via `apiClient.getCreator(handle)`. Show a 404 page if the creator doesn't exist.
2. Display the creator's name (or handle) and a simple, welcoming heading — e.g., "Support Alex" — with no crypto vocabulary.
3. Render `TipAmountSelector` and `PaymentForm` in sequence.
4. On submission: generate a client-side UUID as the `Idempotency-Key`, call `apiClient.submitTip(...)`, and on success render a success state: "Your $5 tip is on its way to Alex ✓"
5. On API error: show a friendly inline message — "Something went wrong. Your card wasn't charged." — and allow the user to try again with the same idempotency key (do not regenerate the key on retry).
6. Success state must be keyboard-reachable and announced to screen readers via `role="status"` or `aria-live="polite"`.

**Unit tests** (`tests/components/`):
- TipAmountSelector: quick-select updates selected amount; custom amount within bounds accepted; custom amount below min shows error; custom amount above max shows error; keyboard selection works
- PaymentForm: submit button disabled before card fields complete; loading state active during submission; success state rendered on resolve; error message rendered on reject

Run `npm run test` and `npm run lint`.
```

---

## Day 3 — Tip Page: Full Flow, Mobile, and Accessibility (M1, Part 2 + M5 partial)

**Objective:** Complete the tip page with robust error states, a first mobile pass, and a full accessibility audit against WCAG AA.

```
Harden and polish the public tip page at `src/app/[creatorHandle]/` before moving to the embed widget.

**Error and edge-case states**

Add explicit UI states for:
1. **Creator not found** — a calm 404 page. Copy: "This tip page doesn't exist." No technical details.
2. **API unavailable** — if `getCreator` fails with a network error, show: "Tip pages are temporarily unavailable. Please try again in a moment." Do not expose HTTP status codes or error messages to the user.
3. **Card declined** — a clear, friendly message: "Your card wasn't accepted. Please try a different card." No retry with the same card details.
4. **Tip delayed (TipRouter contract paused)** — if the API returns a specific "settlement_delayed" signal, show: "Your tip was received and is being processed. Alex will see it shortly." Do NOT surface any mention of contracts, blockchain, or on-chain settlement. This state must exist by design — not improvised if it ever happens.
5. **Amount out of bounds** — if somehow a tip is submitted outside the min/max range (e.g., a stale client), show: "Tips must be between $[min] and $[max]."

**Mobile-first pass**

1. The tip page must be fully usable on a 375px wide viewport (iPhone SE). No horizontal scroll, no truncated buttons, no overlapping elements.
2. The quick-select amount buttons must be tap-target sized (minimum 44×44px per WCAG 2.5.5).
3. The submit button must be full-width on mobile.
4. The payment processor's hosted card component must render correctly at narrow widths — test this explicitly.
5. Test on real or emulated mobile browsers (Chrome DevTools device emulation is acceptable for now; real device testing is noted as a requirement in PLAN.md M6).

**Accessibility audit**

Run `npm run test:a11y` (implement using axe-core or Playwright's accessibility assertions):
- No WCAG AA color contrast violations on any text or interactive element in the tip flow
- All interactive elements have accessible names (no icon-only buttons without `aria-label`)
- Focus order follows visual reading order through the tip flow
- Success and error states are announced to screen readers
- The processor's hosted card component iframe has a meaningful `title` attribute

Fix any violations found before moving to Day 4. Document any violations that cannot be fixed on the Featherpay side (e.g., inside the processor's iframe) in a comment in the component.

**Write one e2e test** (`tests/e2e/tip-flow.spec.ts`):
- Navigate to a mock creator's tip page
- Select $5
- Fill in card details via the processor's hosted component (use sandbox test card)
- Submit
- Assert success state is shown with correct amount and creator name
- Assert no crypto/blockchain vocabulary appears anywhere on the page

Run `npm run test:e2e` (configure Playwright to run against a local dev server with mocked API). This test must pass before Day 4 begins.
```

---

## Day 4 — Embeddable Widget (M2)

**Objective:** Build the embeddable widget as a separately bundled, host-page-safe, fast-loading version of the tip flow.

```
Build the embeddable tip widget at `src/app/embed/` for `featherpay/frontend`.

The embed widget is loaded on someone else's page. It must be fast, non-intrusive, and never break the host page's layout. Creators install it via:

  <script src="https://featherpay.io/embed.js" data-creator="creatorname"></script>

**Architecture**

1. The `/embed` entry point is a separate Next.js route that renders only the tip widget — no navigation, no dashboard chrome, no full-page layout.
2. Configure a separate Next.js bundle for the embed entry point, optimized for minimum size:
   - No shared chunks with the main app that aren't strictly required
   - No fonts loaded that aren't also needed by the widget
   - Target: the embed widget's JavaScript payload should be as small as achievable without sacrificing functionality
3. The widget iframe must reserve its final height immediately on load — use a fixed height or a `min-height` that prevents layout shift. Never resize the iframe after initial load in a way that could push the host page's content.
4. All widget styles must be scoped to avoid leaking into or being overridden by the host page's CSS. Use CSS Modules or a scoped approach — not global styles.

**Widget functionality**

The embed widget must contain the full tip flow:
1. Quick-select amounts ($1, $5, $10) and custom amount — same `TipAmountSelector` component
2. Card entry via processor's hosted component
3. Success state after a tip is submitted
4. The creator handle is read from the `data-creator` attribute on the script tag and passed into the widget as a prop

The widget must NOT:
- Require the tipper to have an account
- Show any navigation or links outside the tip flow
- Load any analytics scripts not already present in the host page's context

**`embed.js` script**

Write `public/embed.js` — the script creators paste into their sites:
1. Reads `data-creator` from its own script tag
2. Creates an `<iframe>` pointing to `/embed?creator={handle}` on the Featherpay domain
3. Sets the iframe's initial dimensions
4. Appends it to the DOM adjacent to the script tag, so the widget appears where the creator placed the snippet

**Dashboard snippet generator**

On the creator dashboard (placeholder page for now, built fully on Day 5), add a copy-paste snippet generator that outputs:
  `<script src="https://featherpay.io/embed.js" data-creator="[creatorhandle]"></script>`
with a "Copy" button. This is the primary way creators will install the widget.

**Tests**:
- Unit test: `embed.js` creates an iframe with the correct src and dimensions given a `data-creator` attribute
- Unit test: the embed page renders correctly with a valid creator handle
- Unit test: the embed page renders a "creator not found" state for an unknown handle
- Accessibility: the iframe created by `embed.js` has a `title` attribute (e.g., "Tip [creatorname]")

Run `npm run test` and confirm `npm run build` still succeeds with the embed as a separate entry point.
```

---

## Day 5 — Creator Onboarding and Dashboard (M3)

**Objective:** Build the authenticated creator dashboard — signup, earnings overview, tip history, and the embed snippet generator.

```
Build the creator onboarding and dashboard at `src/app/dashboard/` for `featherpay/frontend`.

No crypto vocabulary anywhere. This should feel like a simple analytics dashboard — earnings, history, and a way to get paid. Not a wallet app.

**Creator Signup**

Route: `/dashboard/signup` (or handled via auth provider redirect)

1. Email/social login using the project's chosen auth provider. The signup flow calls `apiClient.createAccount({ email, role: "creator" })` after auth succeeds.
2. After successful account creation, redirect to `/dashboard` with a welcome state: "Your tip page is ready. Share your link to start receiving tips."
3. Display the creator's tip link (`featherpay.io/@{handle}`) with a "Copy link" button on the welcome state.
4. Display the embed snippet (from Day 4's generator) below the tip link.
5. Error handling: if account creation fails (e.g., email already registered), show a clear message and allow the user to sign in instead.

**Dashboard Home (`/dashboard`)**

Auth-gated. Redirect unauthenticated users to the signup/login page.

Sections:
1. **Earnings summary** — fetched from `apiClient.getEarnings(creatorId)`:
   - Total earned (all time)
   - Available to withdraw
   - Pending (tips received but not yet settled on-chain — shown as "processing," never as "pending on blockchain")
   - Render as simple stat cards, not a complex data table
2. **`src/components/EarningsChart.tsx`** — a simple bar or line chart of earnings over the last 30 days. Fetch from tip history, group by day client-side. Use a lightweight charting library (no heavy dependencies). Chart must be accessible: include a `<title>` and `<desc>` in the SVG, or use `aria-label` if using a canvas-based library.
3. **Tip link and embed snippet** — always visible on the dashboard for easy re-copying.
4. **Recent tips** — the 5 most recent settled tips, each showing: amount, timestamp, and (optionally) a "view confirmation" link that opens the `contract_tx_hash` on a Stellar block explorer. Label this link "View confirmation" — not "View on blockchain" or "View on-chain."

**Tip History (`/dashboard/history`)**

Paginated full tip history from `apiClient.getTipHistory(creatorId, page)`. Each row: amount, date, status, and optional "View confirmation" link for settled tips. Status labels must use plain language:
- `settled` → "Received"
- `converted` → "Processing"
- `failed` → "Not completed"
- `refunded` → "Refunded"

Never show raw status enum values to the user.

**Tests** (unit in `tests/dashboard/`):
- Earnings summary renders correct values from API response
- Pending amount is labeled "Processing," not any blockchain-related term
- EarningsChart renders without errors given 30 days of data
- EarningsChart renders an empty state gracefully when there are no tips
- Tip history maps status values to correct plain-language labels
- "View confirmation" link is present only for settled tips (those with a `contract_tx_hash`)
- Auth redirect: unauthenticated access to `/dashboard` redirects to login

Run `npm run test`.
```

---

## Day 6 — Withdrawals, Trust Signals, and Contract-Pause Messaging (M4 + M5)

**Objective:** Complete the withdrawal flow, add trust signals to the tip page, and implement the contract-pause UX that is required before the product can go live.

```
Complete the withdrawal flow and polish the trust-sensitive surfaces of `featherpay/frontend`.

**Withdrawals (`/dashboard/withdraw`)**

Auth-gated. Only accessible to creators.

1. Show the creator's `available_balance_cents` and the `WITHDRAWAL_DAILY_CAP_CENTS` limit clearly.
2. Amount input: validate client-side that `amount > 0` and `amount ≤ available_balance_cents`. Show inline error immediately — don't wait for API submission.
3. Bank details: entered via the payment processor's hosted off-ramp component. Featherpay's own code must never receive or render a raw bank account number.
4. Confirm step: show "Withdraw $[amount] to your bank account" with a confirmation button before submitting.
5. On submit: generate a UUID as `Idempotency-Key`, call `apiClient.requestWithdrawal(...)`.
6. Status page: after submission, show the withdrawal status. Poll `apiClient.getWithdrawalStatus(id)` every 10 seconds until status is `complete` or `failed`. Show:
   - `pending` / `processing` → "Your withdrawal is being processed. This usually takes 1–3 business days."
   - `complete` → "Withdrawal complete. $[amount] has been sent to your bank account."
   - `failed` → "Withdrawal could not be completed. Your balance has been restored. Please try again or contact support."
7. No crypto vocabulary. The word "bank" is acceptable. The word "off-ramp" is not.

**Trust signals on the tip page**

Add to `src/app/[creatorHandle]/page.tsx`:
1. A subtle "Secured by Stripe" (or equivalent processor) badge near the card entry area.
2. A lock icon adjacent to the submit button.
3. Fee transparency: if a protocol fee applies (`NEXT_PUBLIC_PROTOCOL_FEE_BPS > 0`), show it clearly before the submit button — e.g., "A small fee of X% helps keep Featherpay running." If no fee, show nothing (no "0% fee" messaging that draws attention to fees that don't exist).
4. No dark patterns: the pre-selected $5 amount is a sensible default, not a psychological anchor designed to prevent users from choosing $1. The custom amount field must be equally easy to reach as the quick-select buttons.

**Contract-pause UX (required before any real traffic)**

This must exist before the product goes live. It is not a "nice to have."

Implement handling for the `settlement_delayed` signal from the API (which the API emits when the TipRouter contract circuit breaker is active):

1. In `src/lib/api/index.ts`, detect a `settlement_delayed: true` field in the POST /tips response.
2. In the tip page success state, show a calm variant: "Your tip was received and is being processed — Alex will see it soon." No urgency, no technical explanation, no crypto/contract vocabulary.
3. This state must be rendered and tested. It must not be handled by a generic error state.

Write a unit test that the `settlement_delayed` API response renders the correct calm message, and that the message contains no prohibited vocabulary (write a helper that checks for: "contract," "blockchain," "wallet," "on-chain," "Stellar," "Soroban," "XDR," "crypto").

**Accessibility final pass**

Run `npm run test:a11y` across all completed routes:
- `/[creatorHandle]` (tip page)
- `/embed` (widget)
- `/dashboard` (earnings)
- `/dashboard/history`
- `/dashboard/withdraw`

Fix any remaining WCAG AA violations. Every interactive element must have an accessible name. No critical action relies on color alone.

Run `npm run test`, `npm run test:a11y`, and `npm run lint`.
```

---

## Day 7 — E2E Tests, Analytics, and Contributor Handoff (M6 + M7)

**Objective:** Complete the e2e test suite, wire up conversion funnel analytics, and leave the repo in a state where any contributor can pick it up confidently.

```
Today is testing, analytics, and handoff day for `featherpay/frontend`. No new features.

**1. Complete the E2E Test Suite (`tests/e2e/`)**

All tests run with Playwright against a local dev server backed by a mocked `featherpay/api`.

Write or complete the following test files:

`tip-flow.spec.ts` (expand from Day 3):
- Full happy path: land on tip page → select amount → enter card details → submit → see success state
- Custom amount: enter a valid custom amount → submit successfully
- Card declined: processor returns decline → correct error message shown, no success state
- Settlement delayed: API returns `settlement_delayed: true` → calm delay message shown, not an error state
- Creator not found: 404 state shown with no technical error details

`embed-widget.spec.ts`:
- Embed script creates an iframe with correct `src` and `title`
- Tip flow works end-to-end inside the iframe (same steps as tip-flow.spec.ts)
- No layout shift on the host page after the iframe loads

`dashboard.spec.ts`:
- Unauthenticated access to `/dashboard` redirects to login
- Authenticated creator sees earnings summary and tip history
- Withdrawal: enter valid amount → confirm → status page shown
- Withdrawal: amount exceeds available balance → inline error, no submission

`accessibility.spec.ts`:
- Run axe on every route and assert zero WCAG AA violations
- Keyboard navigation: complete the entire tip flow using only keyboard (Tab, Enter, Space)
- Screen reader: all status changes (success, error, loading) are announced via `aria-live`

Run `npm run test:e2e`. All tests must pass.

**2. Conversion Funnel Analytics (`src/lib/analytics/`)**

Implement lightweight funnel tracking in `src/lib/analytics/index.ts`:

Track these events (no PII, no card data, no amounts in event names):
- `tip_page_viewed` — creator handle, referrer (direct/social/embed)
- `amount_selected` — quick-select or custom (not the amount value itself, just which type)
- `card_entry_started` — processor hosted component focused
- `card_entry_completed` — processor signals fields are complete
- `tip_submitted` — form submitted
- `tip_succeeded` — API returned success
- `tip_failed` — card declined or API error (include error type: "card_declined" | "api_error" | "settlement_delayed")

The analytics client must:
- Be a no-op in test environments (do not make network requests during tests)
- Accept a pluggable backend (the actual analytics provider is configured via env var, not hardcoded)
- Never log raw card data, email addresses, or wallet public keys

**3. Prohibited Vocabulary Check**

Write a utility in `tests/utils/prohibited-vocabulary.ts`:

```typescript
const PROHIBITED_TERMS = [
  'wallet', 'blockchain', 'on-chain', 'stellar', 'soroban',
  'smart contract', 'contract', 'crypto', 'xdr', 'gas',
  'private key', 'public key', 'seed phrase', 'ledger', 'node'
];

export function assertNoProhibitedVocabulary(text: string): void {
  // asserts none of the prohibited terms appear (case-insensitive)
}
```

Use this utility in the e2e tests to assert that no prohibited vocabulary appears in any user-visible text on the tip page, success state, error states, or the settlement-delayed state.

(Note: "ledger" in `featherpay/api`'s internal code is fine — this check is for user-visible copy in the frontend only.)

**4. CONTRIBUTING.md**

Write `CONTRIBUTING.md` covering:
- How to set up the local dev environment (Node.js, env vars, running against a mocked or staging API)
- How to run each test suite (`test`, `test:e2e`, `test:a11y`)
- The tip flow change requirement: any PR touching `src/app/[creatorHandle]/`, `TipAmountSelector.tsx`, or `PaymentForm.tsx` must include before/after screen recordings and must not increase the step count
- The zero-crypto-vocabulary rule: any new copy anywhere in the tip flow must pass the prohibited vocabulary check before merge
- The accessibility requirement: `npm run test:a11y` must pass on every PR
- The conversion-funnel principle: fewer steps between intent and payment, never more

**5. OPEN_ISSUES.md**

Document what remains before the public launch:
- Real-device mobile testing (PLAN.md explicitly requires this before M6 — browser emulation is not sufficient)
- Real creator onboarding beta with a small group — watching real conversion funnel drop-off points (M6)
- Pointing at production `featherpay/api` (M7)
- Any open accessibility issues that could not be fixed on the Featherpay side (e.g., inside processor iframes)
- Screen reader testing with a real screen reader (NVDA/VoiceOver) — automated axe catches structural issues but misses interaction patterns

The repo should be in a state where a new contributor can clone it, run `npm run dev`, complete the full tip flow in a browser, run all test suites, and understand from `CONTRIBUTING.md` exactly what the product principles are and what remains to ship.
```

---

## Summary: What 90% Complete Looks Like

After these 7 days, the `featherpay/frontend` repo will have:

| Area | Status |
|---|---|
| Repo scaffold, design tokens, CI | ✅ Complete |
| `featherpay/api` client with full typing | ✅ Complete |
| Public tip page — amount selector, card entry, success state | ✅ Complete |
| All tip page error states (declined, API error, settlement delayed) | ✅ Complete |
| Mobile-first layout (375px+) | ✅ Complete |
| WCAG AA accessibility across all routes | ✅ Complete |
| Embeddable widget (separate bundle, no layout shift, sandboxed styles) | ✅ Complete |
| `embed.js` script for copy-paste installation | ✅ Complete |
| Creator signup and onboarding | ✅ Complete |
| Creator dashboard — earnings, chart, tip history, embed snippet | ✅ Complete |
| Withdrawal flow with processor-hosted bank details | ✅ Complete |
| Trust signals on tip page | ✅ Complete |
| Contract-pause / settlement-delayed UX | ✅ Complete |
| Prohibited vocabulary test utility | ✅ Complete |
| Conversion funnel analytics (pluggable backend) | ✅ Complete |
| Full Playwright e2e suite | ✅ Complete |
| CONTRIBUTING.md | ✅ Complete |
| Real-device mobile testing | 🔲 Remaining (required before M6) |
| Real creator beta onboarding (conversion funnel validation) | 🔲 Remaining (M6) |
| Public launch pointing at production API | 🔲 Remaining (M7) |
| Screen reader testing with real assistive technology | 🔲 Remaining (pre-launch) |
