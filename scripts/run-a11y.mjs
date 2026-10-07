#!/usr/bin/env node
// Accessibility audit runner.
//
// Implemented fully on Day 3 using axe-core + Playwright. For now this is a
// stub so `npm run test:a11y` exists and CI can reference it.
//
// Usage: npm run test:a11y

const ROUTES = [
  "/",
  "/embed",
  "/@sample-creator",
  "/dashboard",
  "/dashboard/history",
  "/dashboard/withdraw",
];

async function main() {
  console.log("test:a11y — stub");
  console.log("Routes to audit:", ROUTES.join(", "));
  console.log(
    "Full implementation (axe-core + Playwright) lands on Day 3. Exiting 0.",
  );
  process.exit(0);
}

main();