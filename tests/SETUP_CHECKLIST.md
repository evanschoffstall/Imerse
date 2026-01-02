# Test Authentication System - Setup Checklist

Use this checklist to set up and verify the test authentication system.

## ✅ Initial Setup

### 1. Environment Configuration

- [ ] Open `.env` file
- [ ] Add or verify these lines:
  ```bash
  TEST_MODE="true"
  TEST_USER_EMAIL="test@imerse.dev"
  TEST_USER_PASSWORD="TestPassword123!"
  TEST_USER_NAME="Test Superuser"
  ```
- [ ] Save the file

**⚠️ WARNING**: NEVER enable TEST_MODE in production!

### 2. Create Test User

- [ ] Open terminal
- [ ] Run: `bun run setup:test-user`
- [ ] Verify output shows:
  - ✅ Test user ready!
  - User ID, Email, Name displayed
  - ✅ Test user verified successfully
  - 🎉 Test user setup complete!

### 3. Verify Test Setup

- [ ] Run: `bun run test:safe`
- [ ] Watch for:
  - Step 1/3: Checking test mode... ✅
  - Step 2/3: Ensuring test user exists... ✅
  - Step 3/3: Running tests... ✅
- [ ] Verify `tests/.auth/user.json` was created
- [ ] Check that tests run without login prompts

### 4. Verify .gitignore

- [ ] Open `.gitignore`
- [ ] Verify it contains: `/tests/.auth/`
- [ ] This prevents committing credentials

---

## 🔍 Testing the System

### Run a Single Test

- [ ] Run: `bunx playwright test tests/e2e/test-auth-example.spec.ts`
- [ ] Verify all tests pass
- [ ] Check no login screens appear

### Run All Tests

- [ ] Run: `bun run test`
- [ ] Verify tests run quickly (no 3-5 second login delay)
- [ ] Check test output for failures

### Test with UI

- [ ] Run: `bun run test:ui`
- [ ] Playwright UI opens
- [ ] Run any test
- [ ] Watch it skip login and go straight to testing

---

## 📝 Migrating Existing Tests

For each test file with login code:

### Example Test Migration

**File**: `tests/e2e/campaigns.spec.ts`

**Before**:

```typescript
test("create campaign", async ({ page }) => {
  await page.goto("/login");
  await page.fill('input[name="email"]', "user@example.com");
  await page.fill('input[name="password"]', "password");
  await page.click('button[type="submit"]');

  await page.goto("/campaigns/create");
  // ... rest of test
});
```

**After**:

```typescript
test("create campaign", async ({ page }) => {
  await page.goto("/campaigns/create");
  // ... rest of test
});
```

### Migration Steps Per Test File

- [ ] Open test file
- [ ] Find login code (usually in `beforeEach` or at start of test)
- [ ] Delete all login-related code:
  - [ ] `await page.goto('/login')`
  - [ ] `await page.fill('input[name="email"]', ...)`
  - [ ] `await page.fill('input[name="password"]', ...)`
  - [ ] `await page.click('button[type="submit"]')`
  - [ ] Any wait for redirect after login
- [ ] Save file
- [ ] Run the test to verify it still works
- [ ] Move to next test file

### Files to Migrate

Check each file in `tests/e2e/`:

- [ ] `auth.spec.ts` - Keep as-is (tests auth itself)
- [ ] `campaigns.spec.ts`
- [ ] `characters.spec.ts`
- [ ] `locations.spec.ts`
- [ ] `items.spec.ts`
- [ ] `quests.spec.ts`
- [ ] `events.spec.ts`
- [ ] `notes.spec.ts`
- [ ] `maps.spec.ts`
- [ ] `navigation.spec.ts`
- [ ] `organisations.spec.ts`
- [ ] `tags.spec.ts`
- [ ] `theme.spec.ts`
- [ ] `timelines.spec.ts`
- [ ] `map-enhancements.spec.ts`
- [ ] `abilities.spec.ts`
- [ ] `creatures.spec.ts`
- [ ] `dice-rolls.spec.ts`
- [ ] `conversations.spec.ts`
- [ ] `posts.spec.ts`
- [ ] (any other test files)

---

## 🔧 Optional Enhancements

### Add Superuser Permissions to API Routes

For any API route that needs test user to bypass permissions:

- [ ] Open API route file (e.g., `app/api/campaigns/route.ts`)
- [ ] Import: `import { grantTestUserAccess } from '@/lib/test-mode';`
- [ ] Add at start of handler:
  ```typescript
  if (grantTestUserAccess(session?.user?.email)) {
    // Bypass permission checks
  }
  ```
- [ ] Test the route works with test user

### Routes to Consider

Common routes that may need superuser access:

- [ ] `app/api/campaigns/route.ts`
- [ ] `app/api/campaigns/[id]/route.ts`
- [ ] `app/api/characters/route.ts`
- [ ] `app/api/locations/route.ts`
- [ ] (Add more as needed)

---

## 🐛 Troubleshooting Checklist

### If tests fail with "Not authenticated"

- [ ] Check `.env` has `TEST_MODE="true"`
- [ ] Run: `bun run setup:test-user`
- [ ] Delete: `rm tests/.auth/user.json`
- [ ] Re-run: `bun run test`

### If tests fail with "Permission denied"

- [ ] Add `grantTestUserAccess()` to the failing API route
- [ ] Verify TEST_MODE is enabled
- [ ] Check the test user email matches in `.env`

### If auth storage not found

- [ ] Run: `bun run test` (global setup creates it)
- [ ] Check `playwright.config.ts` has `globalSetup` configured
- [ ] Verify `tests/.auth/` is not in `.gitignore` (it should be!)

### If TEST_MODE not enabled error

- [ ] Open `.env`
- [ ] Add: `TEST_MODE="true"`
- [ ] Save and try again

---

## 📊 Performance Verification

Before and after migration, measure test performance:

### Before Migration

- [ ] Run: `bun run test`
- [ ] Note total time: **\_\_\_** seconds
- [ ] Note time per test: **\_\_\_** seconds average

### After Migration

- [ ] Run: `bun run test`
- [ ] Note total time: **\_\_\_** seconds
- [ ] Note time per test: **\_\_\_** seconds average
- [ ] Calculate improvement: **\_\_\_** % faster

Expected improvement: 60-80% faster

---

## ✅ Final Verification

Once everything is set up:

- [ ] All tests pass: `bun run test`
- [ ] Tests run quickly (no login delays)
- [ ] No login code in test files (except auth.spec.ts)
- [ ] `tests/.auth/user.json` exists
- [ ] `tests/.auth/` is in `.gitignore`
- [ ] Documentation is up to date
- [ ] Team members know how to use the system

---

## 📚 Reference Documentation

- **Quick Start**: `tests/QUICK_START.md`
- **Full Guide**: `tests/helpers/README.md`
- **Implementation Summary**: `tests/IMPLEMENTATION_SUMMARY.md`
- **Example Tests**: `tests/e2e/test-auth-example.spec.ts`

---

## 🎉 Success Criteria

You'll know the system is working when:

1. ✅ Tests run without showing login screens
2. ✅ Tests are 60-80% faster than before
3. ✅ No login code needed in test files
4. ✅ All tests pass consistently
5. ✅ New tests are easier to write
6. ✅ Team members can run tests without issues

---

## 📞 Need Help?

If you encounter issues:

1. Check the troubleshooting section above
2. Review `tests/helpers/README.md`
3. Look at examples in `tests/e2e/test-auth-example.spec.ts`
4. Check environment variables in `.env`
5. Verify test user exists: `bun run setup:test-user`

---

**Last Updated**: January 1, 2026
