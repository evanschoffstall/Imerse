/**
 * Test Mode Middleware
 *
 * Optional: Provides additional utilities for test mode.
 * This can be used to bypass certain checks or add test-specific
 * functionality during E2E testing.
 *
 * ⚠️ SECURITY WARNING: Only enable in development/testing environments!
 */

import { NextRequest, NextResponse } from "next/server";

/**
 * Check if test mode is enabled
 */
export function isTestMode(): boolean {
  return (
    process.env.TEST_MODE === "true" && process.env.NODE_ENV !== "production"
  );
}

/**
 * Check if the current request is from a test
 * (based on user agent or special header)
 */
export function isTestRequest(request: NextRequest): boolean {
  // Check for Playwright user agent
  const userAgent = request.headers.get("user-agent") || "";
  if (userAgent.includes("Playwright")) {
    return true;
  }

  // Check for custom test header
  const testHeader = request.headers.get("x-test-mode");
  if (testHeader === "true") {
    return true;
  }

  return false;
}

/**
 * Get test user email from environment
 */
export function getTestUserEmail(): string {
  return process.env.TEST_USER_EMAIL || "test@imerse.dev";
}

/**
 * Check if a user is the test user
 */
export function isTestUser(userEmail: string): boolean {
  return userEmail === getTestUserEmail();
}

/**
 * Middleware to add test mode indicators to response headers
 * (useful for debugging)
 */
export function addTestModeHeaders(response: NextResponse): NextResponse {
  if (isTestMode()) {
    response.headers.set("X-Test-Mode", "true");
    response.headers.set("X-Test-User-Email", getTestUserEmail());
  }
  return response;
}

/**
 * Bypass permission checks for test user (use with caution!)
 *
 * This function can be used in API routes to grant test users
 * superuser permissions during testing.
 *
 * Example usage in an API route:
 *
 * ```typescript
 * import { bypassPermissionForTest } from '@/lib/test-mode';
 *
 * if (bypassPermissionForTest(session?.user?.email)) {
 *   // Grant access
 *   return NextResponse.json({ data });
 * }
 * ```
 */
export function bypassPermissionForTest(userEmail?: string | null): boolean {
  if (!isTestMode()) {
    return false;
  }

  if (!userEmail) {
    return false;
  }

  return isTestUser(userEmail);
}

/**
 * Get test mode configuration
 */
export function getTestModeConfig() {
  return {
    enabled: isTestMode(),
    testUserEmail: getTestUserEmail(),
    environment: process.env.NODE_ENV,
  };
}

/**
 * Utility to log test mode actions (only in test mode)
 */
export function testLog(message: string, ...args: any[]): void {
  if (isTestMode() && process.env.NODE_ENV !== "production") {
    console.log(`[TEST MODE] ${message}`, ...args);
  }
}

/**
 * Assert that we're in test mode (throws error if not)
 */
export function assertTestMode(operation: string): void {
  if (!isTestMode()) {
    throw new Error(
      `Operation "${operation}" is only allowed in test mode. ` +
        `Set TEST_MODE="true" in .env to enable.`
    );
  }

  if (process.env.NODE_ENV === "production") {
    throw new Error(
      `Test mode operations are not allowed in production environment.`
    );
  }
}

/**
 * Example API route helper that grants test user superuser access
 *
 * Usage in API routes:
 *
 * ```typescript
 * import { grantTestUserAccess } from '@/lib/test-mode';
 *
 * export async function GET(request: NextRequest) {
 *   const session = await getServerSession(authOptions);
 *
 *   // Grant access if test user
 *   if (grantTestUserAccess(session?.user?.email)) {
 *     return NextResponse.json({ authorized: true });
 *   }
 *
 *   // Regular permission checks
 *   if (!hasPermission(session)) {
 *     return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
 *   }
 *
 *   return NextResponse.json({ authorized: true });
 * }
 * ```
 */
export function grantTestUserAccess(userEmail?: string | null): boolean {
  const hasAccess = bypassPermissionForTest(userEmail);

  if (hasAccess) {
    testLog(`Granting superuser access to test user: ${userEmail}`);
  }

  return hasAccess;
}
