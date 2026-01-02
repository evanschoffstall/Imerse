# E2E Testing with Playwright

This directory contains end-to-end tests for the Imerse Next.js application using Playwright.

## Running Tests

### Run all tests
```bash
bun run test
# or
bunx playwright test
```

### Run tests in UI mode (recommended for development)
```bash
bun run test:ui
# or
bunx playwright test --ui
```

### Run tests in headed mode (see browser)
```bash
bun run test:headed
# or
bunx playwright test --headed
```

### Run tests in debug mode
```bash
bun run test:debug
# or
bunx playwright test --debug
```

### Run specific test file
```bash
bunx playwright test tests/e2e/auth.spec.ts
```

### Show test report
```bash
bun run test:report
# or
bunx playwright show-report
```

## Test Files

- **navigation.spec.ts** - Tests for basic navigation and homepage
- **auth.spec.ts** - Tests for authentication flow (login, register, protected routes)

## Writing Tests

### Basic Test Structure
```typescript
import { test, expect } from '@playwright/test';

test.describe('Feature Name', () => {
  test('should do something', async ({ page }) => {
    await page.goto('/some-page');
    await expect(page.locator('selector')).toBeVisible();
  });
});
```

### Common Patterns

#### Navigation
```typescript
await page.goto('/');
await page.click('text=Login');
await expect(page).toHaveURL('/login');
```

#### Form Interaction
```typescript
await page.fill('input[name="email"]', 'test@example.com');
await page.fill('input[name="password"]', 'password');
await page.click('button[type="submit"]');
```

#### Assertions
```typescript
await expect(page).toHaveTitle(/Expected Title/);
await expect(page).toHaveURL(/expected-url/);
await expect(page.locator('selector')).toBeVisible();
await expect(page.locator('selector')).toHaveText('Expected text');
```

## Test Database

For E2E tests, consider:
1. Using a separate test database
2. Seeding test data before tests
3. Cleaning up after tests
4. Using database transactions

## Debugging Tests

1. **Use UI Mode**: `bun run test:ui` - Best for development
2. **Use Debug Mode**: `bun run test:debug` - Step through tests
3. **Use Headed Mode**: `bun run test:headed` - See browser actions
4. **Add Screenshots**: Tests automatically screenshot on failure
5. **Use Traces**: Check `playwright-report/` for trace files

## CI/CD Integration

Tests are configured to run in CI with:
- Retries: 2 attempts on CI
- Single worker (no parallel execution on CI)
- HTML reporter for results

## Notes

- Some tests are marked with `test.skip` until features are implemented
- Tests assume development server is running (or use `webServer` config)
- Update tests as features are added during migration
