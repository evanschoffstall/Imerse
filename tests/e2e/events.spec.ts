import { expect, test } from "@playwright/test";

test.describe("Event CRUD", () => {
  test.beforeEach(async ({ page }) => {
    // Login
    await page.goto("/login");
    await page.getByLabel("Email").fill("test@example.com");
    await page.getByLabel("Password").fill("password123");
    await page.getByRole("button", { name: "Sign In" }).click();
    await expect(page).toHaveURL("/dashboard");

    // Navigate to campaigns
    await page.goto("/campaigns");

    // Create or select a test campaign
    const testCampaignExists = await page
      .getByRole("link", { name: "Test Campaign" })
      .isVisible()
      .catch(() => false);

    if (!testCampaignExists) {
      await page.getByRole("button", { name: "Create New Campaign" }).click();
      await page.getByLabel("Name", { exact: true }).fill("Test Campaign");
      await page.getByLabel("Type").selectOption("Fantasy");
      await page.getByRole("button", { name: "Create Campaign" }).click();
      await expect(
        page.getByText("Campaign created successfully")
      ).toBeVisible();
    }

    // Click on the test campaign
    await page.getByRole("link", { name: "Test Campaign" }).click();
  });

  test("should create a new event", async ({ page }) => {
    // Navigate to events list
    const campaignId = page.url().split("/").pop();
    await page.goto(`/events?campaignId=${campaignId}`);

    // Click create new event
    await page.getByRole("button", { name: "Create New Event" }).click();

    // Fill form
    await page
      .getByLabel("Name", { exact: true })
      .fill("Battle of Five Armies");
    await page.getByLabel("Type").selectOption("Battle");
    await page.getByLabel("Date").fill("Year 2941, November 23");
    await page.getByLabel("Location").fill("Lonely Mountain");

    // Fill description
    const editor = page.locator(".ContentEditable__root");
    await editor.click();
    await editor.fill("A great battle between the forces of good and evil.");

    // Submit
    await page.getByRole("button", { name: "Create Event" }).click();

    // Verify redirect and success
    await expect(page).toHaveURL(/\/events\/[a-z0-9]+/);
    await expect(page.getByText("Event created successfully")).toBeVisible();
    await expect(
      page.getByRole("heading", { name: "Battle of Five Armies" })
    ).toBeVisible();
  });

  test("should display events in a list", async ({ page }) => {
    const campaignId = page.url().split("/").pop();
    await page.goto(`/events?campaignId=${campaignId}`);

    // Wait for list to load
    await expect(page.getByRole("heading", { name: "Events" })).toBeVisible();

    // Should have table headers
    await expect(page.getByText("Name")).toBeVisible();
    await expect(page.getByText("Type")).toBeVisible();
    await expect(page.getByText("Date")).toBeVisible();
    await expect(page.getByText("Location")).toBeVisible();
  });

  test("should view event details", async ({ page }) => {
    const campaignId = page.url().split("/").pop();
    await page.goto(`/events?campaignId=${campaignId}`);

    // Click on the first event
    await page.getByRole("link", { name: "Battle of Five Armies" }).click();

    // Verify details page
    await expect(
      page.getByRole("heading", { name: "Battle of Five Armies" })
    ).toBeVisible();
    await expect(page.getByText("Battle")).toBeVisible();
    await expect(page.getByText("Year 2941, November 23")).toBeVisible();
    await expect(page.getByText("Lonely Mountain")).toBeVisible();
  });

  test("should edit an event", async ({ page }) => {
    const campaignId = page.url().split("/").pop();
    await page.goto(`/events?campaignId=${campaignId}`);

    // Click on the first event
    await page.getByRole("link", { name: "Battle of Five Armies" }).click();

    // Click edit button
    await page.getByRole("button", { name: "Edit" }).click();

    // Update name and date
    await page.getByLabel("Name", { exact: true }).fill("Updated Event Name");
    await page.getByLabel("Date").fill("Year 2942, Spring");

    // Submit
    await page.getByRole("button", { name: "Update Event" }).click();

    // Verify update
    await expect(page.getByText("Event updated successfully")).toBeVisible();
    await expect(
      page.getByRole("heading", { name: "Updated Event Name" })
    ).toBeVisible();
    await expect(page.getByText("Year 2942, Spring")).toBeVisible();
  });

  test("should delete an event", async ({ page }) => {
    const campaignId = page.url().split("/").pop();
    await page.goto(`/events?campaignId=${campaignId}`);

    // Click on the first event
    await page.getByRole("link", { name: "Updated Event Name" }).click();

    // Click delete button
    page.on("dialog", (dialog) => dialog.accept());
    await page.getByRole("button", { name: "Delete" }).click();

    // Verify redirect
    await expect(page).toHaveURL(/\/events\?campaignId=/);
    await expect(page.getByText("Event deleted successfully")).toBeVisible();

    // Verify event is not in list
    await expect(
      page.getByRole("link", { name: "Updated Event Name" })
    ).not.toBeVisible();
  });

  test("should validate required fields", async ({ page }) => {
    const campaignId = page.url().split("/").pop();
    await page.goto(`/events/new?campaignId=${campaignId}`);

    // Submit empty form
    await page.getByRole("button", { name: "Create Event" }).click();

    // Should show validation errors
    await expect(page.getByText("Name is required")).toBeVisible();
  });

  test("should create event with all fields", async ({ page }) => {
    const campaignId = page.url().split("/").pop();
    await page.goto(`/events/new?campaignId=${campaignId}`);

    // Fill all fields
    await page.getByLabel("Name", { exact: true }).fill("Complete Event");
    await page.getByLabel("Type").selectOption("Ceremony");
    await page.getByLabel("Date").fill("Year 3000, Summer Solstice");
    await page.getByLabel("Location").fill("Grand Hall");
    await page.getByLabel("Image URL").fill("https://example.com/event.jpg");

    // Set private
    await page.getByLabel("Private").check();

    // Fill description
    const editor = page.locator(".ContentEditable__root");
    await editor.click();
    await editor.fill("An event with all properties filled.");

    // Submit
    await page.getByRole("button", { name: "Create Event" }).click();

    // Verify all fields
    await expect(page.getByText("Event created successfully")).toBeVisible();
    await expect(
      page.getByRole("heading", { name: "Complete Event" })
    ).toBeVisible();
    await expect(page.getByText("Ceremony")).toBeVisible();
    await expect(page.getByText("Year 3000, Summer Solstice")).toBeVisible();
    await expect(page.getByText("Grand Hall")).toBeVisible();
    await expect(page.getByText("Private")).toBeVisible();
  });

  test("should handle different event types", async ({ page }) => {
    const campaignId = page.url().split("/").pop();
    const types = ["Battle", "Celebration", "Festival", "Discovery"];

    for (const type of types) {
      await page.goto(`/events/new?campaignId=${campaignId}`);
      await page.getByLabel("Name", { exact: true }).fill(`${type} Test`);
      await page.getByLabel("Type").selectOption(type);
      await page.getByRole("button", { name: "Create Event" }).click();

      // Verify type
      await expect(page.getByText(type)).toBeVisible();
    }
  });

  test("should handle flexible date formats", async ({ page }) => {
    const campaignId = page.url().split("/").pop();
    const dates = [
      "Year 1450, Spring",
      "23rd of Mirthmoon",
      "Summer Solstice, Age of Heroes",
      "Day 42 of the War",
    ];

    for (const date of dates) {
      await page.goto(`/events/new?campaignId=${campaignId}`);
      await page.getByLabel("Name", { exact: true }).fill(`Event ${date}`);
      await page.getByLabel("Date").fill(date);
      await page.getByRole("button", { name: "Create Event" }).click();

      // Verify date appears
      await expect(page.getByText(date)).toBeVisible();
    }
  });

  test("should handle empty state", async ({ page }) => {
    // Create a new campaign to ensure empty state
    await page.goto("/campaigns");
    await page.getByRole("button", { name: "Create New Campaign" }).click();
    await page.getByLabel("Name", { exact: true }).fill("Empty Campaign");
    await page.getByLabel("Type").selectOption("Science Fiction");
    await page.getByRole("button", { name: "Create Campaign" }).click();

    const campaignId = page.url().split("/").pop();
    await page.goto(`/events?campaignId=${campaignId}`);

    // Should show empty state
    await expect(page.getByText("No events yet")).toBeVisible();
    await expect(
      page.getByRole("button", { name: "Create Event" })
    ).toBeVisible();
  });

  test("should toggle privacy setting", async ({ page }) => {
    const campaignId = page.url().split("/").pop();
    await page.goto(`/events/new?campaignId=${campaignId}`);

    // Create private event
    await page.getByLabel("Name", { exact: true }).fill("Secret Event");
    await page.getByLabel("Private").check();
    await page.getByRole("button", { name: "Create Event" }).click();

    // Verify private badge
    await expect(page.getByText("Private")).toBeVisible();

    // Edit to make public
    await page.getByRole("button", { name: "Edit" }).click();
    await page.getByLabel("Private").uncheck();
    await page.getByRole("button", { name: "Update Event" }).click();

    // Verify no private badge
    await expect(page.getByText("Private")).not.toBeVisible();
  });

  test("should cancel event creation", async ({ page }) => {
    const campaignId = page.url().split("/").pop();
    await page.goto(`/events/new?campaignId=${campaignId}`);

    // Fill some fields
    await page.getByLabel("Name", { exact: true }).fill("Cancelled Event");

    // Click cancel
    await page.getByRole("button", { name: "Cancel" }).click();

    // Should redirect to list
    await expect(page).toHaveURL(`/events?campaignId=${campaignId}`);

    // Event should not be created
    await expect(
      page.getByRole("link", { name: "Cancelled Event" })
    ).not.toBeVisible();
  });
});
