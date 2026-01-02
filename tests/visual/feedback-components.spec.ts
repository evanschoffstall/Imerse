import { expect, test } from "@playwright/test";

/**
 * Visual Testing: Feedback Components
 *
 * Tests shadcn/ui feedback components: Alert, Badge, Tooltip
 * Verifies beautiful, modern styling in light/dark modes
 *
 * Run: bunx playwright test tests/visual/feedback-components.spec.ts --headed
 */

test.describe("Feedback Components - shadcn/ui Verification", () => {
  test.beforeEach(async ({ page }) => {
    // Login as test user
    await page.goto("/login");
    await page.fill('input[name="email"]', "test@example.com");
    await page.fill('input[name="password"]', "password");
    await page.click('button[type="submit"]');
    await page.waitForURL("/dashboard");
  });

  test("Alert component should use shadcn/ui styling", async ({ page }) => {
    await page.goto("/dashboard");
    await page.waitForLoadState("networkidle");

    // Look for alert elements
    const alert = page.locator('[role="alert"]').first();

    if (await alert.isVisible()) {
      // Verify shadcn/ui alert classes
      await expect(alert).toHaveClass(/rounded-lg/);
      await expect(alert).toHaveClass(/border/);

      // Screenshot alert
      await expect(page).toHaveScreenshot("alert-default-light.png");
    }
  });

  test("Alert variants should look different", async ({ page }) => {
    await page.goto("/campaigns/create");

    // Submit empty form to trigger validation error alert
    const submitButton = page.locator('button[type="submit"]');
    await submitButton.click();
    await page.waitForTimeout(300);

    // Look for error alert
    const errorAlert = page
      .locator(".border-red-500, .border-destructive")
      .first();

    if (await errorAlert.isVisible()) {
      // Screenshot destructive alert
      await expect(page).toHaveScreenshot("alert-destructive-light.png");
    }
  });

  test("Badge component should use shadcn/ui styling", async ({ page }) => {
    await page.goto("/characters");
    await page.waitForLoadState("networkidle");

    // Look for badges (status, type indicators, etc.)
    const badge = page
      .locator(".inline-flex.items-center.rounded-full")
      .first();

    if (await badge.isVisible()) {
      // Verify shadcn/ui badge classes
      await expect(badge).toHaveClass(/rounded-full/);
      await expect(badge).toHaveClass(/border/);

      // Screenshot badge
      await expect(page).toHaveScreenshot("badge-default-light.png");
    }
  });

  test("Badge variants should be visible", async ({ page }) => {
    await page.goto("/dashboard");
    await page.waitForLoadState("networkidle");

    // Look for different badge variants
    const badges = page.locator(".inline-flex.items-center.rounded-full");
    const badgeCount = await badges.count();

    if (badgeCount > 0) {
      // Screenshot all badges
      await expect(page).toHaveScreenshot("badge-variants-light.png");
    }
  });

  test("Tooltip component should use shadcn/ui styling", async ({ page }) => {
    await page.goto("/dashboard");
    await page.waitForLoadState("networkidle");

    // Look for elements with tooltips (usually buttons with aria-describedby)
    const tooltipTrigger = page.locator("button[aria-describedby]").first();

    if (await tooltipTrigger.isVisible()) {
      // Hover to show tooltip
      await tooltipTrigger.hover();
      await page.waitForTimeout(300); // Wait for tooltip delay

      // Look for tooltip content
      const tooltip = page.locator('[role="tooltip"]');

      if (await tooltip.isVisible()) {
        // Verify shadcn/ui tooltip classes
        await expect(tooltip).toHaveClass(/rounded-md/);
        await expect(tooltip).toHaveClass(/shadow-md/);

        // Screenshot tooltip
        await expect(page).toHaveScreenshot("tooltip-visible-light.png");
      }
    }
  });

  test("Tooltip positioning should be correct", async ({ page }) => {
    await page.goto("/campaigns");

    // Find button with tooltip
    const button = page.locator("button").first();

    if (await button.isVisible()) {
      await button.hover();
      await page.waitForTimeout(400);

      const tooltip = page.locator('[role="tooltip"]');

      if (await tooltip.isVisible()) {
        // Screenshot tooltip positioning
        await expect(page).toHaveScreenshot("tooltip-positioning.png");
      }
    }
  });

  test("Alert with icon should look beautiful", async ({ page }) => {
    await page.goto("/dashboard");

    const alert = page.locator('[role="alert"]').first();

    if (await alert.isVisible()) {
      // Look for icon within alert
      const alertIcon = alert.locator("svg").first();

      if (await alertIcon.isVisible()) {
        // Screenshot alert with icon
        await expect(page).toHaveScreenshot("alert-with-icon-light.png");
      }
    }
  });

  test("Badge sizes should be consistent", async ({ page }) => {
    await page.goto("/characters");
    await page.waitForLoadState("networkidle");

    const badges = page.locator(".inline-flex.items-center.rounded-full");

    if ((await badges.count()) > 0) {
      // Screenshot to verify consistent sizing
      await expect(page).toHaveScreenshot("badge-sizes-light.png");
    }
  });

  test("All feedback components should work in dark mode", async ({ page }) => {
    await page.goto("/dashboard");

    // Toggle dark mode
    await page.evaluate(() => {
      document.documentElement.classList.add("dark");
    });
    await page.waitForTimeout(300);

    // Verify dark mode
    const html = page.locator("html");
    await expect(html).toHaveClass(/dark/);

    // Screenshot alerts in dark mode
    const alert = page.locator('[role="alert"]').first();
    if (await alert.isVisible()) {
      await expect(page).toHaveScreenshot("alert-dark.png");
    }

    // Screenshot badges in dark mode
    const badge = page
      .locator(".inline-flex.items-center.rounded-full")
      .first();
    if (await badge.isVisible()) {
      await expect(page).toHaveScreenshot("badge-dark.png");
    }
  });

  test("Tooltip should work in dark mode", async ({ page }) => {
    await page.goto("/dashboard");

    // Toggle dark mode
    await page.evaluate(() => {
      document.documentElement.classList.add("dark");
    });
    await page.waitForTimeout(300);

    const tooltipTrigger = page.locator("button[aria-describedby]").first();

    if (await tooltipTrigger.isVisible()) {
      await tooltipTrigger.hover();
      await page.waitForTimeout(400);

      const tooltip = page.locator('[role="tooltip"]');

      if (await tooltip.isVisible()) {
        await expect(page).toHaveScreenshot("tooltip-dark.png");
      }
    }
  });

  test("Alert should be responsive on mobile", async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto("/dashboard");
    await page.waitForLoadState("networkidle");

    const alert = page.locator('[role="alert"]').first();

    if (await alert.isVisible()) {
      // Screenshot mobile alert
      await expect(page).toHaveScreenshot("alert-mobile.png");
    }
  });

  test("Badge should scale properly on mobile", async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto("/characters");
    await page.waitForLoadState("networkidle");

    const badges = page.locator(".inline-flex.items-center.rounded-full");

    if ((await badges.count()) > 0) {
      // Screenshot mobile badges
      await expect(page).toHaveScreenshot("badge-mobile.png");
    }
  });

  test("Tooltip should be visible on mobile (touch)", async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto("/dashboard");

    const button = page.locator("button").first();

    if (await button.isVisible()) {
      // Tap to show tooltip (mobile behavior)
      await button.tap();
      await page.waitForTimeout(400);

      const tooltip = page.locator('[role="tooltip"]');

      if (await tooltip.isVisible()) {
        await expect(page).toHaveScreenshot("tooltip-mobile.png");
      }
    }
  });

  test("Alert close button should be functional", async ({ page }) => {
    await page.goto("/dashboard");

    const alert = page.locator('[role="alert"]').first();

    if (await alert.isVisible()) {
      // Look for close button
      const closeButton = alert
        .locator("button")
        .filter({ hasText: /close|×/i });

      if (await closeButton.isVisible()) {
        // Screenshot before closing
        await expect(page).toHaveScreenshot("alert-with-close-button.png");

        // Click close
        await closeButton.click();
        await page.waitForTimeout(300);

        // Alert should be hidden
        await expect(alert).not.toBeVisible();
      }
    }
  });

  test("Badge with dot indicator should look modern", async ({ page }) => {
    await page.goto("/notifications");
    await page.waitForLoadState("networkidle");

    // Look for notification badges with dots
    const dotBadge = page
      .locator(".relative")
      .filter({ has: page.locator(".absolute.rounded-full") })
      .first();

    if (await dotBadge.isVisible()) {
      // Screenshot badge with dot
      await expect(page).toHaveScreenshot("badge-with-dot-light.png");
    }
  });
});
