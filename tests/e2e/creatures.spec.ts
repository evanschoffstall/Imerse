import { expect, test } from "@playwright/test";

test.describe("Creatures", () => {
  test.beforeEach(async ({ page }) => {
    // Login
    await page.goto("/login");
    await page.fill('input[name="email"]', "test@example.com");
    await page.fill('input[name="password"]', "password");
    await page.click('button[type="submit"]');
    await page.waitForURL("/dashboard");
  });

  test("should create a creature", async ({ page }) => {
    await page.goto("/creatures?campaignId=test-campaign-id");
    await page.click("text=Create Creature");

    await page.fill('input[name="name"]', "Test Dragon");
    await page.selectOption('select[name="type"]', "Dragon");
    await page.fill('textarea[name="entry"]', "A mighty dragon");

    await page.click('button[type="submit"]');
    await page.waitForURL(/\/creatures\/[^\/]+$/);

    await expect(page.locator("h1")).toContainText("Test Dragon");
    await expect(page.locator("text=Dragon")).toBeVisible();
  });

  test("should list creatures", async ({ page }) => {
    await page.goto("/creatures?campaignId=test-campaign-id");
    await expect(page.locator("h1")).toContainText("Creatures");
  });

  test("should view creature details", async ({ page }) => {
    // First create a creature
    await page.goto("/creatures?campaignId=test-campaign-id");
    await page.click("text=Create Creature");
    await page.fill('input[name="name"]', "Test Beast");
    await page.selectOption('select[name="type"]', "Beast");
    await page.click('button[type="submit"]');
    await page.waitForURL(/\/creatures\/[^\/]+$/);

    // Verify details page
    await expect(page.locator("h1")).toContainText("Test Beast");
    await expect(page.locator("text=Beast")).toBeVisible();
    await expect(page.locator("text=Created by")).toBeVisible();
  });

  test("should edit a creature", async ({ page }) => {
    // First create a creature
    await page.goto("/creatures?campaignId=test-campaign-id");
    await page.click("text=Create Creature");
    await page.fill('input[name="name"]', "Original Name");
    await page.selectOption('select[name="type"]', "Humanoid");
    await page.click('button[type="submit"]');
    await page.waitForURL(/\/creatures\/[^\/]+$/);

    // Edit it
    await page.click("text=Edit");
    await page.fill('input[name="name"]', "Updated Name");
    await page.click('button[type="submit"]');
    await page.waitForURL(/\/creatures\/[^\/]+$/);

    await expect(page.locator("h1")).toContainText("Updated Name");
  });

  test("should delete a creature", async ({ page }) => {
    // First create a creature
    await page.goto("/creatures?campaignId=test-campaign-id");
    await page.click("text=Create Creature");
    await page.fill('input[name="name"]', "To Delete");
    await page.selectOption('select[name="type"]', "Beast");
    await page.click('button[type="submit"]');
    await page.waitForURL(/\/creatures\/[^\/]+$/);

    // Delete it
    await page.click("text=Edit");

    page.on("dialog", (dialog) => dialog.accept());
    await page.click('button:has-text("Delete")');

    await page.waitForURL(/\/creatures\?campaignId=/);
  });

  test("should create hierarchical creatures (parent/child)", async ({
    page,
  }) => {
    // Create parent creature
    await page.goto("/creatures?campaignId=test-campaign-id");
    await page.click("text=Create Creature");
    await page.fill('input[name="name"]', "Parent Dragon");
    await page.selectOption('select[name="type"]', "Dragon");
    await page.click('button[type="submit"]');
    await page.waitForURL(/\/creatures\/[^\/]+$/);
    const parentUrl = page.url();
    const parentId = parentUrl.split("/").pop();

    // Create child creature
    await page.goto("/creatures?campaignId=test-campaign-id");
    await page.click("text=Create Creature");
    await page.fill('input[name="name"]', "Child Dragon");
    await page.selectOption('select[name="type"]', "Dragon");
    await page.selectOption('select[name="parentId"]', parentId!);
    await page.click('button[type="submit"]');
    await page.waitForURL(/\/creatures\/[^\/]+$/);

    // Verify child shows parent
    await expect(page.locator("text=Parent Species")).toBeVisible();
    await expect(page.locator('a:has-text("Parent Dragon")')).toBeVisible();

    // Go to parent and verify it shows child
    await page.goto(parentUrl);
    await expect(page.locator("text=Sub-species")).toBeVisible();
    await expect(page.locator('a:has-text("Child Dragon")')).toBeVisible();
  });

  test("should filter creatures by type", async ({ page }) => {
    // Create creatures of different types
    await page.goto("/creatures?campaignId=test-campaign-id");

    await page.click("text=Create Creature");
    await page.fill('input[name="name"]', "Test Dragon");
    await page.selectOption('select[name="type"]', "Dragon");
    await page.click('button[type="submit"]');
    await page.waitForURL(/\/creatures\/[^\/]+$/);

    await page.goto("/creatures?campaignId=test-campaign-id");
    await page.click("text=Create Creature");
    await page.fill('input[name="name"]', "Test Beast");
    await page.selectOption('select[name="type"]', "Beast");
    await page.click('button[type="submit"]');
    await page.waitForURL(/\/creatures\/[^\/]+$/);

    // Go back to list and verify both are visible
    await page.goto("/creatures?campaignId=test-campaign-id");
    await expect(page.locator("text=Test Dragon")).toBeVisible();
    await expect(page.locator("text=Test Beast")).toBeVisible();
  });

  test("should mark creature as extinct", async ({ page }) => {
    await page.goto("/creatures?campaignId=test-campaign-id");
    await page.click("text=Create Creature");
    await page.fill('input[name="name"]', "Extinct Species");
    await page.selectOption('select[name="type"]', "Beast");
    await page.check('input[name="isExtinct"]');
    await page.click('button[type="submit"]');
    await page.waitForURL(/\/creatures\/[^\/]+$/);

    await expect(page.locator("text=Extinct")).toBeVisible();
    await expect(page.locator("text=Status:")).toBeVisible();
  });

  test("should mark creature as dead", async ({ page }) => {
    await page.goto("/creatures?campaignId=test-campaign-id");
    await page.click("text=Create Creature");
    await page.fill('input[name="name"]', "Dead Creature");
    await page.selectOption('select[name="type"]', "Humanoid");
    await page.check('input[name="isDead"]');
    await page.click('button[type="submit"]');
    await page.waitForURL(/\/creatures\/[^\/]+$/);

    await expect(page.locator("text=Dead")).toBeVisible();
    await expect(page.locator("text=Status:")).toBeVisible();
  });

  test("should mark creature as private", async ({ page }) => {
    await page.goto("/creatures?campaignId=test-campaign-id");
    await page.click("text=Create Creature");
    await page.fill('input[name="name"]', "Private Creature");
    await page.selectOption('select[name="type"]', "Aberration");
    await page.check('input[name="isPrivate"]');
    await page.click('button[type="submit"]');
    await page.waitForURL(/\/creatures\/[^\/]+$/);

    await expect(page.locator("text=Private")).toBeVisible();
  });
});
