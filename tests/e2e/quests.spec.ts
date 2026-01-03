import { expect, test } from "@playwright/test";

test.describe("Quest CRUD", () => {
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

  test("should create a new quest", async ({ page }) => {
    // Navigate to quests list
    const campaignId = page.url().split("/").pop();
    await page.goto(`/quests?campaignId=${campaignId}`);

    // Click create new quest
    await page.getByRole("button", { name: "Create New Quest" }).click();

    // Fill form
    await page
      .getByLabel("Name", { exact: true })
      .fill("Retrieve the Ancient Artifact");
    await page.getByLabel("Type").selectOption("Main Quest");
    await page.getByLabel("Status").selectOption("active");

    // Fill description
    const editor = page.locator(".ContentEditable__root");
    await editor.click();
    await editor.fill(
      "A legendary artifact has been stolen and must be retrieved."
    );

    // Submit
    await page.getByRole("button", { name: "Create Quest" }).click();

    // Verify redirect and success
    await expect(page).toHaveURL(/\/quests\/[a-z0-9]+/);
    await expect(page.getByText("Quest created successfully")).toBeVisible();
    await expect(
      page.getByRole("heading", { name: "Retrieve the Ancient Artifact" })
    ).toBeVisible();
  });

  test("should display quests in a list", async ({ page }) => {
    const campaignId = page.url().split("/").pop();
    await page.goto(`/quests?campaignId=${campaignId}`);

    // Wait for list to load
    await expect(page.getByRole("heading", { name: "Quests" })).toBeVisible();

    // Should have table headers
    await expect(page.getByText("Name")).toBeVisible();
    await expect(page.getByText("Type")).toBeVisible();
    await expect(page.getByText("Status")).toBeVisible();
  });

  test("should view quest details", async ({ page }) => {
    const campaignId = page.url().split("/").pop();
    await page.goto(`/quests?campaignId=${campaignId}`);

    // Click on the first quest
    await page
      .getByRole("link", { name: "Retrieve the Ancient Artifact" })
      .click();

    // Verify details page
    await expect(
      page.getByRole("heading", { name: "Retrieve the Ancient Artifact" })
    ).toBeVisible();
    await expect(page.getByText("Main Quest")).toBeVisible();
    await expect(page.getByText("Active")).toBeVisible();
    await expect(
      page.getByText(
        "A legendary artifact has been stolen and must be retrieved."
      )
    ).toBeVisible();
  });

  test("should edit a quest", async ({ page }) => {
    const campaignId = page.url().split("/").pop();
    await page.goto(`/quests?campaignId=${campaignId}`);

    // Click on the first quest
    await page
      .getByRole("link", { name: "Retrieve the Ancient Artifact" })
      .click();

    // Click edit button
    await page.getByRole("button", { name: "Edit" }).click();

    // Update name and status
    await page.getByLabel("Name", { exact: true }).fill("Updated Quest Name");
    await page.getByLabel("Status").selectOption("completed");

    // Submit
    await page.getByRole("button", { name: "Update Quest" }).click();

    // Verify update
    await expect(page.getByText("Quest updated successfully")).toBeVisible();
    await expect(
      page.getByRole("heading", { name: "Updated Quest Name" })
    ).toBeVisible();
    await expect(page.getByText("Completed")).toBeVisible();
  });

  test("should delete a quest", async ({ page }) => {
    const campaignId = page.url().split("/").pop();
    await page.goto(`/quests?campaignId=${campaignId}`);

    // Click on the first quest
    await page.getByRole("link", { name: "Updated Quest Name" }).click();

    // Click delete button
    page.on("dialog", (dialog) => dialog.accept());
    await page.getByRole("button", { name: "Delete" }).click();

    // Verify redirect
    await expect(page).toHaveURL(/\/quests\?campaignId=/);
    await expect(page.getByText("Quest deleted successfully")).toBeVisible();

    // Verify quest is not in list
    await expect(
      page.getByRole("link", { name: "Updated Quest Name" })
    ).not.toBeVisible();
  });

  test("should validate required fields", async ({ page }) => {
    const campaignId = page.url().split("/").pop();
    await page.goto(`/quests/new?campaignId=${campaignId}`);

    // Submit empty form
    await page.getByRole("button", { name: "Create Quest" }).click();

    // Should show validation errors
    await expect(page.getByText("Name is required")).toBeVisible();
  });

  test("should create quest with all fields", async ({ page }) => {
    const campaignId = page.url().split("/").pop();
    await page.goto(`/quests/new?campaignId=${campaignId}`);

    // Fill all fields
    await page.getByLabel("Name", { exact: true }).fill("Complete Quest");
    await page.getByLabel("Type").selectOption("Side Quest");
    await page.getByLabel("Status").selectOption("on-hold");
    await page.getByLabel("Image URL").fill("https://example.com/quest.jpg");

    // Set private
    await page.getByLabel("Private").check();

    // Fill description
    const editor = page.locator(".ContentEditable__root");
    await editor.click();
    await editor.fill("A quest with all properties filled.");

    // Submit
    await page.getByRole("button", { name: "Create Quest" }).click();

    // Verify all fields
    await expect(page.getByText("Quest created successfully")).toBeVisible();
    await expect(
      page.getByRole("heading", { name: "Complete Quest" })
    ).toBeVisible();
    await expect(page.getByText("Side Quest")).toBeVisible();
    await expect(page.getByText("On hold")).toBeVisible();
    await expect(page.getByText("Private")).toBeVisible();
  });

  test("should change quest status", async ({ page }) => {
    const campaignId = page.url().split("/").pop();
    await page.goto(`/quests/new?campaignId=${campaignId}`);

    // Create quest with active status
    await page.getByLabel("Name", { exact: true }).fill("Status Test Quest");
    await page.getByLabel("Status").selectOption("active");
    await page.getByRole("button", { name: "Create Quest" }).click();

    await expect(page.getByText("Active")).toBeVisible();

    // Edit to completed
    await page.getByRole("button", { name: "Edit" }).click();
    await page.getByLabel("Status").selectOption("completed");
    await page.getByRole("button", { name: "Update Quest" }).click();

    await expect(page.getByText("Completed")).toBeVisible();

    // Edit to failed
    await page.getByRole("button", { name: "Edit" }).click();
    await page.getByLabel("Status").selectOption("failed");
    await page.getByRole("button", { name: "Update Quest" }).click();

    await expect(page.getByText("Failed")).toBeVisible();
  });

  test("should handle different quest types", async ({ page }) => {
    const campaignId = page.url().split("/").pop();
    const types = ["Main Quest", "Side Quest", "Personal Quest", "Bounty"];

    for (const type of types) {
      await page.goto(`/quests/new?campaignId=${campaignId}`);
      await page.getByLabel("Name", { exact: true }).fill(`${type} Test`);
      await page.getByLabel("Type").selectOption(type);
      await page.getByRole("button", { name: "Create Quest" }).click();

      // Verify type
      await expect(page.getByText(type)).toBeVisible();
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
    await page.goto(`/quests?campaignId=${campaignId}`);

    // Should show empty state
    await expect(page.getByText("No quests yet")).toBeVisible();
    await expect(
      page.getByRole("button", { name: "Create Quest" })
    ).toBeVisible();
  });

  test("should toggle privacy setting", async ({ page }) => {
    const campaignId = page.url().split("/").pop();
    await page.goto(`/quests/new?campaignId=${campaignId}`);

    // Create private quest
    await page.getByLabel("Name", { exact: true }).fill("Secret Quest");
    await page.getByLabel("Private").check();
    await page.getByRole("button", { name: "Create Quest" }).click();

    // Verify private badge
    await expect(page.getByText("Private")).toBeVisible();

    // Edit to make public
    await page.getByRole("button", { name: "Edit" }).click();
    await page.getByLabel("Private").uncheck();
    await page.getByRole("button", { name: "Update Quest" }).click();

    // Verify no private badge
    await expect(page.getByText("Private")).not.toBeVisible();
  });

  test("should cancel quest creation", async ({ page }) => {
    const campaignId = page.url().split("/").pop();
    await page.goto(`/quests/new?campaignId=${campaignId}`);

    // Fill some fields
    await page.getByLabel("Name", { exact: true }).fill("Cancelled Quest");

    // Click cancel
    await page.getByRole("button", { name: "Cancel" }).click();

    // Should redirect to list
    await expect(page).toHaveURL(`/quests?campaignId=${campaignId}`);

    // Quest should not be created
    await expect(
      page.getByRole("link", { name: "Cancelled Quest" })
    ).not.toBeVisible();
  });

  test("should display quest metadata correctly", async ({ page }) => {
    const campaignId = page.url().split("/").pop();
    await page.goto(`/quests/new?campaignId=${campaignId}`);

    // Create quest
    await page.getByLabel("Name", { exact: true }).fill("Metadata Quest");
    await page.getByRole("button", { name: "Create Quest" }).click();

    // Verify metadata sections
    await expect(page.getByText(/Campaign:/)).toBeVisible();
    await expect(page.getByText(/Created by:/)).toBeVisible();
    await expect(page.getByText(/Created:/)).toBeVisible();
    await expect(page.getByText(/Updated:/)).toBeVisible();
  });
});
