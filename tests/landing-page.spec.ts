import { test } from "@playwright/test";

test("landing page desktop screenshot", async ({ page }) => {
  await page.setViewportSize({ width: 1920, height: 1080 });
  await page.goto("http://localhost:3000/");
  await page.waitForLoadState("networkidle");

  // Take full page screenshot
  await page.screenshot({
    path: "test-results/landing-page-desktop.png",
    fullPage: true,
  });

  console.log("Desktop screenshot saved");
});

test("landing page mobile screenshot", async ({ page }) => {
  await page.setViewportSize({ width: 375, height: 667 });
  await page.goto("http://localhost:3000/");
  await page.waitForLoadState("networkidle");

  await page.screenshot({
    path: "test-results/landing-page-mobile.png",
    fullPage: true,
  });

  console.log("Mobile screenshot saved");
});

test("landing page screenshot", async ({ page }) => {
  await page.goto("http://localhost:3000/");
  await page.waitForLoadState("networkidle");

  // Take full page screenshot
  await page.screenshot({
    path: "test-results/landing-page-full.png",
    fullPage: true,
  });

  console.log("Screenshot saved to test-results/landing-page-full.png");
});
