import { expect, test } from "@playwright/test";

test.describe("Shadcn Component Verification", () => {
  test("verify shadcn components are styled correctly", async ({ page }) => {
    // Navigate to homepage
    await page.goto("/");

    // Wait for page to fully load
    await page.waitForLoadState("networkidle");
    await page.waitForTimeout(1000);

    // Check computed styles of key elements
    const header = page.locator("header").first();
    const backgroundColor = await header.evaluate((el) => {
      return window.getComputedStyle(el).backgroundColor;
    });

    console.log(`Header background color: ${backgroundColor}`);

    // Check if button exists and get its styles
    const button = page.locator('a:has-text("Get Started")').first();
    const buttonStyles = await button.evaluate((el) => {
      const styles = window.getComputedStyle(el);
      return {
        backgroundColor: styles.backgroundColor,
        color: styles.color,
        borderRadius: styles.borderRadius,
        padding: styles.padding,
      };
    });

    console.log("Button styles:", JSON.stringify(buttonStyles, null, 2));

    // Check muted text color
    const mutedText = page.locator(".text-muted-foreground").first();
    if ((await mutedText.count()) > 0) {
      const mutedColor = await mutedText.evaluate((el) => {
        return window.getComputedStyle(el).color;
      });
      console.log(`Muted text color: ${mutedColor}`);
    }

    // Check card background
    const card = page.locator('[class*="card"]').first();
    if ((await card.count()) > 0) {
      const cardBg = await card.evaluate((el) => {
        return window.getComputedStyle(el).backgroundColor;
      });
      console.log(`Card background: ${cardBg}`);
    }

    // Capture screenshot with element highlights
    await page.screenshot({
      path: "test-results/shadcn-verify-light.png",
      fullPage: true,
    });

    // Switch to dark mode
    await page.evaluate(() => {
      document.documentElement.classList.add("dark");
    });

    await page.waitForTimeout(500);

    // Check dark mode colors
    const darkHeaderBg = await header.evaluate((el) => {
      return window.getComputedStyle(el).backgroundColor;
    });

    console.log(`Dark mode header background: ${darkHeaderBg}`);

    const darkButtonStyles = await button.evaluate((el) => {
      const styles = window.getComputedStyle(el);
      return {
        backgroundColor: styles.backgroundColor,
        color: styles.color,
      };
    });

    console.log(
      "Dark mode button styles:",
      JSON.stringify(darkButtonStyles, null, 2)
    );

    await page.screenshot({
      path: "test-results/shadcn-verify-dark.png",
      fullPage: true,
    });

    // Verify colors changed between light and dark
    expect(backgroundColor).not.toBe(darkHeaderBg);
  });
});
