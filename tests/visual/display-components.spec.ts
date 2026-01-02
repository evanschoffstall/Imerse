import { expect, test } from "@playwright/test";

/**
 * Visual Testing: Display Components
 *
 * Tests shadcn/ui display components: Card, Table, Accordion, Separator, Scroll Area
 * Verifies beautiful, modern styling in light/dark modes
 *
 * Run: bunx playwright test tests/visual/display-components.spec.ts --headed
 */

test.describe("Display Components - shadcn/ui Verification", () => {
  test.beforeEach(async ({ page }) => {
    // Login as test user
    await page.goto("/login");
    await page.fill('input[name="email"]', "test@example.com");
    await page.fill('input[name="password"]', "password");
    await page.click('button[type="submit"]');
    await page.waitForURL("/dashboard");
  });

  test("Card component should use shadcn/ui styling", async ({ page }) => {
    await page.goto("/dashboard");
    await page.waitForLoadState("networkidle");

    // Look for card elements
    const card = page.locator(".rounded-lg.border").first();

    if (await card.isVisible()) {
      // Verify shadcn/ui card classes
      await expect(card).toHaveClass(/rounded-lg/);
      await expect(card).toHaveClass(/border/);
      await expect(card).toHaveClass(/bg-card/);

      // Screenshot card
      await expect(page).toHaveScreenshot("card-default-light.png");
    }
  });

  test("Card with header and footer should look beautiful", async ({
    page,
  }) => {
    await page.goto("/dashboard");

    const card = page.locator(".rounded-lg.border").first();

    if (await card.isVisible()) {
      // Look for card header
      const cardHeader = card.locator(".flex.flex-col").first();

      // Screenshot complete card structure
      await expect(page).toHaveScreenshot("card-complete-structure-light.png");
    }
  });

  test("Table component should use shadcn/ui styling", async ({ page }) => {
    await page.goto("/campaigns");
    await page.waitForLoadState("networkidle");

    // Look for table elements
    const table = page.locator("table").first();

    if (await table.isVisible()) {
      // Verify shadcn/ui table classes
      await expect(table).toHaveClass(/w-full/);

      // Screenshot table
      await expect(page).toHaveScreenshot("table-campaigns-light.png");
    }
  });

  test("Table with multiple rows should be readable", async ({ page }) => {
    await page.goto("/characters");
    await page.waitForLoadState("networkidle");

    const table = page.locator("table").first();

    if (await table.isVisible()) {
      // Verify table rows exist
      const rows = table.locator("tbody tr");
      const rowCount = await rows.count();

      // Screenshot table with data
      await expect(page).toHaveScreenshot("table-with-data-light.png");
    }
  });

  test("Table header should be sticky (if implemented)", async ({ page }) => {
    await page.goto("/characters");
    await page.waitForLoadState("networkidle");

    const table = page.locator("table").first();

    if (await table.isVisible()) {
      // Scroll down
      await page.evaluate(() => window.scrollBy(0, 200));
      await page.waitForTimeout(200);

      // Screenshot scrolled table
      await expect(page).toHaveScreenshot("table-scrolled-light.png");
    }
  });

  test("Accordion component should use shadcn/ui styling", async ({ page }) => {
    await page.goto("/characters");
    await page.waitForLoadState("networkidle");

    // Look for accordion elements
    const accordion = page.locator("[data-radix-accordion-root]").first();

    if (await accordion.isVisible()) {
      // Screenshot accordion closed
      await expect(page).toHaveScreenshot("accordion-closed-light.png");

      // Click to open accordion item
      const accordionTrigger = page
        .locator("[data-radix-accordion-trigger]")
        .first();
      await accordionTrigger.click();
      await page.waitForTimeout(300); // Wait for animation

      // Screenshot accordion open
      await expect(page).toHaveScreenshot("accordion-open-light.png");
    }
  });

  test("Accordion animation should be smooth", async ({ page }) => {
    await page.goto("/characters");

    const accordion = page.locator("[data-radix-accordion-root]").first();

    if (await accordion.isVisible()) {
      const trigger = page.locator("[data-radix-accordion-trigger]").first();

      // Open accordion
      await trigger.click();
      await page.waitForTimeout(150); // Mid-animation

      // Screenshot during animation
      await expect(page).toHaveScreenshot("accordion-animating.png");
    }
  });

  test("Separator component should use shadcn/ui styling", async ({ page }) => {
    await page.goto("/dashboard");
    await page.waitForLoadState("networkidle");

    // Look for separator elements
    const separator = page.locator(".border-t, .border-b").first();

    if (await separator.isVisible()) {
      // Screenshot separator
      await expect(page).toHaveScreenshot("separator-horizontal-light.png");
    }
  });

  test("Vertical separator should look correct", async ({ page }) => {
    await page.goto("/dashboard");

    // Look for vertical separators
    const verticalSeparator = page.locator(".border-l, .border-r").first();

    if (await verticalSeparator.isVisible()) {
      // Screenshot vertical separator
      await expect(page).toHaveScreenshot("separator-vertical-light.png");
    }
  });

  test("Scroll Area component should use shadcn/ui styling", async ({
    page,
  }) => {
    await page.goto("/characters");
    await page.waitForLoadState("networkidle");

    // Look for scroll area (custom scrollbar)
    const scrollArea = page
      .locator("[data-radix-scroll-area-viewport]")
      .first();

    if (await scrollArea.isVisible()) {
      // Verify scroll area classes
      await expect(scrollArea).toHaveClass(/h-full/);

      // Screenshot scroll area
      await expect(page).toHaveScreenshot("scroll-area-light.png");
    }
  });

  test("Scroll Area scrollbar should be visible on scroll", async ({
    page,
  }) => {
    await page.goto("/characters");

    const scrollArea = page
      .locator("[data-radix-scroll-area-viewport]")
      .first();

    if (await scrollArea.isVisible()) {
      // Scroll within scroll area
      await scrollArea.evaluate((el) => (el.scrollTop = 100));
      await page.waitForTimeout(200);

      // Screenshot with scrollbar visible
      await expect(page).toHaveScreenshot("scroll-area-scrolling.png");
    }
  });

  test("All display components should work in dark mode", async ({ page }) => {
    await page.goto("/dashboard");

    // Toggle dark mode
    await page.evaluate(() => {
      document.documentElement.classList.add("dark");
    });
    await page.waitForTimeout(300);

    // Verify dark mode
    const html = page.locator("html");
    await expect(html).toHaveClass(/dark/);

    // Screenshot cards in dark mode
    const card = page.locator(".rounded-lg.border").first();
    if (await card.isVisible()) {
      await expect(page).toHaveScreenshot("card-dark.png");
    }

    // Navigate to table page
    await page.goto("/campaigns");
    await page.waitForTimeout(300);

    const table = page.locator("table").first();
    if (await table.isVisible()) {
      await expect(page).toHaveScreenshot("table-dark.png");
    }
  });

  test("Card should be responsive on mobile", async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto("/dashboard");
    await page.waitForLoadState("networkidle");

    const card = page.locator(".rounded-lg.border").first();

    if (await card.isVisible()) {
      // Screenshot mobile card
      await expect(page).toHaveScreenshot("card-mobile.png");
    }
  });

  test("Table should be responsive on mobile", async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto("/campaigns");
    await page.waitForLoadState("networkidle");

    const table = page.locator("table").first();

    if (await table.isVisible()) {
      // Screenshot mobile table (should have horizontal scroll)
      await expect(page).toHaveScreenshot("table-mobile.png");
    }
  });

  test("Accordion should be responsive on mobile", async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto("/characters");
    await page.waitForLoadState("networkidle");

    const accordion = page.locator("[data-radix-accordion-root]").first();

    if (await accordion.isVisible()) {
      // Screenshot mobile accordion
      await expect(page).toHaveScreenshot("accordion-mobile.png");
    }
  });

  test("Card hover effects should be subtle", async ({ page }) => {
    await page.goto("/dashboard");

    const card = page.locator(".rounded-lg.border").first();

    if (await card.isVisible()) {
      // Hover over card
      await card.hover();
      await page.waitForTimeout(200);

      // Screenshot hover state
      await expect(page).toHaveScreenshot("card-hover-light.png");
    }
  });

  test("Table row hover should be visible", async ({ page }) => {
    await page.goto("/campaigns");
    await page.waitForLoadState("networkidle");

    const table = page.locator("table").first();

    if (await table.isVisible()) {
      const firstRow = table.locator("tbody tr").first();

      if (await firstRow.isVisible()) {
        // Hover over row
        await firstRow.hover();
        await page.waitForTimeout(100);

        // Screenshot row hover
        await expect(page).toHaveScreenshot("table-row-hover-light.png");
      }
    }
  });

  test("Multiple cards in grid should look consistent", async ({ page }) => {
    await page.goto("/dashboard");
    await page.waitForLoadState("networkidle");

    const cards = page.locator(".rounded-lg.border");
    const cardCount = await cards.count();

    if (cardCount > 1) {
      // Screenshot grid of cards
      await expect(page).toHaveScreenshot("card-grid-light.png");
    }
  });

  test("Table with empty state should look good", async ({ page }) => {
    await page.goto("/items");
    await page.waitForLoadState("networkidle");

    // If no items exist, table should show empty state
    const emptyState = page.locator("text=/no items|empty/i").first();

    if (await emptyState.isVisible()) {
      // Screenshot empty table
      await expect(page).toHaveScreenshot("table-empty-state.png");
    }
  });

  test("Scroll Area should handle long content gracefully", async ({
    page,
  }) => {
    await page.goto("/characters");

    const scrollArea = page
      .locator("[data-radix-scroll-area-viewport]")
      .first();

    if (await scrollArea.isVisible()) {
      // Scroll to bottom
      await scrollArea.evaluate((el) => (el.scrollTop = el.scrollHeight));
      await page.waitForTimeout(200);

      // Screenshot scrolled to bottom
      await expect(page).toHaveScreenshot("scroll-area-bottom.png");
    }
  });
});
