/**
 * Example Test Using New Authentication System
 *
 * This test demonstrates how to use the new test authentication system.
 * The test user is automatically authenticated via global setup, so you
 * don't need to login in each test.
 */

import { expect, test } from "@playwright/test";

// Note: No need to import or call authenticateAsTestUser!
// The global setup already handles authentication, and the
// storageState in playwright.config.ts loads it automatically.

test.describe("Test Authentication Example", () => {
  test("should be authenticated automatically", async ({ page }) => {
    // Navigate to a protected page
    await page.goto("/dashboard");

    // Should NOT be redirected to login
    expect(page.url()).not.toContain("/login");

    // Should see authenticated user elements
    // (adjust selectors based on your app)
    const userMenu = page.locator('[data-testid="user-menu"]');
    await expect(userMenu).toBeVisible();
  });

  test("should be able to create a campaign", async ({ page }) => {
    // Navigate to campaign creation
    await page.goto("/campaigns/create");

    // Fill out the form
    await page.fill('input[name="name"]', "Test Campaign via Auth System");
    await page.fill(
      'textarea[name="entry"]',
      "This campaign was created using the new test auth system!"
    );

    // Submit
    await page.click('button[type="submit"]');

    // Should redirect to campaign detail page
    await page.waitForURL(/\/campaigns\/\d+/);

    // Verify campaign was created
    await expect(page.locator("h1")).toContainText(
      "Test Campaign via Auth System"
    );
  });

  test("should have access to all entities", async ({ page }) => {
    // Test that we can access various entity pages without permission issues
    const entityPages = [
      "/campaigns",
      "/characters",
      "/locations",
      "/items",
      "/quests",
      "/events",
      "/notes",
      "/maps",
    ];

    for (const path of entityPages) {
      await page.goto(path);

      // Should NOT be redirected to login
      expect(page.url()).not.toContain("/login");

      // Should NOT see 403/unauthorized error
      const body = await page.textContent("body");
      expect(body).not.toContain("Unauthorized");
      expect(body).not.toContain("403");
    }
  });

  test("should persist authentication across test runs", async ({ page }) => {
    // First test run
    await page.goto("/dashboard");
    const userName1 = await page.textContent('[data-testid="user-name"]');

    // Simulate "new" page (like a new test)
    await page.goto("/login");

    // Should be auto-redirected away from login since already authenticated
    await page.waitForTimeout(1000);
    const currentUrl = page.url();

    // Either redirected to dashboard or stayed on login but with user menu visible
    const isAuthenticated =
      !currentUrl.includes("/login") ||
      (await page.locator('[data-testid="user-menu"]').isVisible());

    expect(isAuthenticated).toBeTruthy();
  });
});

test.describe("Test Mode Examples (Optional)", () => {
  test("example: using test mode utilities", async ({ page }) => {
    // If you need to verify test mode is active, you can check response headers
    await page.goto("/api/campaigns");

    // In test mode, your API routes could add special headers
    // (if you implement the test mode middleware)
    const response = await page.goto("/api/campaigns");
    const headers = response?.headers();

    // This would only work if you add the middleware to your API routes
    if (headers && headers["x-test-mode"]) {
      console.log("Test mode is active!");
    }
  });
});

/**
 * MIGRATION GUIDE for existing tests:
 *
 * BEFORE (old way - login in each test):
 * ----------------------------------------
 * test('my test', async ({ page }) => {
 *   await page.goto('/login');
 *   await page.fill('input[name="email"]', 'user@example.com');
 *   await page.fill('input[name="password"]', 'password');
 *   await page.click('button[type="submit"]');
 *
 *   // ... rest of test
 * });
 *
 *
 * AFTER (new way - already authenticated):
 * ----------------------------------------
 * test('my test', async ({ page }) => {
 *   // Just go directly to your page - you're already logged in!
 *   await page.goto('/campaigns');
 *
 *   // ... rest of test
 * });
 *
 *
 * That's it! Remove all login code from your tests.
 */
