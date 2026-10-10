// Design tokens for Featherpay.
//
// The aesthetic is warm, simple, and "tip jar" — not fintech, not crypto, not a
// blockchain explorer. Tokens are exported as typed constants (not raw CSS
// variables) so they are enforced at the TypeScript level.

export const color = {
  // Warm neutrals
  background: "#FFF8F1",
  surface: "#FFFFFF",
  surfaceAlt: "#FDF3E6",
  border: "#E7D9CE",
  borderStrong: "#D4C4B5",

  // Text
  text: "#2B2118",
  textMuted: "#6B5E51",
  textSubtle: "#8A7B6C",

  // Approachable accent (warm amber — not bank-blue, not exchange-orange)
  accent: "#F59E0B",
  accentHover: "#D97706",
  accentSoft: "#FEF3C7",
  accentText: "#92400E",

  // Semantic
  success: "#16A34A",
  successSoft: "#DCFCE7",
  error: "#DC2626",
  errorSoft: "#FEE2E2",
  warning: "#F59E0B",
  warningSoft: "#FEF3C7",
  info: "#2563EB",
  infoSoft: "#DBEAFE",

  // UI chrome
  overlay: "rgba(43, 33, 24, 0.32)",
  focusRing: "#F59E0B",
} as const;

export const typography = {
  fontFamily: {
    // A warm, friendly system stack — no heavy corporate serif, no narrow mono.
    sans: [
      "ui-sans-serif",
      "system-ui",
      "-apple-system",
      "Segoe UI",
      "Roboto",
      "Helvetica",
      "Arial",
      "sans-serif",
    ].join(", "),
    // Monospace for code snippets, wallet addresses, etc.
    mono: [
      "ui-monospace",
      "SFMono-Regular",
      "Menlo",
      "Monaco",
      "Consolas",
      "Liberation Mono",
      "Courier New",
      "monospace",
    ].join(", "),
  },
  fontSize: {
    xs: "0.75rem", // 12px
    sm: "0.875rem", // 14px
    base: "1rem", // 16px
    lg: "1.125rem", // 18px
    xl: "1.25rem", // 20px
    "2xl": "1.5rem", // 24px
    "3xl": "1.875rem", // 30px
    "4xl": "2.25rem", // 36px
  },
  fontWeight: {
    regular: 400,
    medium: 500,
    semibold: 600,
    bold: 700,
  },
  lineHeight: {
    tight: 1.25,
    normal: 1.5,
    relaxed: 1.65,
  },
} as const;

export const spacing = {
  0: "0",
  xs: "0.25rem", // 4px
  sm: "0.5rem", // 8px
  md: "0.75rem", // 12px
  lg: "1rem", // 16px
  xl: "1.25rem", // 20px
  "2xl": "1.5rem", // 24px
  "3xl": "2rem", // 32px
  "4xl": "2.5rem", // 40px
  "5xl": "3rem", // 48px
} as const;

export const borderRadius = {
  none: "0",
  sm: "0.375rem", // 6px — slightly rounded, approachable
  md: "0.625rem", // 10px
  lg: "0.875rem", // 14px
  xl: "1.25rem", // 20px
  full: "9999px",
} as const;

export const shadow = {
  none: "none",
  sm: "0 1px 2px 0 rgba(43, 33, 24, 0.06)",
  md: "0 4px 6px -1px rgba(43, 33, 24, 0.08), 0 2px 4px -2px rgba(43, 33, 24, 0.06)",
  lg: "0 10px 15px -3px rgba(43, 33, 24, 0.10), 0 4px 8px -4px rgba(43, 33, 24, 0.08)",
  xl: "0 20px 25px -5px rgba(43, 33, 24, 0.12), 0 8px 10px -6px rgba(43, 33, 24, 0.08)",
  focus: "0 0 0 3px rgba(245, 158, 11, 0.35)",
} as const;

// Minimum tap target size per WCAG 2.5.5.
export const touchTarget = {
  min: "44px",
} as const;

export const duration = {
  fast: "150ms",
  normal: "250ms",
  slow: "400ms",
} as const;

// A single, typed entry point so consumers can pull everything they need.
export const tokens = {
  color,
  typography,
  spacing,
  borderRadius,
  shadow,
  touchTarget,
  duration,
} as const;

export type ColorScale = typeof color;
export type TypographyScale = typeof typography;
export type SpacingScale = typeof spacing;
export type BorderRadiusScale = typeof borderRadius;
export type ShadowScale = typeof shadow;