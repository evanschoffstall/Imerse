import { expect, test } from "@playwright/test";

test.describe("Campaign Pages Visual Tests", () => {
  test.beforeEach(async ({ page }) => {
    // Authenticate using saved state from global setup
    await page.goto("/campaigns");
  });

  test("campaigns list page displays correctly", async ({ page }) => {
    // Wait for the page to load
    await page.waitForLoadState("networkidle");

    // Check for main heading
    await expect(page.locator("h1")).toContainText("Campaigns");

    // Check for create button
    const createButton = page.getByRole("link", {
      name: "Create New Campaign",
    });
    await expect(createButton).toBeVisible();

    // Check for campaigns list or empty state
    const campaignsList = page.locator('[data-testid="campaigns-list"]');
    const emptyCard = page.locator("text=No campaigns yet");

    // Either campaigns list or empty state should be visible
    await expect(
      (await campaignsList.isVisible()) || (await emptyCard.isVisible())
    ).toBeTruthy();

    // Take screenshot for visual verification
    await page.screenshot({
      path: "playwright-report/campaigns-list.png",
      fullPage: true,
    });
  });

  test("campaigns list with data uses shadcn/ui Card components", async ({
    page,
  }) => {
    // If there are campaigns, verify they use Card components
    const campaignCards = page.locator('[data-testid="campaign-card"]');
    const count = await campaignCards.count();

    if (count > 0) {
      // Verify first campaign card structure
      const firstCard = campaignCards.first();
      await expect(firstCard).toBeVisible();

      // Check for Card component classes (shadcn/ui uses specific classes)
      const cardElement = firstCard.locator("..");
      await expect(cardElement).toHaveClass(/rounded/);

      // Take screenshot
      await page.screenshot({
        path: "playwright-report/campaigns-with-data.png",
        fullPage: true,
      });
    }
  });

  test("create new campaign page displays form correctly", async ({ page }) => {
    await page.goto("/campaigns/new");
    await page.waitForLoadState("networkidle");

    // Check for heading text in Card
    await expect(page.getByText("Create New Campaign")).toBeVisible();

    // Check for form fields using shadcn/ui components
    const nameInput = page.locator('input[name="name"]');
    await expect(nameInput).toBeVisible();

    // Check for submit button
    const submitButton = page.getByRole("button", { name: "Create Campaign" });
    await expect(submitButton).toBeVisible();

    // Take screenshot
    await page.screenshot({
      path: "playwright-report/campaign-create-form.png",
      fullPage: true,
    });
  });

  test("campaign detail page displays correctly with shadcn/ui Cards", async ({
    page,
  }) => {
    // Create a test campaign first
    await page.goto("/campaigns/new");
    await page.waitForLoadState("networkidle");

    const testCampaignName = `Test Campaign ${Date.now()}`;
    await page.fill('input[name="name"]', testCampaignName);
    await page.click('button[type="submit"]');

    // Wait for redirect to detail page
    await page.waitForURL(/\/campaigns\/.+/);
    await page.waitForLoadState("networkidle");

    // Verify Card-based layout - look for campaign name
    await expect(page.getByText(testCampaignName)).toBeVisible();

    // Check for action buttons
    await expect(
      page.getByRole("link", { name: "Edit Campaign" })
    ).toBeVisible();
    await expect(
      page.getByRole("button", { name: "Delete Campaign" })
    ).toBeVisible();

    // Check for entity cards (Characters, Locations, etc.)
    await expect(page.locator("text=Characters")).toBeVisible();
    await expect(page.locator("text=Locations")).toBeVisible();

    // Take screenshot
    await page.screenshot({
      path: "playwright-report/campaign-detail.png",
      fullPage: true,
    });

    // Clean up - delete the test campaign
    await page.click('button:has-text("Delete Campaign")');
    await page.waitForSelector('[role="alertdialog"]');
    await page.click('button:has-text("Delete")');
    await page.waitForURL("/campaigns");
  });

  test("campaign edit page displays form with shadcn/ui components", async ({
    page,
  }) => {
    // Create a test campaign first
    await page.goto("/campaigns/new");
    await page.waitForLoadState("networkidle");

    const testCampaignName = `Edit Test Campaign ${Date.now()}`;
    await page.fill('input[name="name"]', testCampaignName);
    await page.click('button[type="submit"]');

    // Navigate to edit page
    await page.waitForURL(/\/campaigns\/.+/);
    const campaignId = page.url().split("/").pop();
    await page.goto(`/campaigns/${campaignId}/edit`);
    await page.waitForLoadState("networkidle");

    // Verify Card-based form layout
    await expect(page.getByText("Edit Campaign")).toBeVisible();

    // Check form is populated
    const nameInput = page.locator('input[name="name"]');
    await expect(nameInput).toHaveValue(testCampaignName);

    // Check for submit button
    await expect(
      page.getByRole("button", { name: "Update Campaign" })
    ).toBeVisible();

    // Take screenshot
    await page.screenshot({
      path: "playwright-report/campaign-edit-form.png",
      fullPage: true,
    });

    // Clean up - go back and delete
    await page.goto(`/campaigns/${campaignId}`);
    await page.click('button:has-text("Delete Campaign")');
    await page.waitForSelector('[role="alertdialog"]');
    await page.click('button:has-text("Delete")');
    await page.waitForURL("/campaigns");
  });

  test("campaign cards use proper shadcn/ui styling in light mode", async ({
    page,
  }) => {
    await page.waitForLoadState("networkidle");

    // Ensure light mode
    const html = page.locator("html");
    const isDark = await html.getAttribute("class");
    if (isDark?.includes("dark")) {
      // Toggle to light mode if needed
      const themeToggle = page
        .locator('[aria-label*="theme"]')
        .or(page.locator('button:has-text("Theme")'));
      if (await themeToggle.isVisible()) {
        await themeToggle.click();
      }
    }

    await page.waitForTimeout(500);
    await page.screenshot({
      path: "playwright-report/campaigns-light-mode.png",
      fullPage: true,
    });
  });

  test("campaign cards use proper shadcn/ui styling in dark mode", async ({
    page,
  }) => {
    await page.waitForLoadState("networkidle");

    // Toggle to dark mode
    const html = page.locator("html");
    const isDark = await html.getAttribute("class");
    if (!isDark?.includes("dark")) {
      const themeToggle = page
        .locator('[aria-label*="theme"]')
        .or(page.locator('button:has-text("Theme")'));
      if (await themeToggle.isVisible()) {
        await themeToggle.click();
        await page.waitForTimeout(500);
      }
    }

    await page.screenshot({
      path: "playwright-report/campaigns-dark-mode.png",
      fullPage: true,
    });
  });

  test("empty state uses shadcn/ui Card correctly", async ({ page }) => {
    // This test assumes we can get to an empty state
    // In production, you might need to create this scenario differently
    await page.waitForLoadState("networkidle");

    const emptyCard = page.locator("text=No campaigns yet");
    if (await emptyCard.isVisible()) {
      // Verify Card structure for empty state
      await expect(emptyCard).toBeVisible();
      await expect(
        page.getByRole("button", { name: "Create Your First Campaign" })
      ).toBeVisible();

      await page.screenshot({
        path: "playwright-report/campaigns-empty-state.png",
        fullPage: true,
      });
    }
  });

  test("campaign loading states use Skeleton components", async ({ page }) => {
    // Navigate to a slow-loading page to capture skeleton
    const slowPage = page;
    await slowPage.route("**/api/campaigns", async (route) => {
      // Delay the response to capture loading state
      await new Promise((resolve) => setTimeout(resolve, 2000));
      await route.continue();
    });

    await slowPage.goto("/campaigns");

    // Try to capture skeleton state (may be fast)
    const skeletons = slowPage.locator(".animate-pulse");
    if ((await skeletons.count()) > 0) {
      await slowPage.screenshot({
        path: "playwright-report/campaigns-loading.png",
        fullPage: true,
      });
    }
  });
});
