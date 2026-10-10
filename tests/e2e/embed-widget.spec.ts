// E2E test for embeddable widget.
import { test, expect } from "@playwright/test";

test.describe("Embed Widget", () => {
  test.beforeEach(async ({ page }) => {
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

  test("embed script creates an iframe with correct src and title", async ({ page }) => {
    // Create a page with the embed script
    await page.setContent(`
      <html>
        <body>
          <div id="content">Page content before</div>
          <script src="/embed.js" data-creator="testcreator"></script>
          <div id="content-after">Page content after</div>
        </body>
      </html>
    `);

    // Wait for iframe to be created
    await page.waitForSelector("iframe");

    const iframe = page.locator("iframe");
    await expect(iframe).toHaveAttribute("src", /\/embed\?creator=testcreator/);
    await expect(iframe).toHaveAttribute("title", "Tip testcreator");
    await expect(iframe).toHaveAttribute("style", /maxWidth.*420px/);
  });

  test("tip flow works end-to-end inside the iframe", async ({ page }) => {
    // Load the embed page directly
    await page.goto("/embed?creator=testcreator");

    // Check page loads
    await expect(page.locator("h1")).toContainText("Support Test Creator");

    // Select amount
    await page.getByRole("radio", { name: "$5.00" }).click();

    // Fill card details
    const stripeFrame = page.frameLocator("iframe[title='Card details']");
    await stripeFrame.locator('input[name="cardnumber"]').fill("4242 4242 4242 4242");
    await stripeFrame.locator('input[name="exp-date"]').fill("12/34");
    await stripeFrame.locator('input[name="cvc"]').fill("123");
    await stripeFrame.locator('input[name="postal"]').fill("12345");

    // Submit
    await page.getByRole("button", { name: /Send tip/ }).click();

    // Wait for success
    await expect(page.locator('[role="status"]')).toContainText("Your $5.00 tip is on its way to Test Creator");
  });

  test("no layout shift on the host page after the iframe loads", async ({ page }) => {
    await page.setContent(`
      <html>
        <body style="margin: 0; padding: 20px;">
          <h1>Host Page</h1>
          <div id="before">Content before widget</div>
          <script src="/embed.js" data-creator="testcreator"></script>
          <div id="after">Content after widget</div>
        </body>
      </html>
    `);

    // Get initial position of "after" element
    const afterEl = page.locator("#after");
    const initialBox = await afterEl.boundingBox();

    // Wait for iframe to load
    await page.waitForSelector("iframe");
    await page.waitForTimeout(500); // Allow any layout shifts

    // Check position hasn't changed significantly
    const finalBox = await afterEl.boundingBox();
    expect(finalBox).not.toBeNull();
    expect(initialBox).not.toBeNull();

    if (initialBox && finalBox) {
      // Allow small differences due to rendering
      expect(Math.abs(finalBox.y - initialBox.y)).toBeLessThan(5);
    }
  });

  test("embed page shows creator not found state for unknown handle", async ({ page }) => {
    await page.route("**/api/creators/**", async (route) => {
      await route.fulfill({
        status: 404,
        contentType: "application/json",
        body: JSON.stringify({ error: "not_found" }),
      });
    });

    await page.goto("/embed?creator=unknown");

    await expect(page.locator("h1")).toContainText("This tip page doesn't exist");
  });
});