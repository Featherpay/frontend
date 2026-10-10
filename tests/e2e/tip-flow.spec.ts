// E2E test for full tip flow.
import { test, expect } from "@playwright/test";

test.describe("Tip Flow", () => {
  test.beforeEach(async ({ page }) => {
    // Mock API responses
    await page.route("**/api/creators/**", async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          id: "creator-1",
          tip_link: "https://featherpay.io/@testcreator",
          display_name: "Test Creator",
        }),
      });
    });

    await page.route("**/api/tips", async (route) => {
      await route.fulfill({
        status: 201,
        contentType: "application/json",
        body: JSON.stringify({
          id: "tip-1",
          tipper_id: "tipper-1",
          creator_id: "creator-1",
          amount_cents: 500,
          currency: "USD",
          status: "converted",
          batch_id: null,
          contract_tx_hash: null,
          idempotency_key: "test-idem",
          created_at: new Date().toISOString(),
          settlement_delayed: false,
        }),
      });
    });
  });

  test("full happy path: land on tip page → select amount → enter card details → submit → see success state", async ({ page }) => {
    await page.goto("/@testcreator");

    // Check page loads with correct heading
    await expect(page.locator("h1")).toContainText("Support Test Creator");

    // Select $5 quick amount
    await page.getByRole("radio", { name: "$5.00" }).click();

    // Verify amount is selected
    await expect(page.locator("button[role='radio'][aria-checked='true']")).toContainText("$5.00");

    // Fill card details via Stripe test card
    // The Stripe iframe will be loaded
    const stripeFrame = page.frameLocator("iframe[title='Card details']");
    await stripeFrame.locator('input[name="cardnumber"]').fill("4242 4242 4242 4242");
    await stripeFrame.locator('input[name="exp-date"]').fill("12/34");
    await stripeFrame.locator('input[name="cvc"]').fill("123");
    await stripeFrame.locator('input[name="postal"]').fill("12345");

    // Submit
    await page.getByRole("button", { name: /Send tip/ }).click();

    // Wait for success state
    await expect(page.locator('[role="status"]')).toContainText("Your $5.00 tip is on its way to Test Creator");
  });

  test("custom amount: enter a valid custom amount → submit successfully", async ({ page }) => {
    await page.goto("/@testcreator");

    // Enter custom amount
    await page.locator('input[type="number"]').fill("7.50");

    // Fill card details
    const stripeFrame = page.frameLocator("iframe[title='Card details']");
    await stripeFrame.locator('input[name="cardnumber"]').fill("4242 4242 4242 4242");
    await stripeFrame.locator('input[name="exp-date"]').fill("12/34");
    await stripeFrame.locator('input[name="cvc"]').fill("123");
    await stripeFrame.locator('input[name="postal"]').fill("12345");

    // Submit
    await page.getByRole("button", { name: /Send tip/ }).click();

    // Wait for success state
    await expect(page.locator('[role="status"]')).toContainText("Your $7.50 tip is on its way to Test Creator");
  });

  test("card declined: processor returns decline → correct error message shown, no success state", async ({ page }) => {
    // Mock declined response
    await page.route("**/api/tips", async (route) => {
      await route.fulfill({
        status: 402,
        contentType: "application/json",
        body: JSON.stringify({
          error: "card_declined",
          message: "Your card was declined.",
        }),
      });
    });

    await page.goto("/@testcreator");

    // Select amount
    await page.getByRole("radio", { name: "$5.00" }).click();

    // Fill card details
    const stripeFrame = page.frameLocator("iframe[title='Card details']");
    await stripeFrame.locator('input[name="cardnumber"]').fill("4000 0000 0000 0002"); // Declined card
    await stripeFrame.locator('input[name="exp-date"]').fill("12/34");
    await stripeFrame.locator('input[name="cvc"]').fill("123");
    await stripeFrame.locator('input[name="postal"]').fill("12345");

    // Submit
    await page.getByRole("button", { name: /Send tip/ }).click();

    // Check error message
    await expect(page.locator('[role="alert"]')).toContainText("Your card wasn't accepted");
  });

  test("settlement delayed: API returns settlement_delayed → calm delay message shown, not error state", async ({ page }) => {
    await page.route("**/api/tips", async (route) => {
      await route.fulfill({
        status: 201,
        contentType: "application/json",
        body: JSON.stringify({
          id: "tip-1",
          tipper_id: "tipper-1",
          creator_id: "creator-1",
          amount_cents: 500,
          currency: "USD",
          status: "converted",
          batch_id: null,
          contract_tx_hash: null,
          idempotency_key: "test-idem",
          created_at: new Date().toISOString(),
          settlement_delayed: true,
        }),
      });
    });

    await page.goto("/@testcreator");

    await page.getByRole("radio", { name: "$5.00" }).click();

    const stripeFrame = page.frameLocator("iframe[title='Card details']");
    await stripeFrame.locator('input[name="cardnumber"]').fill("4242 4242 4242 4242");
    await stripeFrame.locator('input[name="exp-date"]').fill("12/34");
    await stripeFrame.locator('input[name="cvc"]').fill("123");
    await stripeFrame.locator('input[name="postal"]').fill("12345");

    await page.getByRole("button", { name: /Send tip/ }).click();

    // Check calm delay message
    await expect(page.locator('[role="status"]')).toContainText("Your tip was received and is being processed — Test Creator will see it soon");
  });

  test("creator not found: 404 state shown with no technical error details", async ({ page }) => {
    await page.route("**/api/creators/**", async (route) => {
      await route.fulfill({
        status: 404,
        contentType: "application/json",
        body: JSON.stringify({ error: "not_found" }),
      });
    });

    await page.goto("/@nonexistent");

    // Check 404 message
    await expect(page.locator("h1")).toContainText("This tip page doesn't exist");
  });
});