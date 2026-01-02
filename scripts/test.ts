#!/usr/bin/env bun

/**
 * Test Runner Script
 *
 * This script ensures test mode is enabled and the test user exists
 * before running tests. It provides a convenient single command to
 * run tests with proper setup.
 *
 * Usage:
 *   bun run scripts/test.ts
 *   bun run scripts/test.ts --ui
 *   bun run scripts/test.ts --headed
 */

import { spawn } from "child_process";
import { setupTestUser } from "./setup-test-user";

const colors = {
  reset: "\x1b[0m",
  red: "\x1b[31m",
  green: "\x1b[32m",
  yellow: "\x1b[33m",
  blue: "\x1b[34m",
  cyan: "\x1b[36m",
};

function log(message: string, color = colors.reset) {
  console.log(`${color}${message}${colors.reset}`);
}

async function checkTestMode(): Promise<boolean> {
  if (process.env.TEST_MODE !== "true") {
    log("❌ TEST_MODE is not enabled in .env file", colors.red);
    log("", colors.reset);
    log("To enable test mode, add this to your .env file:", colors.yellow);
    log("", colors.reset);
    log('  TEST_MODE="true"', colors.cyan);
    log('  TEST_USER_EMAIL="test@imerse.dev"', colors.cyan);
    log('  TEST_USER_PASSWORD="TestPassword123!"', colors.cyan);
    log('  TEST_USER_NAME="Test Superuser"', colors.cyan);
    log("", colors.reset);
    log(
      "⚠️  WARNING: Only enable TEST_MODE in development/testing!",
      colors.yellow
    );
    log("   NEVER enable in production!", colors.yellow);
    return false;
  }

  if (process.env.NODE_ENV === "production") {
    log("❌ Cannot run tests in production mode", colors.red);
    return false;
  }

  return true;
}

async function ensureTestUser(): Promise<boolean> {
  try {
    log("🔧 Ensuring test user exists...", colors.blue);
    await setupTestUser();
    return true;
  } catch (error) {
    log("❌ Failed to setup test user", colors.red);
    console.error(error);
    return false;
  }
}

async function runPlaywright(args: string[]): Promise<number> {
  return new Promise((resolve) => {
    log("🎭 Running Playwright tests...", colors.blue);
    log("", colors.reset);

    const playwrightArgs = ["playwright", "test", ...args];
    const proc = spawn("bunx", playwrightArgs, {
      stdio: "inherit",
      shell: true,
    });

    proc.on("close", (code) => {
      resolve(code || 0);
    });

    proc.on("error", (error) => {
      log("❌ Failed to run Playwright", colors.red);
      console.error(error);
      resolve(1);
    });
  });
}

async function main() {
  log("", colors.reset);
  log("═══════════════════════════════════════", colors.cyan);
  log("  Imerse E2E Test Runner", colors.cyan);
  log("═══════════════════════════════════════", colors.cyan);
  log("", colors.reset);

  // Step 1: Check test mode
  log("Step 1/3: Checking test mode...", colors.blue);
  const testModeEnabled = await checkTestMode();
  if (!testModeEnabled) {
    process.exit(1);
  }
  log("✅ Test mode enabled", colors.green);
  log("", colors.reset);

  // Step 2: Ensure test user exists
  log("Step 2/3: Ensuring test user exists...", colors.blue);
  const testUserReady = await ensureTestUser();
  if (!testUserReady) {
    process.exit(1);
  }
  log("✅ Test user ready", colors.green);
  log("", colors.reset);

  // Step 3: Run Playwright tests
  log("Step 3/3: Running tests...", colors.blue);
  const args = process.argv.slice(2);
  const exitCode = await runPlaywright(args);

  log("", colors.reset);
  if (exitCode === 0) {
    log("═══════════════════════════════════════", colors.green);
    log("  ✅ All tests passed!", colors.green);
    log("═══════════════════════════════════════", colors.green);
  } else {
    log("═══════════════════════════════════════", colors.red);
    log("  ❌ Some tests failed", colors.red);
    log("═══════════════════════════════════════", colors.red);
  }
  log("", colors.reset);

  process.exit(exitCode);
}

main().catch((error) => {
  log("❌ Unexpected error", colors.red);
  console.error(error);
  process.exit(1);
});
