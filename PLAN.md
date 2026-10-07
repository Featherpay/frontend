# Featherpay Frontend — Project Plan

## 1. Purpose
The user-facing surface of Featherpay: the embeddable tip widget/link that tippers interact with, and the creator dashboard for tracking earnings and withdrawing funds. No crypto vocabulary should be visible anywhere in this app — it should feel like Venmo or Buy Me a Coffee, not a wallet app or a blockchain explorer, even though every tip settles on-chain via a smart contract under the hood.

## 2. Scope
In scope:
- Embeddable tip widget (iframe or standalone link) — "Tip [Creator]" with quick-select and custom amounts
- Card payment entry (via processor's hosted UI component, so Featherpay never handles raw card data)
- Creator signup and onboarding
- Creator dashboard: earnings, tip history, withdrawal flow
- Public creator profile/tip page

Out of scope:
- Any wallet or key management UI — this app never shows a seed phrase, key, or wallet address to the user
- Any contract-level detail (fee basis points, contract addresses) — if on-chain verification is ever surfaced to users, it's presented as a simple "view on-chain" link, not raw technical detail
- Business logic (fiat conversion, contract calls, ledger) → `api`

## 3. Milestones

### M0 — Foundations (Week 1-2)
- Project scaffold: Next.js + TypeScript
- Design direction: warm, simple, "tip jar" feel — not a fintech/crypto aesthetic
- CI: lint, typecheck, build

### M1 — Tip Widget (Week 2-4)
- Standalone tip page: `featherpay.io/@creatorname`
- Quick-select amounts ($1, $5, $10) + custom amount
- Card entry via processor's embedded component (e.g. Stripe Elements)
- Success/failure states, receipt confirmation

### M2 — Embeddable Widget (Week 4-5)
- Lightweight embed script/iframe version of the tip widget for creators to drop into their own site/blog
- Minimal footprint, fast load, no layout shift on the host page

### M3 — Creator Onboarding & Dashboard (Week 5-7)
- Signup flow (email/social login)
- Dashboard: total earned, recent tips, simple chart of earnings over time
- Tip link/widget code generator for the creator to copy

### M4 — Withdrawals (Week 7-8)
- Withdrawal request UI (amount, destination bank details via processor's hosted flow)
- Withdrawal status tracking (pending/processing/complete)

### M5 — Polish & Trust Signals (Week 8-10)
- Mobile-first responsive pass (most tips will come from someone on their phone reading a blog/tweet)
- Trust signals: clear "secured by Stellar," visible fee transparency (if any fee is taken), no dark patterns on amount selection
- Loading/error/empty states audited, including a graceful message if a tip is delayed by an on-chain issue (e.g. the `TipRouter` contract is temporarily paused)

### M6 — Beta (Week 10-12)
- Onboard a handful of real creators, drive real tips at small scale
- Watch for drop-off points in the tip flow (this is a conversion-sensitive flow — every extra step loses tippers)

### M7 — Launch (Week 12+)
- Public launch, point at production `api`
- Basic analytics on conversion funnel (card entry started → completed)

## 4. Key Design Decisions (and why)

| Decision | Choice | Rationale |
|---|---|---|
| Framework | Next.js | Good fit for a mix of public marketing-ish pages (creator profiles) and an app-like dashboard, with solid SEO for creator tip pages |
| Card entry | Processor's hosted component (never raw card fields) | Avoids PCI compliance burden entirely — never let Featherpay's own code touch raw card numbers |
| Crypto visibility | Zero — no wallet addresses, keys, or blockchain jargon in the UI | The entire point of the embedded wallet and contract-routed settlement architecture is that mainstream tippers never need to know Stellar or Soroban is involved |
| Widget delivery | Both a standalone page and an embeddable snippet | Standalone covers social bio links; embeddable covers on-page tipping on a creator's own site |
| On-chain transparency | Optional, simplified | If/when tip verification is surfaced (e.g. linking to a block explorer for a given `contract_tx_hash`), it's an optional "view details" affordance, not a default part of the flow |

## 5. Risks & Open Questions
- **Conversion funnel sensitivity**: Every additional field or step in the tip flow will lose tippers. Ruthlessly minimize friction — this deserves real UX testing, not just internal opinion.
- **Trust/legitimacy**: A new tipping product asking for a card number needs to look trustworthy fast. Visual design and clear fee transparency matter more here than in a typical dev tool.
- **Embed performance**: The embeddable widget runs on someone else's site — it needs to be fast and not break their page layout, or creators won't install it.
- **Contract-pause messaging**: If `api`/`contracts` signal that on-chain settlement is temporarily paused, the frontend needs a calm, non-alarming way to communicate a delay without ever surfacing crypto/contract jargon to the tipper — needs design attention before M5, not improvised later.

## 6. Definition of Done (per milestone)
A milestone is done when: feature works end-to-end against `api` in a staging environment, mobile-tested on real devices (not just browser resize), and the tip flow has been walked through by someone outside the team to catch confusing steps.