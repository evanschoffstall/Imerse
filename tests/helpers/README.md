# Test Authentication System

This directory contains utilities for handling authentication in E2E tests using Playwright.

## 🎯 Overview

The test authentication system allows tests to run with a pre-authenticated superuser account, eliminating the need to login in every test. This makes tests faster, more reliable, and easier to write.

## 🚀 Quick Start

### 1. Enable Test Mode

Add to your `.env` file:

```bash
TEST_MODE="true"
TEST_USER_EMAIL="test@imerse.dev"
TEST_USER_PASSWORD="TestPassword123!"
TEST_USER_NAME="Test Superuser"
```

⚠️ **WARNING**: Only enable `TEST_MODE` in development/testing environments. **NEVER in production!**

### 2. Set Up Test User

Run this once to create the test user in your database:

```bash
bun run scripts/setup-test-user.ts
```

### 3. Run Tests

The authentication happens automatically via global setup:

```bash
# Run all tests (authenticated automatically)
bun run test

# Run with UI
bun run test:ui

# Run specific test
bunx playwright test tests/e2e/campaigns.spec.ts
```

## 📁 File Structure

```
tests/
├── .auth/                    # Authentication storage (gitignored)
│   └── user.json            # Saved session state
├── helpers/
│   └── auth.ts              # Authentication utilities
├── global-setup.ts          # Runs once before all tests
└── e2e/
    └── *.spec.ts            # Your test files
```

## 🔧 How It Works

1. **Global Setup** (`tests/global-setup.ts`):

   - Runs once before all tests
   - Creates test user in database
   - Logs in and saves session to `tests/.auth/user.json`

2. **Playwright Config** (`playwright.config.ts`):

   - Configured to use `storageState: './tests/.auth/user.json'`
   - All tests automatically load this authenticated session

3. **Test Files**:
   - No login code needed!
   - Tests start already authenticated
   - Can directly navigate to protected pages

## 📝 Writing Tests

### Basic Test (New Way)

```typescript
import { test, expect } from "@playwright/test";

test("create a campaign", async ({ page }) => {
  // Already authenticated! Just navigate and test
  await page.goto("/campaigns/create");

  await page.fill('input[name="name"]', "My Campaign");
  await page.click('button[type="submit"]');

  await expect(page).toHaveURL(/\/campaigns\/\d+/);
});
```

### Migrating Old Tests

**BEFORE** (old way with login):

```typescript
test("my test", async ({ page }) => {
  await page.goto("/login");
  await page.fill('input[name="email"]', "user@example.com");
  await page.fill('input[name="password"]', "password");
  await page.click('button[type="submit"]');

  await page.goto("/campaigns");
  // ... rest of test
});
```

**AFTER** (new way):

```typescript
test("my test", async ({ page }) => {
  await page.goto("/campaigns");
  // ... rest of test
});
```

Just remove all the login code!

## 🛠️ Helper Functions

### Available in `tests/helpers/auth.ts`:

```typescript
// Get test user credentials
const creds = getTestUserCredentials();

// Force re-authentication
await authenticateAsTestUser(page, true);

// Check if authenticated
const isAuth = await isAuthenticated(page);

// Logout (if needed)
await logout(page);

// Create test data
const campaignId = await createTestCampaign(page, "Test Campaign");

// Cleanup test data
await deleteTestCampaign(page, campaignId);

// Clear auth storage (force fresh login)
clearAuthStorage();
```

## 🔐 Security Features

1. **Environment-Based**: Only works when `TEST_MODE="true"`
2. **Development Only**: Automatically disabled in production
3. **Separate Test User**: Uses dedicated test account
4. **Gitignored Storage**: Auth files never committed
5. **Optional Middleware**: Can bypass permissions for test user

## 🎭 Test Mode Middleware (Optional)

For advanced usage, you can grant test users superuser permissions in API routes:

```typescript
import { grantTestUserAccess } from "@/lib/test-mode";

export async function GET(request: NextRequest) {
  const session = await getServerSession(authOptions);

  // Test user gets automatic access
  if (grantTestUserAccess(session?.user?.email)) {
    return NextResponse.json({ data });
  }

  // Regular permission checks for other users
  if (!hasPermission(session)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  return NextResponse.json({ data });
}
```

## 🔄 Refreshing Authentication

If you need to refresh the authentication (e.g., after schema changes):

```bash
# Delete the stored auth
rm tests/.auth/user.json

# Re-run tests (global setup will recreate it)
bun run test
```

Or programmatically in a test:

```typescript
import { clearAuthStorage, authenticateAsTestUser } from "@/tests/helpers/auth";

test("refresh auth", async ({ page }) => {
  clearAuthStorage();
  await authenticateAsTestUser(page, true);
});
```

## 🐛 Troubleshooting

### Tests fail with "Not authenticated"

1. Check `.env` has `TEST_MODE="true"`
2. Verify test user exists: `bun run scripts/setup-test-user.ts`
3. Delete and recreate auth: `rm tests/.auth/user.json && bun run test`

### "TEST_MODE not enabled" error

Add to `.env`:

```bash
TEST_MODE="true"
```

### Auth storage not loading

Check `playwright.config.ts` has:

```typescript
projects: [
  {
    name: "chromium",
    use: {
      ...devices["Desktop Chrome"],
      storageState: "./tests/.auth/user.json",
    },
  },
];
```

### Test user doesn't have permissions

Use test mode middleware to grant superuser access:

```typescript
import { grantTestUserAccess } from "@/lib/test-mode";

if (grantTestUserAccess(session?.user?.email)) {
  // Allow access
}
```

## 📚 Examples

See `tests/e2e/test-auth-example.spec.ts` for comprehensive examples of:

- Basic authenticated tests
- Creating test data
- Accessing protected pages
- Using test mode utilities

## 🎯 Best Practices

1. **No Login Code**: Remove all login code from tests
2. **Direct Navigation**: Navigate directly to pages you want to test
3. **Test Data Cleanup**: Use helper functions to clean up test data
4. **Isolated Tests**: Each test should be independent
5. **Meaningful Names**: Use descriptive test names
6. **Test Mode Only**: Never enable in production

## 📊 Performance Benefits

- **Before**: ~3-5 seconds per test (login + test)
- **After**: ~0.5-2 seconds per test (no login)
- **Savings**: 60-80% faster test execution

## 🔗 Related Files

- `scripts/setup-test-user.ts` - Creates test user
- `lib/test-mode.ts` - Test mode utilities and middleware
- `tests/global-setup.ts` - Global test setup
- `playwright.config.ts` - Playwright configuration
- `.env` - Environment configuration

## 📖 Further Reading

- [Playwright Authentication Guide](https://playwright.dev/docs/auth)
- [Playwright Storage State](https://playwright.dev/docs/api/class-browsercontext#browser-context-storage-state)
- [Global Setup/Teardown](https://playwright.dev/docs/test-global-setup-teardown)
