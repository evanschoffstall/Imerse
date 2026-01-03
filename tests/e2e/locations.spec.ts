import { expect, test } from "@playwright/test";

test.describe("Location Management", () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to login page
    await page.goto("/login");

    // TODO: Replace with actual login once auth is implemented
    // For now, skip these tests
    test.skip(true, "Authentication not yet implemented in tests");
  });

  test.skip("should display empty state when no locations exist", async ({
    page,
  }) => {
    const campaignId = "test-campaign-id";
    await page.goto(`/locations?campaignId=${campaignId}`);

    await expect(page.getByText("No locations yet")).toBeVisible();
    await expect(
      page.getByRole("button", { name: "Create Location" })
    ).toBeVisible();
  });

  test.skip("should create a new top-level location", async ({ page }) => {
    const campaignId = "test-campaign-id";

    // Navigate to location list
    await page.goto(`/locations?campaignId=${campaignId}`);

    // Click create button
    await page.getByRole("button", { name: "Create New Location" }).click();

    // Fill out the form
    await page.getByLabel("Name", { exact: true }).fill("Middle-earth");
    await page.getByLabel("Type").selectOption("Continent");

    // Fill description in rich text editor
    const editor = page.locator(".ContentEditable__root");
    await editor.click();
    await editor.fill("A vast continent with diverse lands and peoples.");

    // Submit the form
    await page.getByRole("button", { name: "Create Location" }).click();

    // Should redirect to location detail page
    await expect(page).toHaveURL(/\/locations\/[a-z0-9]+/);
    await expect(page.getByText("Middle-earth")).toBeVisible();
    await expect(page.getByText("Continent")).toBeVisible();
  });

  test.skip("should create a child location with parent", async ({ page }) => {
    const campaignId = "test-campaign-id";

    // Navigate to create page
    await page.goto(`/locations/new?campaignId=${campaignId}`);

    // Fill out the form
    await page.getByLabel("Name", { exact: true }).fill("Gondor");
    await page.getByLabel("Type").selectOption("Country");

    // Select parent location
    await page
      .getByLabel("Parent Location")
      .selectOption({ label: "Middle-earth" });

    // Fill description
    const editor = page.locator(".ContentEditable__root");
    await editor.click();
    await editor.fill("A great kingdom of men.");

    // Submit the form
    await page.getByRole("button", { name: "Create Location" }).click();

    // Should show parent location link on detail page
    await expect(page.getByText("Parent Location")).toBeVisible();
    await expect(
      page.getByRole("link", { name: "Middle-earth" })
    ).toBeVisible();
  });

  test.skip("should display location hierarchy in list", async ({ page }) => {
    const campaignId = "test-campaign-id";
    await page.goto(`/locations?campaignId=${campaignId}`);

    // Should show table headers
    await expect(page.getByText("Name")).toBeVisible();
    await expect(page.getByText("Type")).toBeVisible();
    await expect(page.getByText("Parent")).toBeVisible();

    // Child locations should be indented (check for unicode arrow)
    const childLocation = page.locator("tbody tr").filter({ hasText: "↳" });
    await expect(childLocation).toBeVisible();
  });

  test.skip("should view location details with children", async ({ page }) => {
    const campaignId = "test-campaign-id";
    await page.goto(`/locations?campaignId=${campaignId}`);

    // Click on a location name
    await page.getByRole("link", { name: "Middle-earth" }).click();

    // Should show location details
    await expect(
      page.getByRole("heading", { name: "Middle-earth" })
    ).toBeVisible();
    await expect(page.getByText("Continent")).toBeVisible();

    // Should show sub-locations section
    await expect(
      page.getByRole("heading", { name: "Sub-Locations" })
    ).toBeVisible();
    await expect(page.getByRole("link", { name: "Gondor" })).toBeVisible();

    // Should show action buttons
    await expect(page.getByRole("button", { name: "Edit" })).toBeVisible();
    await expect(page.getByRole("button", { name: "Delete" })).toBeVisible();
  });

  test.skip("should edit a location", async ({ page }) => {
    const campaignId = "test-campaign-id";

    // Navigate to location detail
    await page.goto(`/locations?campaignId=${campaignId}`);
    await page.getByRole("link", { name: "Gondor" }).click();

    // Click edit button
    await page.getByRole("button", { name: "Edit" }).click();

    // Should navigate to edit page
    await expect(page).toHaveURL(/\/locations\/[a-z0-9]+\/edit/);
    await expect(
      page.getByRole("heading", { name: "Edit Location" })
    ).toBeVisible();

    // Update location type
    await page.getByLabel("Type").selectOption("Kingdom");

    // Add map image
    await page
      .getByLabel("Map Image URL")
      .fill("https://example.com/gondor-map.jpg");

    // Submit the form
    await page.getByRole("button", { name: "Update Location" }).click();

    // Should redirect to location detail page with updated info
    await expect(page).toHaveURL(/\/locations\/[a-z0-9]+$/);
    await expect(page.getByText("Kingdom")).toBeVisible();
    await expect(page.getByRole("heading", { name: "Map" })).toBeVisible();
  });

  test.skip("should change parent location", async ({ page }) => {
    const campaignId = "test-campaign-id";

    // Navigate to edit page
    await page.goto(`/locations?campaignId=${campaignId}`);
    await page.getByRole("link", { name: "Minas Tirith" }).click();
    await page.getByRole("button", { name: "Edit" }).click();

    // Change parent from Gondor to Middle-earth
    await page
      .getByLabel("Parent Location")
      .selectOption({ label: "Middle-earth" });

    // Submit
    await page.getByRole("button", { name: "Update Location" }).click();

    // Should show new parent
    await expect(
      page.getByRole("link", { name: "Middle-earth" })
    ).toBeVisible();
  });

  test.skip("should prevent circular hierarchy", async ({ page }) => {
    const campaignId = "test-campaign-id";

    // Try to make Middle-earth a child of Gondor (which is child of Middle-earth)
    await page.goto(`/locations?campaignId=${campaignId}`);
    await page.getByRole("link", { name: "Middle-earth" }).click();
    await page.getByRole("button", { name: "Edit" }).click();

    // Try to set parent to a descendant
    await page.getByLabel("Parent Location").selectOption({ label: "Gondor" });
    await page.getByRole("button", { name: "Update Location" }).click();

    // Should show error message
    await expect(page.getByText(/Circular hierarchy/)).toBeVisible();
  });

  test.skip("should prevent deleting location with children", async ({
    page,
  }) => {
    const campaignId = "test-campaign-id";

    // Navigate to location with children
    await page.goto(`/locations?campaignId=${campaignId}`);
    await page.getByRole("link", { name: "Middle-earth" }).click();

    // Click delete button
    await page.getByRole("button", { name: "Delete" }).click();

    // Should show warning about children
    await expect(page.getByText(/has \\d+ sub-location/)).toBeVisible();

    // Delete button should be disabled
    const deleteButton = page.getByRole("button", { name: "Delete" }).nth(1);
    await expect(deleteButton).toBeDisabled();
  });

  test.skip("should delete a location without children", async ({ page }) => {
    const campaignId = "test-campaign-id";

    // Navigate to leaf location (no children)
    await page.goto(`/locations?campaignId=${campaignId}`);
    await page.getByRole("link", { name: "Minas Tirith" }).click();

    // Click delete button
    await page.getByRole("button", { name: "Delete" }).click();

    // Should show confirmation dialog
    await expect(page.getByText("Delete Location")).toBeVisible();

    // Confirm deletion
    await page.getByRole("button", { name: "Delete" }).nth(1).click();

    // Should redirect to location list
    await expect(page).toHaveURL(`/locations?campaignId=${campaignId}`);

    // Location should no longer be in the list
    await expect(
      page.getByRole("link", { name: "Minas Tirith" })
    ).not.toBeVisible();
  });

  test.skip("should cancel location deletion", async ({ page }) => {
    const campaignId = "test-campaign-id";

    // Navigate to location detail
    await page.goto(`/locations?campaignId=${campaignId}`);
    await page.getByRole("link", { name: "Gondor" }).click();

    // Click delete button
    await page.getByRole("button", { name: "Delete" }).click();

    // Should show confirmation dialog
    await expect(page.getByText("Delete Location")).toBeVisible();

    // Cancel deletion
    await page.getByRole("button", { name: "Cancel" }).click();

    // Dialog should close and stay on location page
    await expect(page.getByText("Delete Location")).not.toBeVisible();
    await expect(page).toHaveURL(/\/locations\/[a-z0-9]+$/);
  });

  test.skip("should validate required fields", async ({ page }) => {
    const campaignId = "test-campaign-id";

    // Navigate to create page
    await page.goto(`/locations/new?campaignId=${campaignId}`);

    // Try to submit without filling required fields
    await page.getByRole("button", { name: "Create Location" }).click();

    // Should show validation error
    await expect(page.getByText("Name is required")).toBeVisible();
  });

  test.skip("should handle location privacy settings", async ({ page }) => {
    const campaignId = "test-campaign-id";

    // Navigate to create page
    await page.goto(`/locations/new?campaignId=${campaignId}`);

    // Fill required fields
    await page.getByLabel("Name", { exact: true }).fill("Secret Base");

    // Check private checkbox
    await page
      .getByText("Private (only visible to campaign owner and creator)")
      .click();

    // Submit the form
    await page.getByRole("button", { name: "Create Location" }).click();

    // Should show private badge on detail page
    await expect(page.getByText("Private")).toBeVisible();
  });

  test.skip("should display map image when provided", async ({ page }) => {
    const campaignId = "test-campaign-id";

    // Navigate to location with map
    await page.goto(`/locations?campaignId=${campaignId}`);
    await page.getByRole("link", { name: "Gondor" }).click();

    // Should show map section
    await expect(page.getByRole("heading", { name: "Map" })).toBeVisible();
    await expect(page.locator('img[alt*="Map of"]')).toBeVisible();
  });

  test.skip("should navigate through hierarchy with breadcrumbs", async ({
    page,
  }) => {
    const campaignId = "test-campaign-id";

    // Navigate to nested location
    await page.goto(`/locations?campaignId=${campaignId}`);
    await page.getByRole("link", { name: "Minas Tirith" }).click();

    // Should show parent location link
    const parentLink = page.getByRole("link", { name: "Gondor" });
    await expect(parentLink).toBeVisible();

    // Click to navigate to parent
    await parentLink.click();
    await expect(page.getByRole("heading", { name: "Gondor" })).toBeVisible();

    // Should show its parent link
    await expect(
      page.getByRole("link", { name: "Middle-earth" })
    ).toBeVisible();
  });

  test.skip("should navigate back to location list", async ({ page }) => {
    const campaignId = "test-campaign-id";

    // Navigate to create page
    await page.goto(`/locations/new?campaignId=${campaignId}`);

    // Click back link
    await page.getByRole("link", { name: "← Back to Locations" }).click();

    // Should navigate to location list
    await expect(page).toHaveURL(`/locations?campaignId=${campaignId}`);
  });

  test.skip("should cancel location creation", async ({ page }) => {
    const campaignId = "test-campaign-id";

    // Navigate to create page
    await page.goto(`/locations/new?campaignId=${campaignId}`);

    // Fill some fields
    await page.getByLabel("Name", { exact: true }).fill("Test Location");

    // Click cancel button
    await page.getByRole("button", { name: "Cancel" }).click();

    // Should navigate back to location list
    await expect(page).toHaveURL(`/locations?campaignId=${campaignId}`);
  });

  test.skip("should show campaign requirement warning", async ({ page }) => {
    // Navigate to locations page without campaign ID
    await page.goto("/locations");

    // Should show warning message
    await expect(
      page.getByText("Please select a campaign to view locations")
    ).toBeVisible();
  });

  test.skip("should filter parent options to prevent self-reference", async ({
    page,
  }) => {
    const campaignId = "test-campaign-id";

    // Navigate to edit existing location
    await page.goto(`/locations?campaignId=${campaignId}`);
    await page.getByRole("link", { name: "Gondor" }).click();
    await page.getByRole("button", { name: "Edit" }).click();

    // Open parent location dropdown
    const parentSelect = page.getByLabel("Parent Location");

    // Should not include current location (Gondor) as an option
    const gondorOption = parentSelect.locator("option", { hasText: "Gondor" });
    await expect(gondorOption).toHaveCount(0);
  });
});
