import { expect, test } from "@playwright/test";

test.describe("Notes", () => {
  test.beforeEach(async ({ page }) => {
    // Login
    await page.goto("/login");
    await page.fill('input[type="email"]', "test@example.com");
    await page.fill('input[type="password"]', "password123");
    await page.click('button[type="submit"]');
    await page.waitForURL("/dashboard");

    // Create or select a campaign
    await page.goto("/campaigns");
    const createButton = page.locator("text=Create New Campaign");
    if (await createButton.isVisible()) {
      await createButton.click();
      await page.fill('input[name="name"]', "Test Campaign for Notes");
      await page.click('button[type="submit"]');
      await page.waitForURL(/\/campaigns\//);
    }
  });

  test("should create a new note", async ({ page }) => {
    const campaignLink = page.locator('a[href*="/campaigns/"]').first();
    await campaignLink.click();

    await page.goto(`/notes?campaignId=${await page.url().split("/").pop()}`);
    await page.click("text=Create New Note");

    await page.fill('input[name="name"]', "Test Note");
    await page.selectOption('select[name="type"]', "Quick Note");
    await page.locator(".ContentEditable__root").fill("This is a test note");

    await page.click('button[type="submit"]');
    await page.waitForURL(/\/notes\//);

    await expect(page.locator("h1")).toContainText("Test Note");
    await expect(page.locator("text=Quick Note")).toBeVisible();
  });

  test("should display notes list", async ({ page }) => {
    const campaignLink = page.locator('a[href*="/campaigns/"]').first();
    const campaignUrl = await campaignLink.getAttribute("href");
    const campaignId = campaignUrl?.split("/").pop();

    await page.goto(`/notes?campaignId=${campaignId}`);
    await expect(page.locator("h1")).toContainText("Notes");
  });

  test("should edit a note", async ({ page }) => {
    // Create a note first
    const campaignLink = page.locator('a[href*="/campaigns/"]').first();
    const campaignUrl = await campaignLink.getAttribute("href");
    const campaignId = campaignUrl?.split("/").pop();

    await page.goto(`/notes/new?campaignId=${campaignId}`);
    await page.fill('input[name="name"]', "Note to Edit");
    await page.selectOption('select[name="type"]', "Plot Hook");
    await page.locator(".ContentEditable__root").fill("Original content");
    await page.click('button[type="submit"]');
    await page.waitForURL(/\/notes\//);

    // Edit the note
    await page.click("text=Edit");
    await page.fill('input[name="name"]', "Edited Note");
    await page.selectOption('select[name="type"]', "NPC Note");
    await page.click('button[type="submit"]');

    await expect(page.locator("h1")).toContainText("Edited Note");
    await expect(page.locator("text=NPC Note")).toBeVisible();
  });

  test("should delete a note", async ({ page }) => {
    // Create a note first
    const campaignLink = page.locator('a[href*="/campaigns/"]').first();
    const campaignUrl = await campaignLink.getAttribute("href");
    const campaignId = campaignUrl?.split("/").pop();

    await page.goto(`/notes/new?campaignId=${campaignId}`);
    await page.fill('input[name="name"]', "Note to Delete");
    await page
      .locator(".ContentEditable__root")
      .fill("This note will be deleted");
    await page.click('button[type="submit"]');
    await page.waitForURL(/\/notes\//);

    // Delete the note
    page.on("dialog", (dialog) => dialog.accept());
    await page.click("text=Delete");
    await page.waitForURL(/\/notes\?/);
  });

  test("should create a note with all types", async ({ page }) => {
    const campaignLink = page.locator('a[href*="/campaigns/"]').first();
    const campaignUrl = await campaignLink.getAttribute("href");
    const campaignId = campaignUrl?.split("/").pop();

    const types = [
      "Quick Note",
      "Plot Hook",
      "NPC Note",
      "Location Note",
      "Rules Note",
      "Lore",
      "Reminder",
      "Secret",
      "Clue",
      "Other",
    ];

    for (const type of types) {
      await page.goto(`/notes/new?campaignId=${campaignId}`);
      await page.fill('input[name="name"]', `${type} Note`);
      await page.selectOption('select[name="type"]', type);
      await page
        .locator(".ContentEditable__root")
        .fill(`This is a ${type} note`);
      await page.click('button[type="submit"]');
      await page.waitForURL(/\/notes\//);
      await expect(page.locator(`text=${type}`)).toBeVisible();
    }
  });

  test("should handle private notes", async ({ page }) => {
    const campaignLink = page.locator('a[href*="/campaigns/"]').first();
    const campaignUrl = await campaignLink.getAttribute("href");
    const campaignId = campaignUrl?.split("/").pop();

    await page.goto(`/notes/new?campaignId=${campaignId}`);
    await page.fill('input[name="name"]', "Private Note");
    await page.check('input[name="isPrivate"]');
    await page.locator(".ContentEditable__root").fill("This is private");
    await page.click('button[type="submit"]');
    await page.waitForURL(/\/notes\//);

    await expect(page.locator("text=Private")).toBeVisible();
  });

  test("should require name field", async ({ page }) => {
    const campaignLink = page.locator('a[href*="/campaigns/"]').first();
    const campaignUrl = await campaignLink.getAttribute("href");
    const campaignId = campaignUrl?.split("/").pop();

    await page.goto(`/notes/new?campaignId=${campaignId}`);
    await page.click('button[type="submit"]');

    await expect(page.locator("text=Name is required")).toBeVisible();
  });

  test("should display note details correctly", async ({ page }) => {
    const campaignLink = page.locator('a[href*="/campaigns/"]').first();
    const campaignUrl = await campaignLink.getAttribute("href");
    const campaignId = campaignUrl?.split("/").pop();

    await page.goto(`/notes/new?campaignId=${campaignId}`);
    await page.fill('input[name="name"]', "Detailed Note");
    await page.selectOption('select[name="type"]', "Lore");
    await page
      .locator(".ContentEditable__root")
      .fill("Detailed content about lore");
    await page.click('button[type="submit"]');
    await page.waitForURL(/\/notes\//);

    await expect(page.locator("h1")).toContainText("Detailed Note");
    await expect(page.locator("text=Lore")).toBeVisible();
    await expect(
      page.locator("text=Detailed content about lore")
    ).toBeVisible();
  });

  test("should handle image uploads", async ({ page }) => {
    const campaignLink = page.locator('a[href*="/campaigns/"]').first();
    const campaignUrl = await campaignLink.getAttribute("href");
    const campaignId = campaignUrl?.split("/").pop();

    await page.goto(`/notes/new?campaignId=${campaignId}`);
    await page.fill('input[name="name"]', "Note with Image");
    await page.fill('input[name="image"]', "https://example.com/note.jpg");
    await page.locator(".ContentEditable__root").fill("Note content");
    await page.click('button[type="submit"]');
    await page.waitForURL(/\/notes\//);

    const image = page.locator('img[alt="Note with Image"]');
    await expect(image).toBeVisible();
  });

  test("should navigate back to notes list", async ({ page }) => {
    const campaignLink = page.locator('a[href*="/campaigns/"]').first();
    const campaignUrl = await campaignLink.getAttribute("href");
    const campaignId = campaignUrl?.split("/").pop();

    await page.goto(`/notes/new?campaignId=${campaignId}`);
    await page.fill('input[name="name"]', "Navigation Test Note");
    await page.locator(".ContentEditable__root").fill("Test content");
    await page.click('button[type="submit"]');
    await page.waitForURL(/\/notes\//);

    await page.click("text=Back to Notes");
    await expect(page).toHaveURL(
      new RegExp(`/notes\\?campaignId=${campaignId}`)
    );
  });

  test("should show empty state when no notes exist", async ({ page }) => {
    const campaignLink = page.locator('a[href*="/campaigns/"]').first();
    const campaignUrl = await campaignLink.getAttribute("href");
    const campaignId = campaignUrl?.split("/").pop();

    await page.goto(`/notes?campaignId=${campaignId}`);

    // If there are no notes, should show empty state
    const emptyState = page.locator("text=No notes yet");
    if (await emptyState.isVisible()) {
      await expect(emptyState).toBeVisible();
      await expect(page.locator("text=Create your first note")).toBeVisible();
    }
  });

  test("should display updated timestamp", async ({ page }) => {
    const campaignLink = page.locator('a[href*="/campaigns/"]').first();
    const campaignUrl = await campaignLink.getAttribute("href");
    const campaignId = campaignUrl?.split("/").pop();

    await page.goto(`/notes/new?campaignId=${campaignId}`);
    await page.fill('input[name="name"]', "Timestamp Test Note");
    await page.locator(".ContentEditable__root").fill("Original content");
    await page.click('button[type="submit"]');
    await page.waitForURL(/\/notes\//);

    await expect(page.locator("text=Updated:")).toBeVisible();
    await expect(page.locator("text=Created:")).toBeVisible();
  });

  test("should cancel note creation", async ({ page }) => {
    const campaignLink = page.locator('a[href*="/campaigns/"]').first();
    const campaignUrl = await campaignLink.getAttribute("href");
    const campaignId = campaignUrl?.split("/").pop();

    await page.goto(`/notes/new?campaignId=${campaignId}`);
    await page.fill('input[name="name"]', "Cancelled Note");
    await page.click("text=Cancel");

    await expect(page).toHaveURL(
      new RegExp(`/notes\\?campaignId=${campaignId}`)
    );
  });
});
