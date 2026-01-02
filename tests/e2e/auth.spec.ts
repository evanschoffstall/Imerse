import { expect, test } from '@playwright/test';

test.describe('Authentication Flow', () => {
  test.describe('Registration', () => {
    test('should show registration form', async ({ page }) => {
      await page.goto('/register');
      
      // Check for form fields
      await expect(page.locator('input[name="name"]')).toBeVisible();
      await expect(page.locator('input[name="email"]')).toBeVisible();
      await expect(page.locator('input[name="password"]')).toBeVisible();
      await expect(page.locator('button[type="submit"]')).toBeVisible();
    });

    test('should show validation errors for empty form', async ({ page }) => {
      await page.goto('/register');
      
      // Submit empty form
      await page.click('button[type="submit"]');
      
      // Should show validation errors
      const errors = page.locator('text=/required|must be/i');
      await expect(errors.first()).toBeVisible();
    });

    test.skip('should register new user successfully', async ({ page }) => {
      // Generate unique email
      const timestamp = Date.now();
      const email = `test${timestamp}@example.com`;
      
      await page.goto('/register');
      
      // Fill form
      await page.fill('input[name="name"]', 'Test User');
      await page.fill('input[name="email"]', email);
      await page.fill('input[name="password"]', 'password123');
      
      // Submit
      await page.click('button[type="submit"]');
      
      // Should redirect to dashboard or campaigns
      await expect(page).toHaveURL(/\/(dashboard|campaigns)/);
    });
  });

  test.describe('Login', () => {
    test('should show login form', async ({ page }) => {
      await page.goto('/login');
      
      // Check for form fields
      await expect(page.locator('input[name="email"]')).toBeVisible();
      await expect(page.locator('input[name="password"]')).toBeVisible();
      await expect(page.locator('button[type="submit"]')).toBeVisible();
    });

    test('should show error for invalid credentials', async ({ page }) => {
      await page.goto('/login');
      
      // Fill with invalid credentials
      await page.fill('input[name="email"]', 'invalid@example.com');
      await page.fill('input[name="password"]', 'wrongpassword');
      
      // Submit
      await page.click('button[type="submit"]');
      
      // Should show error message
      const error = page.locator('text=/invalid|error|failed/i');
      await expect(error.first()).toBeVisible({ timeout: 5000 });
    });

    test.skip('should login successfully with valid credentials', async ({ page }) => {
      await page.goto('/login');
      
      // Fill with valid credentials (assumes test user exists)
      await page.fill('input[name="email"]', 'test@example.com');
      await page.fill('input[name="password"]', 'password123');
      
      // Submit
      await page.click('button[type="submit"]');
      
      // Should redirect to dashboard
      await expect(page).toHaveURL(/\/(dashboard|campaigns)/);
      
      // Should show user menu or profile
      await expect(page.locator('text=/logout|profile|settings/i')).toBeVisible();
    });
  });

  test.describe('Protected Routes', () => {
    test('should redirect to login when accessing protected route', async ({ page }) => {
      await page.goto('/campaigns');
      
      // Should redirect to login
      await expect(page).toHaveURL(/.*login/);
    });

    test('should redirect to login when accessing dashboard', async ({ page }) => {
      await page.goto('/dashboard');
      
      // Should redirect to login
      await expect(page).toHaveURL(/.*login/);
    });
  });
});
