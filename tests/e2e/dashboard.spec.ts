// E2E test for creator dashboard.
import { test, expect } from "@playwright/test";

test.describe("Dashboard", () => {
  test.beforeEach(async ({ page }) => {
    // Mock auth and API
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

    await page.route("**/api/creators/**/earnings", async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          creator_id: "creator-1",
          total_earned_cents: 5000,
          available_balance_cents: 3000,
          pending_balance_cents: 1000,
          currency: "USD",
        }),
      });
    });

    await page.route("**/api/creators/**/tips*", async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          items: [
            {
              id: "tip-1",
              tipper_id: "tipper-1",
              creator_id: "creator-1",
              amount_cents: 500,
              currency: "USD",
              status: "settled",
              batch_id: "batch-1",
              contract_tx_hash: "tx-123",
              created_at: new Date().toISOString(),
            },
            {
              id: "tip-2",
              tipper_id: "tipper-2",
              creator_id: "creator-1",
              amount_cents: 1000,
              currency: "USD",
              status: "converted",
              batch_id: "batch-2",
              contract_tx_hash: null,
              created_at: new Date(Date.now() - 86400000).toISOString(),
            },
          ],
          page: 1,
          per_page: 20,
          total: 2,
        }),
      });
    });
  });

  test("unauthenticated access to /dashboard redirects to login", async ({ page }) => {
    // Remove auth mock
    await page.unroute("**/api/creators/**");
    await page.route("**/api/creators/**", async (route) => {
      await route.fulfill({
        status: 401,
        contentType: "application/json",
        body: JSON.stringify({ error: "unauthorized" }),
      });
    });

    await page.goto("/dashboard");
    await expect(page).toHaveURL(/\/dashboard\/signup/);
  });

  test("authenticated creator sees earnings summary and tip history", async ({ page }) => {
    await page.goto("/dashboard");

    // Check earnings summary cards
    await expect(page.locator("text=Total Earned")).toBeVisible();
    await expect(page.locator("text=$50.00")).toBeVisible(); // total earned
    await expect(page.locator("text=Available to Withdraw")).toBeVisible();
    await expect(page.locator("text=$30.00")).toBeVisible(); // available
    await expect(page.locator("text=Processing")).toBeVisible();
    await expect(page.locator("text=$10.00")).toBeVisible(); // pending

    // Check recent tips
    await expect(page.locator("text=Recent Tips")).toBeVisible();
    await expect(page.locator("text=$5.00")).toBeVisible();
    await expect(page.locator("text=$10.00")).toBeVisible();
    await expect(page.locator("text=Received")).toBeVisible();
    await expect(page.locator("text=Processing")).toBeVisible();
    await expect(page.locator("text=View confirmation")).toBeVisible();
  });

  test("withdrawal: enter valid amount → confirm → status page shown", async ({ page }) => {
    await page.route("**/api/creators/**/earnings", async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          creator_id: "creator-1",
          total_earned_cents: 5000,
          available_balance_cents: 3000,
          pending_balance_cents: 1000,
          currency: "USD",
        }),
      });
    });

    await page.route("**/api/withdrawals", async (route) => {
      await route.fulfill({
        status: 201,
        contentType: "application/json",
        body: JSON.stringify({
          id: "w-1",
          creator_id: "creator-1",
          amount_cents: 1000,
          currency: "USD",
          status: "pending",
          created_at: new Date().toISOString(),
        }),
      });
    });

    await page.route("**/api/withdrawals/**", async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          id: "w-1",
          creator_id: "creator-1",
          amount_cents: 1000,
          currency: "USD",
          status: "processing",
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        }),
      });
    });

    await page.goto("/dashboard/withdraw");

    // Enter amount
    await page.locator('input[type="number"]').fill("10.00");

    // Click continue
    await page.getByRole("button", { name: /Continue to Confirm/ }).click();

    // Should be on confirm step
    await expect(page.locator("text=Confirm Withdrawal")).toBeVisible();

    // Confirm
    await page.getByRole("button", { name: /Confirm Withdrawal/ }).click();

    // Should show status page
    await expect(page.locator("text=Withdrawal Status")).toBeVisible();
  });

  test("withdrawal: amount exceeds available balance → inline error, no submission", async ({ page }) => {
    await page.goto("/dashboard/withdraw");

    // Enter amount exceeding balance
    await page.locator('input[type="number"]').fill("100.00");

    // Should show error
    await expect(page.locator("text=Amount exceeds available balance")).toBeVisible();

    // Continue button should be disabled
    await expect(page.getByRole("button", { name: /Continue to Confirm/ })).toBeDisabled();
  });
});