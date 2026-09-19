# Featherpay Frontend

**The user-facing surface of Featherpay** — the tip widget a fan interacts with, the embeddable snippet a creator drops into their own site, and the dashboard where creators track earnings and withdraw to a bank account. Every design decision here is in service of one constraint: **a mainstream, non-crypto user should never notice a blockchain is involved.**

---

## Table of Contents

- [Overview](#overview)
- [Design Principles](#design-principles)
- [Architecture](#architecture)
- [Repo Structure](#repo-structure)
- [Prerequisites](#prerequisites)
- [Getting Started](#getting-started)
- [Environment Variables](#environment-variables)
- [Key Flows](#key-flows)
- [The Embeddable Widget](#the-embeddable-widget)
- [Accessibility](#accessibility)
- [Testing](#testing)
- [Deployment](#deployment)
- [Contributing](#contributing)
- [FAQ](#faq)
- [License](#license)

---

## Overview

This app has three surfaces, all served from the same codebase:

1. **Public tip page** — `featherpay.io/@creatorname`. A standalone page a tipper lands on from a social bio link, QR code, or shared URL.
2. **Embeddable tip widget** — a lightweight snippet a creator can drop directly into their own blog, newsletter, or site, so tipping doesn't require leaving their page at all.
3. **Creator dashboard** — an authenticated app for signup, viewing earnings, tip history, and requesting withdrawals.

All business logic — payment processing, currency conversion, ledger accounting — lives in [`featherpay/api`](https://github.com/featherpay/api). This app is a client of that API and nothing more; it holds no payment logic of its own and never communicates with [`featherpay/wallet-service`](https://github.com/featherpay/wallet-service) directly.

## Design Principles

These are treated as requirements, not preferences:

- **Zero crypto vocabulary.** No "wallet," "key," "gas," "chain," "blockchain," or "crypto" appears anywhere in the product copy. This is a tip jar, and it should read like one.
- **Minimize steps between intent and payment.** Every additional field, screen, or click between "I want to tip" and "tip sent" measurably loses tippers. Any proposed addition to the tip flow needs to justify its cost in friction.
- **Never touch raw card data.** All card entry happens inside the payment processor's hosted/embedded component. Featherpay's own code never receives, logs, or stores a raw card number, which also keeps the app out of PCI-DSS scope for card data handling.
- **Trustworthy at a glance.** A tipper asked to enter a card number for the first time needs to feel confident in seconds — clear creator identity, visible security signals, no dark patterns in amount selection (no pre-checked "add a tip to your tip" upsells, no hidden fees revealed only at the last step).
- **Fast and layout-stable as an embed.** The embeddable widget runs inside someone else's page. It must load quickly and never cause layout shift on the host page, or creators won't install it.

## Architecture

```
┌───────────────────────────────────────────────┐
│                     frontend                       │
│  ┌────────────┐  ┌────────────┐  ┌────────────┐  │
│  │  tip page     │  │  embed        │  │  dashboard    │  │
│  │  /@handle      │  │  widget        │  │  (auth-gated)  │  │
│  └──────┬─────┘  └──────┬─────┘  └──────┬─────┘  │
│          │                │                │           │
│          └────────────────┴────────────────┘           │
│                            │                             │
│                    ┌────────────────┐                    │
│                    │  api client       │                    │
│                    └────────┬───────┘                    │
└─────────────────────────────┼───────────────────────────┘
                               │ HTTPS
                               ▼
                    ┌────────────────┐
                    │  featherpay/api   │
                    └────────────────┘
```

## Repo Structure

```
frontend/
├── src/
│   ├── app/
│   │   ├── [creatorHandle]/       # Public tip page
│   │   ├── dashboard/               # Creator dashboard (auth-gated)
│   │   │   ├── earnings/
│   │   │   ├── history/
│   │   │   └── withdraw/
│   │   └── embed/                     # Embeddable widget entry point (minimal bundle)
│   ├── components/
│   │   ├── TipAmountSelector.tsx
│   │   ├── PaymentForm.tsx             # Wraps the processor's hosted component
│   │   └── EarningsChart.tsx
│   ├── lib/
│   │   ├── api/                          # featherpay/api client
│   │   └── analytics/                     # Conversion funnel tracking
│   └── styles/
│       └── tokens.ts                        # Design tokens — warm, simple, non-fintech aesthetic
├── public/
├── tests/
├── PLAN.md
└── README.md
```

## Prerequisites

- Node.js 20+
- A running or hosted instance of [`featherpay/api`](https://github.com/featherpay/api)
- Sandbox/publishable credentials for the payment processor's client-side component

## Getting Started

```bash
git clone https://github.com/featherpay/frontend.git
cd frontend
npm install

cp .env.example .env
# edit .env — see Environment Variables below

npm run dev
```

The app runs at `http://localhost:3000`.

## Environment Variables

| Variable | Description |
|---|---|
| `NEXT_PUBLIC_API_URL` | Base URL for `featherpay/api` |
| `NEXT_PUBLIC_PAYMENT_PROCESSOR_PUBLIC_KEY` | Publishable/client key for the processor's hosted payment component |
| `NEXT_PUBLIC_SITE_URL` | Canonical site URL, used when generating shareable tip links |
| `NEXT_PUBLIC_MIN_TIP_CENTS` / `NEXT_PUBLIC_MAX_TIP_CENTS` | Client-side mirrors of API-enforced tip bounds, for immediate UI feedback |

## Key Flows

**Tipping**
1. Tipper lands on `/@creatorname` or the embedded widget on a creator's site
2. Selects a quick-amount or enters a custom amount
3. Enters card details via the processor's hosted component
4. Confirms — sees an immediate success state with the amount and creator name
5. No account or login is required for a one-off tip

**Creator onboarding**
1. Creator signs up via email or social login
2. Lands on a fresh dashboard with their tip link and embed snippet ready to copy
3. First tip received triggers a notification (email, and in-app on next dashboard visit)

**Withdrawals**
1. From the dashboard, creator requests a withdrawal up to their available balance
2. Enters/confirms bank details via the processor's hosted off-ramp flow (Featherpay's own code never touches raw bank account numbers either)
3. Sees status update from pending → processing → complete

## The Embeddable Widget

The `/embed` entry point is built and bundled separately from the main app, optimized specifically for:
- **Small bundle size** — it's loaded on someone else's page, where every extra kilobyte competes with their own content
- **No layout shift** — the widget reserves its expected space immediately, rather than resizing after content loads
- **Sandboxed styling** — the widget's styles don't leak into or get overridden by the host page's CSS

Creators install it via a simple copy-paste snippet generated on their dashboard:

```html
<script src="https://featherpay.io/embed.js" data-creator="creatorname"></script>
```

## Accessibility

- Full keyboard navigation through the tip flow, including amount selection and the payment form
- Screen-reader labels on all interactive elements, tested with at least one screen reader before each release
- Color contrast meeting WCAG AA across both the tip flow and dashboard
- No critical action (submitting a tip, confirming a withdrawal) relies on color alone to convey state

## Testing

```bash
npm run test              # Unit tests
npm run test:e2e            # Playwright, run against a staging featherpay/api instance
npm run test:a11y            # Automated accessibility checks
```

CI runs lint, type-check, unit tests, and build on every PR. The tip flow specifically is covered by e2e tests that simulate the full card-entry-to-confirmation path against a sandboxed processor.

## Deployment

Deploys as a Next.js app to any Next.js-compatible host (e.g. Vercel).

```bash
npm run build
```

Environment variables are set per environment — staging points at staging `api`, production at production `api`, each with matching processor sandbox/live credentials.

## Contributing

1. Branch from `main`
2. Any change to the tip flow (`src/app/[creatorHandle]/`, `src/components/TipAmountSelector.tsx`, `src/components/PaymentForm.tsx`) should be evaluated against the conversion-funnel principle — fewer steps, not more — and should include before/after screen recordings in the PR
3. Run `npm run lint && npm run typecheck && npm run test` before opening a PR
4. New copy anywhere in the tip flow should be reviewed for accidental crypto jargon before merge

## FAQ

**Why doesn't the tip page require login?**
Requiring an account for a one-off $1 tip would kill conversion. Only creators need an account, to manage their dashboard and withdrawals.

**Where does the actual payment processing happen?**
Not here. This app collects the tip amount and hands card entry to the processor's hosted component; [`featherpay/api`](https://github.com/featherpay/api) handles everything from charge to settlement.

**Can I self-host the embeddable widget's script?**
Not currently — it's served from Featherpay's CDN to ensure creators always have the latest, most secure version without needing to update a copied script themselves.

## License

MIT
