import { test, expect } from '@playwright/test';

test.describe('Theme Switching', () => {
  test('capture homepage in both themes', async ({ page }) => {
    // Navigate to homepage
    await page.goto('/');
    
    // Wait for page to fully load
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(1000);
    
    // Capture light mode
    await page.screenshot({ 
      path: 'test-results/homepage-light.png',
      fullPage: true 
    });
    
    console.log('✓ Light mode screenshot saved');
    
    // Manually add dark class to HTML element using JavaScript
    await page.evaluate(() => {
      document.documentElement.classList.add('dark');
    });
    
    // Wait for CSS transitions
    await page.waitForTimeout(500);
    
    // Capture dark mode
    await page.screenshot({ 
      path: 'test-results/homepage-dark.png',
      fullPage: true 
    });
    
    console.log('✓ Dark mode screenshot saved');
    
    // Verify dark class is applied
    const htmlClass = await page.locator('html').getAttribute('class');
    console.log(`HTML classes: ${htmlClass}`);
    expect(htmlClass).toContain('dark');
  });
});
