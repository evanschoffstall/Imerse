import { expect, test } from "@playwright/test";

test.describe("Character Management", () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to login page
    await page.goto("/login");

    // TODO: Replace with actual login once auth is implemented
    // For now, skip these tests
    test.skip(true, "Authentication not yet implemented in tests");
  });

  test.skip("should display empty state when no characters exist", async ({
    page,
  }) => {
    const campaignId = "test-campaign-id";
    await page.goto(`/characters?campaignId=${campaignId}`);

    await expect(page.getByText("No characters yet")).toBeVisible();
    await expect(
      page.getByRole("button", { name: "Create Character" })
    ).toBeVisible();
  });

  test.skip("should create a new character", async ({ page }) => {
    const campaignId = "test-campaign-id";

    // Navigate to character list
    await page.goto(`/characters?campaignId=${campaignId}`);

    // Click create button
    await page.getByRole("button", { name: "Create New Character" }).click();

    // Fill out the form
    await page.getByLabel("Name", { exact: true }).fill("Aragorn");
    await page.getByLabel("Title").fill("King of Gondor");
    await page.getByLabel("Type").selectOption("PC");
    await page.getByLabel("Age").fill("87");
    await page.getByLabel("Sex").selectOption("Male");
    await page.getByLabel("Pronouns").fill("he/him");
    await page.getByLabel("Location").fill("Minas Tirith");
    await page.getByLabel("Family").fill("House of Telcontar");

    // Fill description in rich text editor
    const editor = page.locator(".ContentEditable__root");
    await editor.click();
    await editor.fill("A ranger of the North, heir to the throne of Gondor.");

    // Submit the form
    await page.getByRole("button", { name: "Create Character" }).click();

    // Should redirect to character detail page
    await expect(page).toHaveURL(/\/characters\/[a-z0-9]+/);
    await expect(page.getByText("Aragorn")).toBeVisible();
    await expect(page.getByText("King of Gondor")).toBeVisible();
  });

  test.skip("should display character list", async ({ page }) => {
    const campaignId = "test-campaign-id";
    await page.goto(`/characters?campaignId=${campaignId}`);

    // Should show table headers
    await expect(page.getByText("Name")).toBeVisible();
    await expect(page.getByText("Title")).toBeVisible();
    await expect(page.getByText("Type")).toBeVisible();
    await expect(page.getByText("Location")).toBeVisible();
    await expect(page.getByText("Updated")).toBeVisible();
  });

  test.skip("should view character details", async ({ page }) => {
    const campaignId = "test-campaign-id";
    await page.goto(`/characters?campaignId=${campaignId}`);

    // Click on a character name
    await page.getByRole("link", { name: "Aragorn" }).click();

    // Should show character details
    await expect(page.getByRole("heading", { name: "Aragorn" })).toBeVisible();
    await expect(page.getByText("King of Gondor")).toBeVisible();
    await expect(page.getByText("Age")).toBeVisible();
    await expect(page.getByText("87")).toBeVisible();
    await expect(page.getByText("Location")).toBeVisible();
    await expect(page.getByText("Minas Tirith")).toBeVisible();

    // Should show action buttons
    await expect(page.getByRole("button", { name: "Edit" })).toBeVisible();
    await expect(page.getByRole("button", { name: "Delete" })).toBeVisible();
  });

  test.skip("should edit a character", async ({ page }) => {
    const campaignId = "test-campaign-id";

    // Navigate to character detail
    await page.goto(`/characters?campaignId=${campaignId}`);
    await page.getByRole("link", { name: "Aragorn" }).click();

    // Click edit button
    await page.getByRole("button", { name: "Edit" }).click();

    // Should navigate to edit page
    await expect(page).toHaveURL(/\/characters\/[a-z0-9]+\/edit/);
    await expect(
      page.getByRole("heading", { name: "Edit Character" })
    ).toBeVisible();

    // Update character title
    const titleInput = page.getByLabel("Title");
    await titleInput.clear();
    await titleInput.fill("High King of Gondor and Arnor");

    // Update age
    const ageInput = page.getByLabel("Age");
    await ageInput.clear();
    await ageInput.fill("88");

    // Submit the form
    await page.getByRole("button", { name: "Update Character" }).click();

    // Should redirect to character detail page with updated info
    await expect(page).toHaveURL(/\/characters\/[a-z0-9]+$/);
    await expect(page.getByText("High King of Gondor and Arnor")).toBeVisible();
    await expect(page.getByText("88")).toBeVisible();
  });

  test.skip("should delete a character", async ({ page }) => {
    const campaignId = "test-campaign-id";

    // Navigate to character detail
    await page.goto(`/characters?campaignId=${campaignId}`);
    await page.getByRole("link", { name: "Aragorn" }).click();

    // Click delete button
    await page.getByRole("button", { name: "Delete" }).click();

    // Should show confirmation dialog
    await expect(page.getByText("Delete Character")).toBeVisible();
    await expect(
      page.getByText(/Are you sure you want to delete/)
    ).toBeVisible();

    // Confirm deletion
    await page.getByRole("button", { name: "Delete" }).nth(1).click();

    // Should redirect to character list
    await expect(page).toHaveURL(`/characters?campaignId=${campaignId}`);

    // Character should no longer be in the list
    await expect(page.getByRole("link", { name: "Aragorn" })).not.toBeVisible();
  });

  test.skip("should cancel character deletion", async ({ page }) => {
    const campaignId = "test-campaign-id";

    // Navigate to character detail
    await page.goto(`/characters?campaignId=${campaignId}`);
    await page.getByRole("link", { name: "Aragorn" }).click();

    // Click delete button
    await page.getByRole("button", { name: "Delete" }).click();

    // Should show confirmation dialog
    await expect(page.getByText("Delete Character")).toBeVisible();

    // Cancel deletion
    await page.getByRole("button", { name: "Cancel" }).click();

    // Dialog should close and stay on character page
    await expect(page.getByText("Delete Character")).not.toBeVisible();
    await expect(page).toHaveURL(/\/characters\/[a-z0-9]+$/);
  });

  test.skip("should validate required fields", async ({ page }) => {
    const campaignId = "test-campaign-id";

    // Navigate to create page
    await page.goto(`/characters/new?campaignId=${campaignId}`);

    // Try to submit without filling required fields
    await page.getByRole("button", { name: "Create Character" }).click();

    // Should show validation error
    await expect(page.getByText("Name is required")).toBeVisible();
  });

  test.skip("should handle character privacy settings", async ({ page }) => {
    const campaignId = "test-campaign-id";

    // Navigate to create page
    await page.goto(`/characters/new?campaignId=${campaignId}`);

    // Fill required fields
    await page.getByLabel("Name", { exact: true }).fill("Secret Character");

    // Check private checkbox
    await page
      .getByText("Private (only visible to campaign owner and creator)")
      .click();

    // Submit the form
    await page.getByRole("button", { name: "Create Character" }).click();

    // Should show private badge on detail page
    await expect(page.getByText("Private")).toBeVisible();
  });

  test.skip("should navigate back to character list", async ({ page }) => {
    const campaignId = "test-campaign-id";

    // Navigate to create page
    await page.goto(`/characters/new?campaignId=${campaignId}`);

    // Click back link
    await page.getByRole("link", { name: "← Back to Characters" }).click();

    // Should navigate to character list
    await expect(page).toHaveURL(`/characters?campaignId=${campaignId}`);
  });

  test.skip("should cancel character creation", async ({ page }) => {
    const campaignId = "test-campaign-id";

    // Navigate to create page
    await page.goto(`/characters/new?campaignId=${campaignId}`);

    // Fill some fields
    await page.getByLabel("Name", { exact: true }).fill("Test Character");

    // Click cancel button
    await page.getByRole("button", { name: "Cancel" }).click();

    // Should navigate back to character list
    await expect(page).toHaveURL(`/characters?campaignId=${campaignId}`);
  });

  test.skip("should show campaign requirement warning", async ({ page }) => {
    // Navigate to characters page without campaign ID
    await page.goto("/characters");

    // Should show warning message
    await expect(
      page.getByText("Please select a campaign to view characters")
    ).toBeVisible();
  });

  test.skip("should format dates correctly", async ({ page }) => {
    const campaignId = "test-campaign-id";
    await page.goto(`/characters?campaignId=${campaignId}`);

    // Should show relative dates in the table
    // This will match patterns like "Today", "Yesterday", "2 days ago", or formatted dates
    const dateCell = page.locator("tbody tr:first-child td:last-child").first();
    await expect(dateCell).toContainText(
      /Today|Yesterday|\d+ days ago|\d{1,2}\/\d{1,2}\/\d{4}/
    );
  });
});
