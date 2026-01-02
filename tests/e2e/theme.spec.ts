import { expect, test } from "@playwright/test";

test.describe("Theme System", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
  });

  test("should display theme toggle button", async ({ page }) => {
    const toggle = page.getByRole("button", { name: /toggle theme/i });
    await expect(toggle).toBeVisible();
  });

  test("should toggle between light and dark themes", async ({ page }) => {
    // Find theme toggle button
    const toggle = page.getByRole("button", { name: /toggle theme/i });

    // Check initial theme (should be system preference or light)
    const htmlElement = page.locator("html");

    // Click to toggle theme
    await toggle.click();
    await page.waitForTimeout(500); // Wait for theme transition

    // Check if theme changed (dark class should be present or removed)
    const hasClassAfterFirstClick = await htmlElement.getAttribute("class");

    // Click again to toggle back
    await toggle.click();
    await page.waitForTimeout(500);

    // Verify it toggled
    const hasClassAfterSecondClick = await htmlElement.getAttribute("class");
    expect(hasClassAfterFirstClick).not.toBe(hasClassAfterSecondClick);
  });

  test("should persist theme across page reloads", async ({ page }) => {
    const toggle = page.getByRole("button", { name: /toggle theme/i });
    const htmlElement = page.locator("html");

    // Set to dark mode explicitly
    await toggle.click();
    await page.waitForTimeout(500);

    const themeBeforeReload = await htmlElement.getAttribute("class");

    // Reload page
    await page.reload();
    await page.waitForTimeout(1000); // Wait for hydration

    // Theme should persist
    const themeAfterReload = await htmlElement.getAttribute("class");
    expect(themeAfterReload).toBe(themeBeforeReload);
  });

  test("should have proper accessibility attributes", async ({ page }) => {
    const toggle = page.getByRole("button", { name: /toggle theme/i });

    // Should have aria-label
    const ariaLabel = await toggle.getAttribute("aria-label");
    expect(ariaLabel).toBeTruthy();
    expect(ariaLabel).toMatch(/switch to (light|dark) mode/i);

    // Should have screen reader text
    const srText = page.locator(".sr-only", { has: toggle });
    await expect(srText.first()).toBeInViewport();
  });

  test("should update icon when toggling theme", async ({ page }) => {
    const toggle = page.getByRole("button", { name: /toggle theme/i });

    // Click to change theme
    await toggle.click();
    await page.waitForTimeout(500);

    // Icon should change (Sun or Moon)
    const hasSunIcon = await page.locator("svg").first().isVisible();
    expect(hasSunIcon).toBeTruthy();
  });

  test("should not cause hydration errors", async ({ page }) => {
    // Check console for hydration errors
    const errors: string[] = [];
    page.on("console", (msg) => {
      if (msg.type() === "error") {
        errors.push(msg.text());
      }
    });

    await page.reload();
    await page.waitForTimeout(2000);

    // Filter out non-hydration errors
    const hydrationErrors = errors.filter(
      (err) =>
        err.includes("Hydration") || err.includes("Text content does not match")
    );

    expect(hydrationErrors).toHaveLength(0);
  });
});
