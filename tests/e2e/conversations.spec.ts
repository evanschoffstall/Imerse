import { expect, test } from "@playwright/test";

test.describe("Conversations", () => {
  test.beforeEach(async ({ page }) => {
    // Login and setup
    await page.goto("/login");
    await page.fill('[name="email"]', "test@example.com");
    await page.fill('[name="password"]', "password");
    await page.click('button[type="submit"]');
    await page.waitForURL("/dashboard");
  });

  test("should create a new conversation", async ({ page }) => {
    await page.goto("/conversations/create?campaignId=test-campaign-id");

    await page.fill('[name="name"]', "Test Conversation");
    await page.click("text=characters");
    await page.click("text=Create");

    await expect(page).toHaveURL(/\/conversations\/[a-z0-9-]+$/);
    await expect(page.locator("h1")).toContainText("Test Conversation");
  });

  test("should list conversations", async ({ page }) => {
    await page.goto("/conversations?campaignId=test-campaign-id");

    await expect(page.locator("h1")).toContainText("Conversations");
    await expect(page.locator("text=Create Conversation")).toBeVisible();
  });

  test("should display conversation details", async ({ page }) => {
    // Create conversation first
    await page.goto("/conversations/create?campaignId=test-campaign-id");
    await page.fill('[name="name"]', "Detail Test Conversation");
    await page.click("text=Create");

    await expect(page.locator("h1")).toContainText("Detail Test Conversation");
    await expect(page.locator("text=participants")).toBeVisible();
    await expect(page.locator("text=Edit")).toBeVisible();
  });

  test("should send message as user", async ({ page }) => {
    // Create conversation
    await page.goto("/conversations/create?campaignId=test-campaign-id");
    await page.fill('[name="name"]', "Message Test");
    await page.click("text=Create");

    // Send message
    await page.fill(
      'textarea[placeholder*="Type your message"]',
      "Hello from user!"
    );
    await page.click("text=Send Message");

    await expect(page.locator("text=Hello from user!")).toBeVisible();
  });

  test("should send message as character", async ({ page }) => {
    // Create conversation
    await page.goto("/conversations/create?campaignId=test-campaign-id");
    await page.fill('[name="name"]', "Character Message Test");
    await page.click("text=Create");

    // Switch to character mode
    await page.click("text=Character");
    await page.selectOption("select", { index: 1 }); // Select first character

    // Send message
    await page.fill(
      'textarea[placeholder*="Type your message"]',
      "Hello from character!"
    );
    await page.click("text=Send Message");

    await expect(page.locator("text=Hello from character!")).toBeVisible();
    await expect(page.locator("text=Character")).toBeVisible();
  });

  test("should update conversation", async ({ page }) => {
    // Create conversation
    await page.goto("/conversations/create?campaignId=test-campaign-id");
    await page.fill('[name="name"]', "Update Test");
    await page.click("text=Create");

    // Edit
    await page.click("text=Edit");
    await page.fill('[name="name"]', "Updated Conversation");
    await page.click("text=Update");

    await expect(page.locator("h1")).toContainText("Updated Conversation");
  });

  test("should toggle conversation closed state", async ({ page }) => {
    // Create conversation
    await page.goto("/conversations/create?campaignId=test-campaign-id");
    await page.fill('[name="name"]', "Close Test");
    await page.click("text=Create");

    // Close conversation
    await page.click("text=Close");
    await expect(page.locator("text=Closed")).toBeVisible();
    await expect(
      page.locator("text=This conversation is closed")
    ).toBeVisible();

    // Reopen
    await page.click("text=Reopen");
    await expect(page.locator("text=Closed")).not.toBeVisible();
  });

  test("should filter by conversation target", async ({ page }) => {
    // Create user conversation
    await page.goto("/conversations/create?campaignId=test-campaign-id");
    await page.fill('[name="name"]', "User Conversation");
    await page.click("text=users");
    await page.click("text=Create");
    await page.goto("/conversations?campaignId=test-campaign-id");

    await expect(page.locator("text=User Conversation")).toBeVisible();
    await expect(page.locator("text=users").first()).toBeVisible();
  });

  test("should display private badge", async ({ page }) => {
    await page.goto("/conversations/create?campaignId=test-campaign-id");
    await page.fill('[name="name"]', "Private Test");
    await page.check('[id="isPrivate"]');
    await page.click("text=Create");

    await expect(page.locator("text=Private")).toBeVisible();
  });

  test("should add participants", async ({ page }) => {
    await page.goto("/conversations/create?campaignId=test-campaign-id");
    await page.fill('[name="name"]', "Participants Test");

    // Select participants
    await page.check('[id^="participant-"]');
    await page.click("text=Create");

    await expect(page.locator("text=participants")).toBeVisible();
    await expect(page.locator("text=Participants:")).toBeVisible();
  });

  test("should delete conversation", async ({ page }) => {
    // Create conversation
    await page.goto("/conversations/create?campaignId=test-campaign-id");
    await page.fill('[name="name"]', "Delete Test");
    await page.click("text=Create");

    // Delete
    await page.click("text=Edit");
    await page.click("text=Delete Conversation");
    await page.click("text=Delete", { force: true }); // Confirm dialog

    await expect(page).toHaveURL(/\/conversations\?campaignId=/);
  });

  test("should group messages from same author", async ({ page }) => {
    // Create conversation
    await page.goto("/conversations/create?campaignId=test-campaign-id");
    await page.fill('[name="name"]', "Message Grouping Test");
    await page.click("text=Create");

    // Send multiple messages
    await page.fill("textarea", "First message");
    await page.click("text=Send Message");
    await page.waitForTimeout(100);

    await page.fill("textarea", "Second message");
    await page.click("text=Send Message");

    // Messages should be grouped (same avatar)
    const avatars = await page.locator(".w-10.h-10.rounded-full").count();
    expect(avatars).toBe(1); // Only one avatar for grouped messages
  });
});
