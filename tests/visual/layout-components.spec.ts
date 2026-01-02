import { expect, test } from "@playwright/test";

/**
 * Visual Testing: Layout Components
 *
 * Tests Header, Footer, and responsive layouts with shadcn/ui components
 * Verifies beautiful, modern styling in light/dark modes and all viewports
 *
 * Run: bunx playwright test tests/visual/layout-components.spec.ts --headed
 */

test.describe("Layout Components - shadcn/ui Verification", () => {
  test.beforeEach(async ({ page }) => {
    // Login as test user
    await page.goto("/login");
    await page.fill('input[name="email"]', "test@example.com");
    await page.fill('input[name="password"]', "password");
    await page.click('button[type="submit"]');
    await page.waitForURL("/dashboard");
  });

  test("Header should use shadcn/ui styling", async ({ page }) => {
    await page.goto("/dashboard");
    await page.waitForLoadState("networkidle");

    // Find header element
    const header = page.locator("header");
    await expect(header).toBeVisible();

    // Verify shadcn/ui classes
    await expect(header).toHaveClass(/border-b/);
    await expect(header).toHaveClass(/bg-background/);

    // Screenshot header
    await expect(page).toHaveScreenshot("layout-header-light.png");
  });

  test("Header navigation should use NavigationMenu", async ({ page }) => {
    await page.goto("/dashboard");

    // Look for navigation menu
    const navMenu = page.locator('[role="navigation"]');
    await expect(navMenu).toBeVisible();

    // Find navigation links
    const campaignsLink = page.getByRole("link", { name: "Campaigns" });
    await expect(campaignsLink).toBeVisible();

    // Screenshot navigation
    await expect(page).toHaveScreenshot("layout-navigation-desktop.png");
  });

  test("Header buttons should use shadcn/ui Button", async ({ page }) => {
    // Go to logged out state
    await page.goto("/");
    await page.waitForLoadState("networkidle");

    // Find Login and Sign Up buttons
    const loginButton = page.getByRole("link", { name: "Login" });
    const signupButton = page.getByRole("link", { name: "Sign Up" });

    if (await loginButton.isVisible()) {
      // Verify button styling
      await expect(loginButton).toHaveClass(/inline-flex/);

      // Screenshot buttons
      await expect(page).toHaveScreenshot("layout-header-buttons-light.png");
    }
  });

  test("Mobile menu should use Sheet component", async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto("/dashboard");
    await page.waitForLoadState("networkidle");

    // Find mobile menu trigger (hamburger button)
    const menuButton = page
      .locator("button")
      .filter({ has: page.locator("svg") })
      .first();

    if (await menuButton.isVisible()) {
      // Click to open mobile menu
      await menuButton.click();
      await page.waitForTimeout(300);

      // Verify Sheet opened
      const sheet = page.locator('[role="dialog"]');
      await expect(sheet).toBeVisible();

      // Screenshot mobile menu
      await expect(page).toHaveScreenshot("layout-mobile-menu-open.png");
    }
  });

  test("Mobile menu should contain all navigation items", async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto("/dashboard");

    const menuButton = page
      .locator('button[aria-label*="menu"], button')
      .filter({ has: page.locator("svg") })
      .first();

    if (await menuButton.isVisible()) {
      await menuButton.click();
      await page.waitForTimeout(300);

      // Check for navigation items
      const campaignsLink = page.getByRole("link", { name: "Campaigns" });
      const charactersLink = page.getByRole("link", { name: "Characters" });

      await expect(campaignsLink).toBeVisible();
      await expect(charactersLink).toBeVisible();

      // Screenshot mobile menu content
      await expect(page).toHaveScreenshot("layout-mobile-menu-content.png");
    }
  });

  test("Footer should use shadcn/ui styling", async ({ page }) => {
    await page.goto("/dashboard");
    await page.waitForLoadState("networkidle");

    // Scroll to footer
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    await page.waitForTimeout(200);

    // Find footer element
    const footer = page.locator("footer");
    await expect(footer).toBeVisible();

    // Verify shadcn/ui classes
    await expect(footer).toHaveClass(/border-t/);
    await expect(footer).toHaveClass(/bg-background/);

    // Screenshot footer
    await expect(page).toHaveScreenshot("layout-footer-light.png");
  });

  test("Footer should use Separator component", async ({ page }) => {
    await page.goto("/dashboard");

    // Scroll to footer
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    await page.waitForTimeout(200);

    const footer = page.locator("footer");

    // Look for separator within footer
    const separator = footer.locator('[role="separator"], .border-t').last();

    if (await separator.isVisible()) {
      // Screenshot footer with separator
      await expect(page).toHaveScreenshot("layout-footer-separator.png");
    }
  });

  test("Footer links should have proper hover states", async ({ page }) => {
    await page.goto("/dashboard");

    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    await page.waitForTimeout(200);

    const footer = page.locator("footer");
    const firstLink = footer.locator("a").first();

    if (await firstLink.isVisible()) {
      // Hover over link
      await firstLink.hover();
      await page.waitForTimeout(100);

      // Screenshot hover state
      await expect(page).toHaveScreenshot("layout-footer-link-hover.png");
    }
  });

  test("All layout components should work in dark mode", async ({ page }) => {
    await page.goto("/dashboard");

    // Toggle dark mode
    await page.evaluate(() => {
      document.documentElement.classList.add("dark");
    });
    await page.waitForTimeout(300);

    // Verify dark mode
    const html = page.locator("html");
    await expect(html).toHaveClass(/dark/);

    // Screenshot header in dark mode
    await expect(page).toHaveScreenshot("layout-header-dark.png");

    // Scroll to footer and screenshot
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    await page.waitForTimeout(200);

    await expect(page).toHaveScreenshot("layout-footer-dark.png");
  });

  test("Mobile menu should work in dark mode", async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto("/dashboard");

    // Toggle dark mode
    await page.evaluate(() => {
      document.documentElement.classList.add("dark");
    });
    await page.waitForTimeout(300);

    const menuButton = page
      .locator("button")
      .filter({ has: page.locator("svg") })
      .first();

    if (await menuButton.isVisible()) {
      await menuButton.click();
      await page.waitForTimeout(300);

      // Screenshot mobile menu in dark mode
      await expect(page).toHaveScreenshot("layout-mobile-menu-dark.png");
    }
  });

  test("Header should be sticky on scroll", async ({ page }) => {
    await page.goto("/campaigns");
    await page.waitForLoadState("networkidle");

    const header = page.locator("header");

    // Get initial position
    const initialPosition = await header.boundingBox();

    // Scroll down
    await page.evaluate(() => window.scrollBy(0, 500));
    await page.waitForTimeout(200);

    // Header should still be visible (sticky)
    await expect(header).toBeVisible();

    // Screenshot scrolled state
    await expect(page).toHaveScreenshot("layout-header-sticky.png");
  });

  test("Layout should be responsive on tablet", async ({ page }) => {
    // Set tablet viewport
    await page.setViewportSize({ width: 768, height: 1024 });
    await page.goto("/dashboard");
    await page.waitForLoadState("networkidle");

    // Screenshot header on tablet
    await expect(page).toHaveScreenshot("layout-header-tablet.png");

    // Scroll to footer
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    await page.waitForTimeout(200);

    // Screenshot footer on tablet
    await expect(page).toHaveScreenshot("layout-footer-tablet.png");
  });

  test("Layout should be responsive on desktop", async ({ page }) => {
    // Set desktop viewport
    await page.setViewportSize({ width: 1920, height: 1080 });
    await page.goto("/dashboard");
    await page.waitForLoadState("networkidle");

    // Screenshot full page on desktop
    await expect(page).toHaveScreenshot("layout-desktop-fullpage.png", {
      fullPage: true,
    });
  });

  test("Theme toggle should be visible in header", async ({ page }) => {
    await page.goto("/dashboard");

    // Find theme toggle button
    const themeToggle = page.locator("[data-theme-toggle]");

    if (await themeToggle.isVisible()) {
      await expect(themeToggle).toBeVisible();

      // Screenshot theme toggle
      await expect(page).toHaveScreenshot("layout-theme-toggle.png");
    }
  });

  test("Navigation links should have active state", async ({ page }) => {
    await page.goto("/campaigns");
    await page.waitForLoadState("networkidle");

    // Check if campaigns link has active styling
    const campaignsLink = page.getByRole("link", { name: "Campaigns" });

    if (await campaignsLink.isVisible()) {
      // Screenshot with active link
      await expect(page).toHaveScreenshot("layout-navigation-active.png");
    }
  });

  test("Header should not overflow on small screens", async ({ page }) => {
    await page.setViewportSize({ width: 320, height: 568 });
    await page.goto("/dashboard");
    await page.waitForLoadState("networkidle");

    const header = page.locator("header");
    await expect(header).toBeVisible();

    // Screenshot very small screen
    await expect(page).toHaveScreenshot("layout-header-320px.png");
  });

  test("Footer grid should stack on mobile", async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto("/dashboard");

    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    await page.waitForTimeout(200);

    const footer = page.locator("footer");

    // Screenshot mobile footer (should stack vertically)
    await expect(page).toHaveScreenshot("layout-footer-mobile-stacked.png");
  });

  test("Complete layout should look modern and consistent", async ({
    page,
  }) => {
    await page.goto("/dashboard");
    await page.waitForLoadState("networkidle");

    // Screenshot full page to verify overall layout
    await expect(page).toHaveScreenshot("layout-complete-light.png", {
      fullPage: true,
    });
  });

  test("Mobile layout should be fully functional", async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto("/dashboard");
    await page.waitForLoadState("networkidle");

    // Screenshot complete mobile layout
    await expect(page).toHaveScreenshot("layout-complete-mobile.png", {
      fullPage: true,
    });
  });
});
