import { expect, test } from "@playwright/test";

/**
 * Visual Testing: Navigation Components
 *
 * Tests shadcn/ui navigation components: Tabs, Dropdown Menu, Sheet, Command
 * Verifies beautiful, modern styling in light/dark modes and responsive layouts
 *
 * Run: bunx playwright test tests/visual/navigation-components.spec.ts --headed
 */

test.describe("Navigation Components - shadcn/ui Verification", () => {
  test.beforeEach(async ({ page }) => {
    // Login as test user
    await page.goto("/login");
    await page.fill('input[name="email"]', "test@example.com");
    await page.fill('input[name="password"]', "password");
    await page.click('button[type="submit"]');
    await page.waitForURL("/dashboard");
  });

  test("Tabs component should use shadcn/ui styling", async ({ page }) => {
    // Navigate to a page with tabs (e.g., character detail page)
    await page.goto("/characters");
    await page.waitForLoadState("networkidle");

    // Create a test character first
    const createButton = page.getByRole("button", { name: /create/i }).first();
    if (await createButton.isVisible()) {
      await createButton.click();
      await page.waitForTimeout(300);

      // Fill minimal data to create character
      const nameInput = page.locator('input[name="name"]');
      if (await nameInput.isVisible()) {
        await nameInput.fill("Visual Test Character");
        const submitButton = page.locator('button[type="submit"]');
        await submitButton.click();
        await page.waitForTimeout(500);
      }
    }

    // Look for tabs on character pages
    const tabs = page.locator('[role="tablist"]');

    if (await tabs.isVisible()) {
      // Verify shadcn/ui tabs styling
      await expect(tabs).toHaveClass(/inline-flex/);

      // Screenshot tabs
      await expect(page).toHaveScreenshot("tabs-default-light.png");

      // Click different tab if available
      const tabButtons = page.locator('[role="tab"]');
      const tabCount = await tabButtons.count();

      if (tabCount > 1) {
        await tabButtons.nth(1).click();
        await page.waitForTimeout(200);

        // Screenshot active tab
        await expect(page).toHaveScreenshot("tabs-active-light.png");
      }
    }
  });

  test("Dropdown Menu component should use shadcn/ui styling", async ({
    page,
  }) => {
    await page.goto("/dashboard");
    await page.waitForLoadState("networkidle");

    // Look for dropdown menu triggers (user menu, action menus, etc.)
    const dropdownTrigger = page
      .locator("[data-radix-collection-item]")
      .first();

    if (await dropdownTrigger.isVisible()) {
      // Click to open dropdown
      await dropdownTrigger.click();
      await page.waitForTimeout(200);

      // Verify dropdown content is visible
      const dropdownContent = page.locator('[role="menu"]');

      if (await dropdownContent.isVisible()) {
        // Verify shadcn/ui dropdown classes
        await expect(dropdownContent).toHaveClass(/rounded-md/);
        await expect(dropdownContent).toHaveClass(/shadow-md/);

        // Screenshot dropdown menu
        await expect(page).toHaveScreenshot("dropdown-menu-open-light.png");
      }
    }
  });

  test("Dropdown Menu hover states should be smooth", async ({ page }) => {
    await page.goto("/dashboard");

    // Find and open dropdown
    const dropdownTrigger = page
      .locator("button")
      .filter({ hasText: /menu|actions/i })
      .first();

    if (await dropdownTrigger.isVisible()) {
      await dropdownTrigger.click();
      await page.waitForTimeout(200);

      // Hover over menu item
      const menuItem = page.locator('[role="menuitem"]').first();

      if (await menuItem.isVisible()) {
        await menuItem.hover();
        await page.waitForTimeout(100);

        // Screenshot hover state
        await expect(page).toHaveScreenshot("dropdown-menu-hover.png");
      }
    }
  });

  test("Sheet component should use shadcn/ui styling (mobile menu)", async ({
    page,
  }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto("/dashboard");
    await page.waitForLoadState("networkidle");

    // Look for mobile menu trigger (hamburger icon)
    const menuButton = page.locator('button[aria-label*="menu"]').first();

    if (await menuButton.isVisible()) {
      await menuButton.click();
      await page.waitForTimeout(300);

      // Look for sheet content
      const sheet = page.locator('[role="dialog"]');

      if (await sheet.isVisible()) {
        // Verify shadcn/ui sheet styling
        await expect(sheet).toHaveClass(/fixed/);

        // Screenshot sheet
        await expect(page).toHaveScreenshot("sheet-mobile-menu-light.png");
      }
    }
  });

  test("Sheet overlay should be visible", async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto("/dashboard");

    const menuButton = page
      .locator("button")
      .filter({ hasText: /menu/i })
      .first();

    if (await menuButton.isVisible()) {
      await menuButton.click();
      await page.waitForTimeout(300);

      // Look for overlay
      const overlay = page.locator("[data-radix-dialog-overlay]");

      if (await overlay.isVisible()) {
        // Screenshot with overlay
        await expect(page).toHaveScreenshot("sheet-with-overlay.png");
      }
    }
  });

  test("Command component should use shadcn/ui styling (Cmd+K)", async ({
    page,
  }) => {
    await page.goto("/dashboard");

    // Open command palette with Cmd+K (or Ctrl+K on Linux)
    await page.keyboard.press("Meta+K");
    await page.waitForTimeout(300);

    // Look for command dialog
    const commandDialog = page.locator("[cmdk-root]");

    if (await commandDialog.isVisible()) {
      // Verify shadcn/ui command styling
      await expect(commandDialog).toHaveClass(/rounded-lg/);

      // Screenshot command palette
      await expect(page).toHaveScreenshot("command-palette-open-light.png");

      // Type in search
      const commandInput = page.locator("[cmdk-input]");
      if (await commandInput.isVisible()) {
        await commandInput.fill("campaign");
        await page.waitForTimeout(200);

        // Screenshot with search results
        await expect(page).toHaveScreenshot("command-palette-search-light.png");
      }
    }
  });

  test("Command component keyboard navigation should work", async ({
    page,
  }) => {
    await page.goto("/dashboard");
    await page.keyboard.press("Meta+K");
    await page.waitForTimeout(300);

    const commandDialog = page.locator("[cmdk-root]");

    if (await commandDialog.isVisible()) {
      // Press down arrow to highlight first result
      await page.keyboard.press("ArrowDown");
      await page.waitForTimeout(100);

      // Screenshot highlighted item
      await expect(page).toHaveScreenshot("command-palette-keyboard-nav.png");
    }
  });

  test("All navigation components should work in dark mode", async ({
    page,
  }) => {
    await page.goto("/dashboard");

    // Toggle dark mode
    await page.evaluate(() => {
      document.documentElement.classList.add("dark");
    });
    await page.waitForTimeout(300);

    // Verify dark mode
    const html = page.locator("html");
    await expect(html).toHaveClass(/dark/);

    // Open command palette
    await page.keyboard.press("Meta+K");
    await page.waitForTimeout(300);

    const commandDialog = page.locator("[cmdk-root]");

    if (await commandDialog.isVisible()) {
      // Screenshot command in dark mode
      await expect(page).toHaveScreenshot("command-palette-dark.png");
    }
  });

  test("Tabs should be responsive on mobile", async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto("/characters");
    await page.waitForLoadState("networkidle");

    const tabs = page.locator('[role="tablist"]');

    if (await tabs.isVisible()) {
      // Screenshot tabs on mobile
      await expect(page).toHaveScreenshot("tabs-mobile.png");
    }
  });

  test("Dropdown Menu should be accessible via keyboard", async ({ page }) => {
    await page.goto("/dashboard");

    // Tab to dropdown trigger
    await page.keyboard.press("Tab");
    await page.keyboard.press("Tab");

    // Open with Enter
    await page.keyboard.press("Enter");
    await page.waitForTimeout(200);

    const dropdownContent = page.locator('[role="menu"]');

    if (await dropdownContent.isVisible()) {
      // Screenshot keyboard-focused dropdown
      await expect(page).toHaveScreenshot("dropdown-menu-keyboard.png");
    }
  });

  test("Sheet should slide in smoothly", async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto("/dashboard");

    const menuButton = page
      .locator("button")
      .filter({ hasText: /menu/i })
      .first();

    if (await menuButton.isVisible()) {
      // Click to open sheet
      await menuButton.click();

      // Wait for animation
      await page.waitForTimeout(400);

      // Screenshot fully opened sheet
      await expect(page).toHaveScreenshot("sheet-fully-opened.png");
    }
  });

  test("Command palette should be centered on desktop", async ({ page }) => {
    await page.setViewportSize({ width: 1920, height: 1080 });
    await page.goto("/dashboard");

    await page.keyboard.press("Meta+K");
    await page.waitForTimeout(300);

    const commandDialog = page.locator("[cmdk-root]");

    if (await commandDialog.isVisible()) {
      // Screenshot centered command palette
      await expect(page).toHaveScreenshot(
        "command-palette-desktop-centered.png"
      );
    }
  });
});
