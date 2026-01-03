import { expect, test } from "@playwright/test";

test.describe("Toast Notifications", () => {
  test("capture toasts in both light and dark themes", async ({ page }) => {
    // Navigate to dashboard
    await page.goto("/dashboard");

    // Wait for page to fully load
    await page.waitForLoadState("networkidle");
    await page.waitForTimeout(500);

    // Trigger error toast directly via dynamic import
    await page.evaluate(() => {
      // @ts-expect-error - toast exposed to window for testing
      window.toast.error("Test error message");
    });

    // Wait for toast to appear
    await page.waitForSelector("[data-sonner-toast]", { timeout: 5000 });
    await page.waitForTimeout(500);

    // Capture light mode with toast
    await page.screenshot({
      path: "test-results/toast-error-light.png",
      fullPage: true,
    });

    console.log("✓ Light mode error toast screenshot saved");

    // Apply dark mode
    await page.evaluate(() => {
      document.documentElement.classList.add("dark");
    });

    // Wait for theme transition
    await page.waitForTimeout(500);

    // Trigger error toast in dark mode
    await page.evaluate(() => {
      // @ts-expect-error - toast exposed to window for testing
      window.toast.error("Test error message");
    });

    // Wait for toast to appear
    await page.waitForSelector("[data-sonner-toast]", { timeout: 5000 });
    await page.waitForTimeout(500);

    // Capture dark mode with toast
    await page.screenshot({
      path: "test-results/toast-error-dark.png",
      fullPage: true,
    });

    console.log("✓ Dark mode error toast screenshot saved");

    // Verify toast is visible (get the last one)
    const toast = await page.locator("[data-sonner-toast]").last();
    await expect(toast).toBeVisible();

    // Verify toast contains test message
    const toastText = await toast.textContent();
    expect(toastText).toContain("Test error message");

    console.log("✓ Toast validation passed");
  });

  test("capture different toast types in light mode", async ({ page }) => {
    // Navigate to a page and inject test toasts
    await page.goto("/");
    await page.waitForLoadState("networkidle");

    // Inject different toast types via console
    await page.evaluate(() => {
      // @ts-expect-error - toast is available globally via sonner
      if (window.toast) {
        // @ts-expect-error - toast.error method exists
        window.toast.error("This is an error toast");
      }
    });

    await page.waitForTimeout(500);
    await page.screenshot({
      path: "test-results/toast-types-light.png",
      fullPage: false,
    });

    console.log("✓ Toast types screenshot saved");
  });
});
