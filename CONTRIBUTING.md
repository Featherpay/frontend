# Contributing to Featherpay Frontend

## Local Development Setup

### Prerequisites
- Node.js 20+
- pnpm (recommended) or npm

### Environment Variables
Copy `.env.example` to `.env.local` and configure:

```bash
cp .env.example .env.local
```

Required variables:
- `NEXT_PUBLIC_API_URL` - Featherpay API URL (default: http://localhost:4000)
- `NEXT_PUBLIC_PAYMENT_PROCESSOR_PUBLIC_KEY` - Stripe publishable key
- `NEXT_PUBLIC_MIN_TIP_CENTS` - Minimum tip (default: 100)
- `NEXT_PUBLIC_MAX_TIP_CENTS` - Maximum tip (default: 10000)
- `NEXT_PUBLIC_WITHDRAWAL_DAILY_CAP_CENTS` - Daily withdrawal cap (default: 500000)

### Running the App
```bash
# Install dependencies
pnpm install

# Run development server
pnpm dev

# Build for production
pnpm build
pnpm start
```

### Running Tests
```bash
# Unit tests
pnpm test

# E2E tests (requires dev server running)
pnpm test:e2e

# Accessibility tests
pnpm test:a11y

# All tests
pnpm test:all
```

### Test Suite Coverage
| Suite | Purpose | Command |
|-------|---------|---------|
| Unit | Component logic, utilities | `pnpm test` |
| E2E | Full user flows in browser | `pnpm test:e2e` |
| Accessibility | WCAG AA compliance | `pnpm test:a11y` |

## Code Standards

### TypeScript
- Strict mode enabled
- No `any` types without justification
- All components must have explicit prop types

### Linting & Formatting
```bash
pnpm lint      # ESLint
pnpm typecheck # tsc --noEmit
pnpm format    # Prettier
```

### Design Tokens
All styling MUST use tokens from `src/styles/tokens.ts`:
- Colors: `tokens.color.*`
- Spacing: `tokens.spacing.*`
- Typography: `tokens.typography.*`
- Border radius: `tokens.borderRadius.*`
- Shadows: `tokens.shadow.*`
- Touch targets: `tokens.touchTarget.min` (44px minimum)

## Critical Product Principles

### Zero Crypto Vocabulary
**MANDATORY**: No blockchain, wallet, crypto, or on-chain terminology anywhere in user-visible copy.

Prohibited terms:
- wallet, blockchain, on-chain, stellar, soroban
- smart contract, contract, crypto, xdr, gas
- private key, public key, seed phrase, ledger, node

Run `pnpm test:a11y` to verify.

### Tip Flow Change Requirement
Any PR touching:
- `src/app/[creatorHandle]/`
- `src/components/TipAmountSelector.tsx`
- `src/components/PaymentForm.tsx`

Must include:
- Before/after screen recordings
- Must not increase step count (fewer steps between intent and payment, never more)

### Accessibility Requirement
`pnpm test:a11y` MUST pass on every PR.

All interactive elements must have accessible names.
No critical action relies on color alone.
Focus order follows visual reading order.

### Conversion Funnel Principle
Fewer steps between intent and payment, never more.
Every additional click is a conversion drop-off.

## Adding New Components

1. Create component in `src/components/`
2. Use design tokens for all styling
3. Include proper ARIA attributes
4. Add unit tests in `tests/components/`
5. Export from component file

## Adding New Pages

1. Create page in `src/app/` following Next.js App Router conventions
2. Use `Suspense` for data fetching
3. Include loading and error states
4. Add to navigation if needed
5. Add E2E test in `tests/e2e/`

## Analytics

All user-facing events MUST go through `src/lib/analytics`:
- No direct console.log or third-party calls in components
- Use `analytics.track()` or convenience methods
- Never log PII, card data, or amounts in event names

## Environment Variables

See `.env.example` for all available variables.

## Definition of Done

A PR is "done" when:
- [ ] All CI checks pass (lint, typecheck, build, unit tests)
- [ ] E2E tests pass (if user-facing changes)
- [ ] Accessibility tests pass (`pnpm test:a11y`)
- [ ] No prohibited vocabulary in user-visible copy
- [ ] No increase in tip flow step count (if tip flow touched)
- [ ] Before/after screen recordings (if tip flow touched)
- [ ] No TypeScript errors
- [ ] No lint warnings