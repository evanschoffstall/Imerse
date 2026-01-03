import { chromium, FullConfig } from "@playwright/test";
import path from "path";

/**
 * Global setup for Playwright tests
 * Authenticates a test user and saves the authentication state
 * This runs once before all tests
 */
async function globalSetup(config: FullConfig) {
  // Only run setup if TEST_MODE is enabled
  if (process.env.TEST_MODE !== "true") {
    console.log("⚠️  TEST_MODE not enabled, skipping test user setup");
    return;
  }

  const baseURL = config.projects[0].use.baseURL || "http://localhost:3000";
  const browser = await chromium.launch();
  const page = await browser.newPage();

  try {
    // Navigate to login page
    await page.goto(`${baseURL}/login`);

    // Login with test credentials from .env
    await page.fill('input[name="email"]', process.env.TEST_USER_EMAIL || "");
    await page.fill(
      'input[name="password"]',
      process.env.TEST_USER_PASSWORD || ""
    );
    await page.click('button[type="submit"]');

    // Wait for navigation to complete
    await page.waitForURL(/\/campaigns|\/dashboard/, { timeout: 10000 });

    // Save authenticated state
    const authFile = path.join(__dirname, ".auth", "user.json");
    await page.context().storageState({ path: authFile });

    console.log("✓ Test user authenticated successfully");
  } catch (error) {
    console.error("✗ Failed to authenticate test user:", error);
    throw error;
  } finally {
    await browser.close();
  }
}

export default globalSetup;
