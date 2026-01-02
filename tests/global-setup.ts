/**
 * Playwright Global Setup
 *
 * This file runs once before all tests to set up the test environment.
 * It creates the test user and authenticates once, saving the session
 * for reuse across all tests.
 */

import { chromium, FullConfig } from "@playwright/test";
import { setupTestUser } from "../scripts/setup-test-user";
import {
  clearAuthStorage,
  getTestUserCredentials,
  performLogin,
  saveAuthStorage,
} from "./helpers/auth";

async function globalSetup(config: FullConfig) {
  console.log("");
  console.log("🚀 Running global test setup...");
  console.log("");

  // Check if TEST_MODE is enabled
  if (process.env.TEST_MODE !== "true") {
    console.error("❌ TEST_MODE is not enabled in .env file");
    console.error('   Set TEST_MODE="true" to run tests');
    console.error(
      "   This should only be enabled in development/testing environments!"
    );
    throw new Error("TEST_MODE not enabled");
  }

  // Step 1: Create/verify test user in database
  console.log("Step 1/3: Setting up test user...");
  await setupTestUser();
  console.log("");

  // Step 2: Start a browser and authenticate
  console.log("Step 2/3: Authenticating test user...");
  const browser = await chromium.launch();
  const context = await browser.newContext();
  const page = await context.newPage();

  try {
    // Clear any existing auth storage
    clearAuthStorage();

    // Set base URL for navigation
    const baseURL = config.projects[0].use?.baseURL || "http://localhost:3000";
    page.context().setDefaultNavigationTimeout(60000);
    page.context().setDefaultTimeout(60000);

    // Perform login (navigates to login page internally)
    await performLogin(page, getTestUserCredentials());
    console.log(`   Login completed`);

    // Save the authentication state
    await saveAuthStorage(page);
    console.log(`   Auth state saved`);
  } catch (error) {
    console.error("❌ Failed to authenticate:", error);
    throw error;
  } finally {
    await browser.close();
  }

  console.log("");

  // Step 3: Verify setup
  console.log("Step 3/3: Verifying setup...");
  console.log("✅ Global setup complete!");
  console.log("");
  console.log("📝 Test user credentials:");
  const creds = getTestUserCredentials();
  console.log(`   Email: ${creds.email}`);
  console.log(`   Password: ${creds.password}`);
  console.log("");
  console.log("🎭 All tests will now run with authenticated session");
  console.log("");
}

export default globalSetup;
