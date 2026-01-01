import { expect, test } from '@playwright/test';

test.describe('Homepage', () => {
  test('should load the homepage', async ({ page }) => {
    await page.goto('/');
    
    // Check that the page loaded
    await expect(page).toHaveTitle(/Imerse/i);
  });

  test('should have navigation links', async ({ page }) => {
    await page.goto('/');
    
    // Check for common navigation elements
    const header = page.locator('header');
    await expect(header).toBeVisible();
  });
});

test.describe('Authentication', () => {
  test('should navigate to login page', async ({ page }) => {
    await page.goto('/');
    
    // Click login link/button
    await page.click('text=/login|sign in/i');
    
    // Should be on login page
    await expect(page).toHaveURL(/.*login/);
  });

  test('should navigate to register page', async ({ page }) => {
    await page.goto('/');
    
    // Click register link/button
    await page.click('text=/register|sign up/i');
    
    // Should be on register page
    await expect(page).toHaveURL(/.*register/);
  });
});
