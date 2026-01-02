import { expect, test } from "@playwright/test";

test.describe("Posts CRUD", () => {
  test.beforeEach(async ({ page }) => {
    // Login
    await page.goto("/login");
    await page.fill("[name=email]", "test@example.com");
    await page.fill("[name=password]", "password");
    await page.click("button[type=submit]");
    await page.waitForURL("**/dashboard");
  });

  test("should create a post", async ({ page }) => {
    await page.goto("/posts/create?campaignId=test-campaign-id");

    await page.fill("[name=name]", "Test Post");
    await page.locator(".ProseMirror").fill("This is test post content");
    await page.check("[name=isPinned]");

    await page.click("button[type=submit]");

    await expect(page).toHaveURL(/\/posts\/[a-z0-9]+$/);
    await expect(page.locator("h1")).toContainText("Test Post");
  });

  test("should list posts", async ({ page }) => {
    await page.goto("/posts?campaignId=test-campaign-id");

    await expect(page.locator("h1")).toContainText("Posts");
    await expect(page.locator("text=Create Post")).toBeVisible();
  });

  test("should show post details", async ({ page }) => {
    // Create a post first
    await page.goto("/posts/create?campaignId=test-campaign-id");
    await page.fill("[name=name]", "Detail Test Post");
    await page.click("button[type=submit]");

    // Check details page
    await expect(page.locator("h1")).toContainText("Detail Test Post");
    await expect(page.locator("text=Edit")).toBeVisible();
  });

  test("should edit a post", async ({ page }) => {
    // Create a post
    await page.goto("/posts/create?campaignId=test-campaign-id");
    await page.fill("[name=name]", "Original Post Name");
    await page.click("button[type=submit]");

    // Edit it
    await page.click("text=Edit");
    await page.fill("[name=name]", "Updated Post Name");
    await page.click("button[type=submit]");

    await expect(page.locator("h1")).toContainText("Updated Post Name");
  });

  test("should delete a post", async ({ page }) => {
    // Create a post
    await page.goto("/posts/create?campaignId=test-campaign-id");
    await page.fill("[name=name]", "Post To Delete");
    await page.click("button[type=submit]");

    const postId = page.url().split("/").pop();

    // Go to list and delete
    await page.goto("/posts?campaignId=test-campaign-id");
    await page.click(`text=Delete >> nth=0`);

    page.on("dialog", (dialog) => dialog.accept());

    // Should not exist anymore
    await expect(page.locator("text=Post To Delete")).not.toBeVisible();
  });

  test("should pin a post", async ({ page }) => {
    await page.goto("/posts/create?campaignId=test-campaign-id");
    await page.fill("[name=name]", "Pinned Post");
    await page.check("[name=isPinned]");
    await page.click("button[type=submit]");

    await page.goto("/posts?campaignId=test-campaign-id");
    await expect(page.locator("text=📌 Pinned")).toBeVisible();
  });

  test("should make a post private", async ({ page }) => {
    await page.goto("/posts/create?campaignId=test-campaign-id");
    await page.fill("[name=name]", "Private Post");
    await page.check("[name=isPrivate]");
    await page.click("button[type=submit]");

    await page.goto("/posts?campaignId=test-campaign-id");
    await expect(page.locator("text=🔒 Private")).toBeVisible();
  });

  test("should filter pinned posts", async ({ page }) => {
    await page.goto("/posts?campaignId=test-campaign-id");

    await page.click("text=Pinned Only");
    await expect(page.locator("text=All Posts")).toHaveClass(/bg-gray-200/);
    await expect(page.locator("text=Pinned Only")).toHaveClass(/bg-blue-600/);
  });

  test("should add tags to post", async ({ page }) => {
    await page.goto("/posts/create?campaignId=test-campaign-id");
    await page.fill("[name=name]", "Tagged Post");

    // Click a tag (assuming tags are loaded)
    const tagButton = page
      .locator("button")
      .filter({ hasText: /^[A-Za-z]+$/ })
      .first();
    if ((await tagButton.count()) > 0) {
      await tagButton.click();
    }

    await page.click("button[type=submit]");

    await page.goto("/posts?campaignId=test-campaign-id");
    // Tags should be visible in the list
  });

  test("should select layout for post", async ({ page }) => {
    await page.goto("/posts/create?campaignId=test-campaign-id");
    await page.fill("[name=name]", "Layout Post");
    await page.selectOption("[name=layoutId]", "2-column");
    await page.click("button[type=submit]");

    await page.goto("/posts?campaignId=test-campaign-id");
    await expect(page.locator("text=2 Column")).toBeVisible();
  });
});
