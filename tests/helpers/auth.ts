/**
 * Playwright Authentication Helpers
 *
 * Utilities for handling authentication in E2E tests.
 * Uses storage state to authenticate once and reuse the session across all tests.
 *
 * Usage:
 *   import { authenticateAsTestUser } from '@/tests/helpers/auth';
 *
 *   test.beforeEach(async ({ page }) => {
 *     await authenticateAsTestUser(page);
 *   });
 */

import { Page } from "@playwright/test";
import fs from "fs";
import path from "path";

export const AUTH_STORAGE_PATH = path.join(__dirname, "../.auth/user.json");

export interface TestUserCredentials {
  email: string;
  password: string;
  name: string;
}

/**
 * Get test user credentials from environment variables
 */
export function getTestUserCredentials(): TestUserCredentials {
  return {
    email: process.env.TEST_USER_EMAIL || "test@imerse.dev",
    password: process.env.TEST_USER_PASSWORD || "TestPassword123!",
    name: process.env.TEST_USER_NAME || "Test Superuser",
  };
}

/**
 * Check if authentication storage exists
 */
export function hasAuthStorage(): boolean {
  return fs.existsSync(AUTH_STORAGE_PATH);
}

/**
 * Delete authentication storage (force re-authentication)
 */
export function clearAuthStorage(): void {
  if (hasAuthStorage()) {
    fs.unlinkSync(AUTH_STORAGE_PATH);
    console.log("🗑️  Cleared authentication storage");
  }
}

/**
 * Perform login and save authentication state
 *
 * This function logs in to the application and saves the authentication
 * state to a file. This state can then be reused across all tests.
 *
 * @param page - Playwright Page object
 * @param credentials - Optional custom credentials (defaults to env vars)
 */
export async function performLogin(
  page: Page,
  credentials?: TestUserCredentials
): Promise<void> {
  const creds = credentials || getTestUserCredentials();

  console.log("🔐 Logging in as test user...");
  console.log(`   Email: ${creds.email}`);

  // Get baseURL from context or use default
  const baseURL = "http://localhost:3000";

  // Navigate to login page with full URL
  await page.goto(`${baseURL}/login`, {
    waitUntil: "networkidle",
    timeout: 60000,
  });

  // Wait for form to be ready
  await page.waitForSelector('input[name="email"]', { timeout: 10000 });

  // Fill in the login form
  await page.fill('input[name="email"]', creds.email);
  await page.fill('input[name="password"]', creds.password);

  // Listen for console logs from the page
  page.on("console", (msg) => {
    if (
      msg.text().includes("🔐") ||
      msg.text().includes("✅") ||
      msg.text().includes("❌")
    ) {
      console.log(`   [Browser] ${msg.text()}`);
    }
  });

  // Submit the form
  await page.click('button[type="submit"]');

  // Wait a bit for the sign-in to process
  await page.waitForTimeout(2000);

  // Check if we're still on the login page (sign-in failed)
  const currentUrl = page.url();
  if (currentUrl.includes("/login")) {
    // Check for error message
    const errorElement = await page.$(".text-red-800, .text-red-200");
    const errorText = errorElement
      ? await errorElement.textContent()
      : "Unknown error";
    throw new Error(`Login failed: ${errorText}`);
  }

  // Wait for navigation to complete (should redirect to dashboard)
  await page.waitForURL(
    (url) =>
      url.pathname.includes("/dashboard") || !url.pathname.includes("/login"),
    {
      timeout: 60000,
    }
  );

  console.log("✅ Login successful");
}

/**
 * Save authentication state to storage file
 *
 * @param page - Playwright Page object
 */
export async function saveAuthStorage(page: Page): Promise<void> {
  // Ensure the .auth directory exists
  const authDir = path.dirname(AUTH_STORAGE_PATH);
  if (!fs.existsSync(authDir)) {
    fs.mkdirSync(authDir, { recursive: true });
  }

  // Save the storage state
  await page.context().storageState({ path: AUTH_STORAGE_PATH });
  console.log(`💾 Saved authentication storage to ${AUTH_STORAGE_PATH}`);
}

/**
 * Load authentication state from storage file
 *
 * @param page - Playwright Page object
 */
export async function loadAuthStorage(page: Page): Promise<void> {
  if (!hasAuthStorage()) {
    throw new Error(
      "Authentication storage not found. Run global setup first."
    );
  }

  // The storage state is loaded automatically by the browser context
  // when configured in playwright.config.ts, but this function can be
  // used for manual loading if needed.
  console.log(`📂 Using authentication storage from ${AUTH_STORAGE_PATH}`);
}

/**
 * Authenticate as test user (main helper for tests)
 *
 * This is the main function to use in your tests. It will check if
 * authentication storage exists, and if not, perform login and save it.
 *
 * @param page - Playwright Page object
 * @param force - Force re-authentication even if storage exists
 */
export async function authenticateAsTestUser(
  page: Page,
  force = false
): Promise<void> {
  // Clear storage if force is true
  if (force) {
    clearAuthStorage();
  }

  // If storage exists, we're already authenticated via the browser context
  if (hasAuthStorage()) {
    console.log("✅ Using existing authentication");
    return;
  }

  // Otherwise, perform login and save storage
  await performLogin(page);
  await saveAuthStorage(page);
}

/**
 * Check if user is authenticated on the current page
 *
 * @param page - Playwright Page object
 * @returns true if authenticated, false otherwise
 */
export async function isAuthenticated(page: Page): Promise<boolean> {
  // Try to access a protected element or check for user indicator
  // Adjust this based on your app's structure
  try {
    await page.waitForSelector('[data-testid="user-menu"]', { timeout: 2000 });
    return true;
  } catch {
    return false;
  }
}

/**
 * Logout the current user
 *
 * @param page - Playwright Page object
 */
export async function logout(page: Page): Promise<void> {
  console.log("🚪 Logging out...");

  // Navigate to home page first (in case we're on a protected page)
  await page.goto("/");

  // Find and click logout button (adjust selector based on your app)
  try {
    await page.click('[data-testid="logout-button"]', { timeout: 2000 });
  } catch {
    // If logout button not found, try alternative methods
    console.warn("⚠️  Logout button not found, clearing cookies instead");
    await page.context().clearCookies();
  }

  // Clear the auth storage
  clearAuthStorage();

  console.log("✅ Logged out");
}

/**
 * Get current user info from the page
 *
 * @param page - Playwright Page object
 * @returns User info or null if not authenticated
 */
export async function getCurrentUser(page: Page): Promise<{
  id: string;
  email: string;
  name: string;
} | null> {
  try {
    // This assumes your app exposes user data somewhere
    // Adjust based on your implementation
    const userData = await page.evaluate(() => {
      // Try to get user data from a global variable or API call
      const userElement = document.querySelector("[data-user-info]");
      if (userElement) {
        return JSON.parse(userElement.getAttribute("data-user-info") || "{}");
      }
      return null;
    });

    return userData;
  } catch {
    return null;
  }
}

/**
 * Create a test campaign (useful for setting up test data)
 *
 * @param page - Playwright Page object
 * @param campaignName - Name of the campaign to create
 * @returns Campaign ID
 */
export async function createTestCampaign(
  page: Page,
  campaignName = "Test Campaign"
): Promise<string> {
  console.log(`📝 Creating test campaign: ${campaignName}`);

  await page.goto("/campaigns/create");
  await page.fill('input[name="name"]', campaignName);
  await page.fill('textarea[name="entry"]', "A test campaign for E2E testing");
  await page.click('button[type="submit"]');

  // Wait for redirect to campaign page
  await page.waitForURL(/\/campaigns\/\d+/);

  // Extract campaign ID from URL
  const url = page.url();
  const campaignId = url.match(/\/campaigns\/(\d+)/)?.[1];

  if (!campaignId) {
    throw new Error("Failed to extract campaign ID from URL");
  }

  console.log(`✅ Created campaign with ID: ${campaignId}`);
  return campaignId;
}

/**
 * Delete a test campaign (cleanup)
 *
 * @param page - Playwright Page object
 * @param campaignId - ID of the campaign to delete
 */
export async function deleteTestCampaign(
  page: Page,
  campaignId: string
): Promise<void> {
  console.log(`🗑️  Deleting test campaign: ${campaignId}`);

  await page.goto(`/campaigns/${campaignId}/edit`);
  await page.click('button[data-testid="delete-campaign"]');

  // Confirm deletion if there's a confirmation dialog
  await page.click('button[data-testid="confirm-delete"]');

  // Wait for redirect
  await page.waitForURL("/campaigns");

  console.log(`✅ Deleted campaign: ${campaignId}`);
}
