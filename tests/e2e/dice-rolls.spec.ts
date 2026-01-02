import { expect, test } from "@playwright/test";

test.describe("Dice Rolls", () => {
  test.beforeEach(async ({ page }) => {
    // Login
    await page.goto("/login");
    await page.fill('input[name="email"]', "test@example.com");
    await page.fill('input[name="password"]', "password");
    await page.click('button[type="submit"]');
    await page.waitForURL("/dashboard");
  });

  test("should create a dice roll", async ({ page }) => {
    await page.goto("/dice-rolls?campaignId=test-campaign-id");
    await page.click("text=Create Dice Roll");

    await page.fill('input[name="name"]', "Attack Roll");
    await page.selectOption('select[name="system"]', "d20");
    await page.fill('input[name="parameters"]', "1d20+5");

    await page.click('button[type="submit"]');
    await page.waitForURL(/\/dice-rolls\/[^\/]+$/);

    await expect(page.locator("h1")).toContainText("Attack Roll");
    await expect(page.locator("text=1d20+5")).toBeVisible();
  });

  test("should list dice rolls", async ({ page }) => {
    await page.goto("/dice-rolls?campaignId=test-campaign-id");
    await expect(page.locator("h1")).toContainText("Dice Rolls");
  });

  test("should view dice roll details", async ({ page }) => {
    // First create a dice roll
    await page.goto("/dice-rolls?campaignId=test-campaign-id");
    await page.click("text=Create Dice Roll");
    await page.fill('input[name="name"]', "Damage Roll");
    await page.fill('input[name="parameters"]', "2d6+3");
    await page.click('button[type="submit"]');
    await page.waitForURL(/\/dice-rolls\/[^\/]+$/);

    // Verify details page
    await expect(page.locator("h1")).toContainText("Damage Roll");
    await expect(page.locator("text=2d6+3")).toBeVisible();
    await expect(page.locator("text=Roll History")).toBeVisible();
  });

  test("should edit a dice roll", async ({ page }) => {
    // First create a dice roll
    await page.goto("/dice-rolls?campaignId=test-campaign-id");
    await page.click("text=Create Dice Roll");
    await page.fill('input[name="name"]', "Original Name");
    await page.fill('input[name="parameters"]', "1d20");
    await page.click('button[type="submit"]');
    await page.waitForURL(/\/dice-rolls\/[^\/]+$/);

    // Edit it
    await page.click("text=Edit");
    await page.fill('input[name="name"]', "Updated Name");
    await page.fill('input[name="parameters"]', "1d20+7");
    await page.click('button[type="submit"]');
    await page.waitForURL(/\/dice-rolls\/[^\/]+$/);

    await expect(page.locator("h1")).toContainText("Updated Name");
    await expect(page.locator("text=1d20+7")).toBeVisible();
  });

  test("should delete a dice roll", async ({ page }) => {
    // First create a dice roll
    await page.goto("/dice-rolls?campaignId=test-campaign-id");
    await page.click("text=Create Dice Roll");
    await page.fill('input[name="name"]', "To Delete");
    await page.fill('input[name="parameters"]', "1d6");
    await page.click('button[type="submit"]');
    await page.waitForURL(/\/dice-rolls\/[^\/]+$/);

    // Delete it
    await page.click("text=Edit");

    page.on("dialog", (dialog) => dialog.accept());
    await page.click('button:has-text("Delete")');

    await page.waitForURL(/\/dice-rolls\?campaignId=/);
  });

  test("should execute a roll", async ({ page }) => {
    // Create a dice roll
    await page.goto("/dice-rolls?campaignId=test-campaign-id");
    await page.click("text=Create Dice Roll");
    await page.fill('input[name="name"]', "Test Roll");
    await page.fill('input[name="parameters"]', "1d20");
    await page.click('button[type="submit"]');
    await page.waitForURL(/\/dice-rolls\/[^\/]+$/);

    // Execute the roll
    await page.click('button:has-text("Roll")');

    // Wait for result to appear
    await page.waitForTimeout(1000);

    // Check that roll history updated
    await expect(page.locator("text=Roll History")).toBeVisible();
  });

  test("should link dice roll to character", async ({ page }) => {
    // This assumes characters exist in the campaign
    await page.goto("/dice-rolls?campaignId=test-campaign-id");
    await page.click("text=Create Dice Roll");

    await page.fill('input[name="name"]', "Character Roll");
    await page.fill('input[name="parameters"]', "1d20+{character.strength}");

    // Select first character if available
    const characterSelect = page.locator('select[name="characterId"]');
    if (await characterSelect.isVisible()) {
      const options = await characterSelect.locator("option").all();
      if (options.length > 1) {
        await characterSelect.selectOption({ index: 1 });
      }
    }

    await page.click('button[type="submit"]');
    await page.waitForURL(/\/dice-rolls\/[^\/]+$/);

    await expect(page.locator("text=Character Roll")).toBeVisible();
  });

  test("should mark dice roll as private", async ({ page }) => {
    await page.goto("/dice-rolls?campaignId=test-campaign-id");
    await page.click("text=Create Dice Roll");
    await page.fill('input[name="name"]', "Private Roll");
    await page.fill('input[name="parameters"]', "1d100");
    await page.check('input[name="isPrivate"]');
    await page.click('button[type="submit"]');
    await page.waitForURL(/\/dice-rolls\/[^\/]+$/);

    await expect(page.locator("text=Private")).toBeVisible();
  });

  test("should validate dice expression", async ({ page }) => {
    await page.goto("/dice-rolls?campaignId=test-campaign-id");
    await page.click("text=Create Dice Roll");

    await page.fill('input[name="name"]', "Test");
    await page.fill('input[name="parameters"]', "invalid");

    // Check for validation error
    await expect(page.locator("text=Invalid")).toBeVisible();
  });

  test("should support complex dice expressions", async ({ page }) => {
    await page.goto("/dice-rolls?campaignId=test-campaign-id");
    await page.click("text=Create Dice Roll");

    await page.fill('input[name="name"]', "Complex Roll");
    await page.fill('input[name="parameters"]', "3d6+2d4-1");

    await page.click('button[type="submit"]');
    await page.waitForURL(/\/dice-rolls\/[^\/]+$/);

    await expect(page.locator("text=3d6+2d4-1")).toBeVisible();
  });

  test("should show roll breakdown in results", async ({ page }) => {
    // Create and execute a roll
    await page.goto("/dice-rolls?campaignId=test-campaign-id");
    await page.click("text=Create Dice Roll");
    await page.fill('input[name="name"]', "Breakdown Test");
    await page.fill('input[name="parameters"]', "2d6");
    await page.click('button[type="submit"]');
    await page.waitForURL(/\/dice-rolls\/[^\/]+$/);

    // Execute roll
    await page.click('button:has-text("Roll")');
    await page.waitForTimeout(1000);

    // Check for roll breakdown
    await expect(page.locator("text=d6:")).toBeVisible();
  });
});
