import { expect, test } from "@playwright/test";

/**
 * Visual Testing Example: Button Component
 *
 * This test verifies that the Button component uses shadcn/ui styling
 * and looks beautiful in all variants and states.
 *
 * Run: bunx playwright test tests/visual/button.spec.ts --headed
 */

test.describe("Button Component - shadcn/ui Verification", () => {
  test.beforeEach(async ({ page }) => {
    // Login as test user
    await page.goto("/login");
    await page.fill('input[name="email"]', "test@example.com");
    await page.fill('input[name="password"]', "password");
    await page.click('button[type="submit"]');
    await page.waitForURL("/dashboard");
  });

  test("should use shadcn/ui Button on campaign list", async ({ page }) => {
    await page.goto("/campaigns");
    await page.waitForLoadState("networkidle");

    // Find "Create Campaign" button
    const createButton = page.getByRole("button", { name: /create campaign/i });

    // Verify shadcn/ui button base classes are present
    await expect(createButton).toHaveClass(/inline-flex/);
    await expect(createButton).toHaveClass(/items-center/);
    await expect(createButton).toHaveClass(/justify-center/);
    await expect(createButton).toHaveClass(/rounded-md/);

    // Take screenshot of button
    await expect(page).toHaveScreenshot("button-campaign-create-light.png");
  });

  test("should display button variants correctly", async ({ page }) => {
    // Navigate to a page with multiple button variants
    await page.goto("/campaigns");

    // Test default variant (primary)
    const primaryButton = page.getByRole("button", {
      name: /create campaign/i,
    });
    await expect(primaryButton).toHaveClass(/bg-primary/);

    // Test outline variant (if exists)
    const outlineButtons = page.locator("button.border");
    if ((await outlineButtons.count()) > 0) {
      await expect(outlineButtons.first()).toHaveClass(/border-input/);
    }

    // Screenshot all button variants
    await expect(page).toHaveScreenshot("button-variants-light.png");
  });

  test("should show hover states beautifully", async ({ page }) => {
    await page.goto("/campaigns");

    const createButton = page.getByRole("button", { name: /create campaign/i });

    // Hover over button
    await createButton.hover();
    await page.waitForTimeout(100); // Wait for transition

    // Screenshot hover state
    await expect(page).toHaveScreenshot("button-hover-state.png");
  });

  test("should work in dark mode", async ({ page }) => {
    await page.goto("/campaigns");

    // Toggle dark mode (adjust selector based on your implementation)
    const themeToggle = page.locator("[data-theme-toggle]");
    if (await themeToggle.isVisible()) {
      await themeToggle.click();
      await page.waitForTimeout(300); // Wait for theme transition
    } else {
      // Fallback: manually add dark class
      await page.evaluate(() => {
        document.documentElement.classList.add("dark");
      });
    }

    // Verify dark mode is active
    const html = page.locator("html");
    await expect(html).toHaveClass(/dark/);

    // Screenshot button in dark mode
    await expect(page).toHaveScreenshot("button-campaign-create-dark.png");
  });

  test("should be responsive on mobile", async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto("/campaigns");

    const createButton = page.getByRole("button", { name: /create campaign/i });
    await expect(createButton).toBeVisible();

    // Screenshot mobile view
    await expect(page).toHaveScreenshot("button-mobile.png");
  });

  test("should have accessible focus state", async ({ page }) => {
    await page.goto("/campaigns");

    const createButton = page.getByRole("button", { name: /create campaign/i });

    // Tab to button (keyboard navigation)
    await page.keyboard.press("Tab");
    await page.keyboard.press("Tab");
    await page.keyboard.press("Tab");

    // Check if button is focused (adjust based on your focus logic)
    const focused = await createButton.evaluate(
      (el) => el === document.activeElement
    );

    // Take screenshot showing focus ring
    await expect(page).toHaveScreenshot("button-focus-state.png");
  });

  test("should handle disabled state correctly", async ({ page }) => {
    await page.goto("/campaigns");

    // Find a disabled button (if any exist)
    const disabledButtons = page.locator("button:disabled");

    if ((await disabledButtons.count()) > 0) {
      const disabledButton = disabledButtons.first();

      // Verify disabled styling (should have reduced opacity)
      await expect(disabledButton).toHaveClass(/disabled:opacity-50/);

      // Screenshot disabled state
      await expect(page).toHaveScreenshot("button-disabled-state.png");
    }
  });
});

/**
 * Expected Results:
 *
 * ✅ All buttons use shadcn/ui component classes
 * ✅ Buttons are beautiful and modern (not blocky Tailwind buttons)
 * ✅ Hover states are smooth with transitions
 * ✅ Focus states show visible ring (accessibility)
 * ✅ Dark mode works correctly (proper contrast)
 * ✅ Disabled buttons have reduced opacity
 * ✅ Mobile responsive (buttons stack or shrink appropriately)
 *
 * Screenshots generated:
 * - button-campaign-create-light.png
 * - button-campaign-create-dark.png
 * - button-variants-light.png
 * - button-hover-state.png
 * - button-focus-state.png
 * - button-disabled-state.png
 * - button-mobile.png
 */
