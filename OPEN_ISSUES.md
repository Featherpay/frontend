# Open Issues Before Public Launch

This document tracks work remaining before Featherpay Frontend can launch publicly.

## M6 - Real Creator Onboarding Beta

- [ ] **Real-device mobile testing** (PLAN.md explicitly requires this before M6)
  - Browser emulation is NOT sufficient
  - Test on: iPhone SE (375px), iPhone 14 Pro, iPhone 14 Pro Max, Samsung Galaxy S23, iPad
  - Verify: no horizontal scroll, touch targets ≥44px, no overlapping elements
  - Payment processor iframe renders correctly at all widths

- [ ] **Real creator onboarding beta with small group**
  - Recruit 10-20 creators for beta program
  - Watch real conversion funnel drop-off points
  - Measure: tip page view → amount select → card entry → submit → success
  - Iterate on UX based on real user feedback

- [ ] **Pointing at production `featherpay/api`**
  - Current dev points to local mock API
  - Need staging environment with real API + contracts
  - Test end-to-end with real Stripe + Stellar testnet

## M7 - Public Launch

- [ ] **Any open accessibility issues that could not be fixed on the Featherpay side**
  - Document any a11y issues inside payment processor iframes
  - These are third-party and may be unfixable by us
  - Must be disclosed in VPAT/accessibility statement

- [ ] **Screen reader testing with real assistive technology**
  - Automated axe catches structural issues but misses interaction patterns
  - Test with: NVDA (Windows), VoiceOver (macOS/iOS), TalkBack (Android)
  - Verify: all status changes announced, focus management correct, form labels present

- [ ] **Internationalization (i18n) readiness**
  - Currently English-only
  - Plan for: EUR, GBP, CAD creator onboarding
  - Currency formatting, date localization, RTL support

## Technical Debt / Improvements

- [ ] **Embed widget bundle size optimization**
  - Current: separate Next.js entry point
  - Target: <50KB gzipped JS for embed widget
  - Consider: Preact, manual chunk splitting, dynamic imports

- [ ] **Real-time earnings updates via WebSocket/SSE**
  - Currently: polling on dashboard
  - Future: push updates for tips, withdrawals, reconciliation

- [ ] **Creator analytics enhancements**
  - Tipper retention cohorts
  - Geographic heatmap
  - Referrer attribution (UTM tracking)
  - Export to CSV/JSON

- [ ] **Dark mode support**
  - Design tokens support it, but not implemented
  - Requires: CSS variables, `prefers-color-scheme` media query

- [ ] **PWA support for installable creator dashboard**
  - Manifest, service worker, offline fallback
  - Push notifications for withdrawal status changes

## Documentation

- [ ] **Component storybook** for design system
- [ ] **Integration guide for creators** (embed widget, tip link)
- [ ] **Accessibility statement / VPAT**
- [ ] **Privacy policy & Terms of Service** (user-facing)

## Dependencies

- [ ] **featherpay/api** production-ready (M6)
- [ ] **featherpay/wallet-service** production-ready (M7)
- [ ] **Stripe account** production-ready (M7)
- [ ] **Stellar anchor partner** production agreement (M7)

---

## Priority Legend

- 🔴 **Blocking** - Must complete before next milestone
- 🟡 **Important** - Should complete before next milestone
- 🟢 **Nice to have** - Can defer

---

## Mobile Testing Checklist (Required Before M6)

When testing on real devices, verify:

| Check | iPhone SE (375px) | iPhone 14 Pro | Samsung S23 | iPad |
|-------|-------------------|---------------|-------------|------|
| No horizontal scroll | ☐ | ☐ | ☐ | ☐ |
| Touch targets ≥44px | ☐ | ☐ | ☐ | ☐ |
| No overlapping elements | ☐ | ☐ | ☐ | ☐ |
| Stripe iframe renders | ☐ | ☐ | ☐ | ☐ |
| Keyboard navigation works | ☐ | ☐ | ☐ | ☐ |
| Screen reader announces | ☐ | ☐ | ☐ | ☐ |
| Landscape mode works | ☐ | ☐ | ☐ | ☐ |
| Safe area insets respected | ☐ | ☐ | ☐ | ☐ |

**Tester:** _______________ **Date:** _______________ **Device:** _______________

---

**Last Updated:** 2026-10-09
**Next Review:** Before M6 kickoff