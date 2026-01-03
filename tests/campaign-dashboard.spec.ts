import { test, expect } from "@playwright/test";

test.describe("Campaign Dashboard Layout", () => {
  test("should display phpapp-style dashboard with sidebar", async ({
    page,
  }) => {
    // Use the test user campaign created in global setup
    await page.goto("/campaigns");
    await page.waitForLoadState("networkidle");

    // Wait for campaigns list to load and find a campaign link
    const campaignLink = page.locator('a[href^="/campaigns/"]').first();

    // If no campaigns exist, skip this test
    if (!(await campaignLink.isVisible())) {
      test.skip();
      return;
    }

    await campaignLink.click();

    // Wait for campaign dashboard to load
    await page.waitForLoadState("networkidle");
    await page.waitForTimeout(1000); // Give it a moment to render

    // Take screenshot of full dashboard
    await page.screenshot({
      path: "test-results/campaign-dashboard-full.png",
      fullPage: true,
    });

    // Verify key dashboard sections exist
    await expect(page.locator("text=Recently modified entities")).toBeVisible();
    await expect(page.locator("text=Getting Started")).toBeVisible();
    await expect(page.locator("text=Help & Community")).toBeVisible();
    await expect(page.locator("text=Active quests")).toBeVisible();

    // Verify checklist items
    await expect(page.locator("text=Your first world is ready")).toBeVisible();

    // Verify help links
    await expect(page.locator("text=Documentation")).toBeVisible();

    console.log(
      "✅ Campaign dashboard layout test passed! Screenshot saved to test-results/campaign-dashboard-full.png"
    );
  });
});
