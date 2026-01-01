import { expect, test } from "@playwright/test";

test.describe("Map Enhancements", () => {
  let mapId: string;
  let campaignId: string;

  test.beforeAll(async ({ browser }) => {
    // Create a test map for the tests
    const context = await browser.newContext();
    const page = await context.newPage();

    // Login
    await page.goto("/login");
    await page.fill('[name="email"]', "test@example.com");
    await page.fill('[name="password"]', "password");
    await page.click('button[type="submit"]');
    await page.waitForURL("/dashboard");

    // Get campaign ID from dashboard
    const campaignLink = page.locator('a[href*="/campaigns/"]').first();
    const href = await campaignLink.getAttribute("href");
    campaignId = href?.split("/campaigns/")[1] || "";

    // Create a test map
    await page.goto(`/maps/create?campaignId=${campaignId}`);
    await page.fill('[name="name"]', "Test Map for Enhancements");
    await page.selectOption('[name="type"]', "Dungeon");
    await page.click('button[type="submit"]');
    await page.waitForURL(/\/maps\/[a-z0-9]+$/);

    mapId = page.url().split("/maps/")[1];

    await context.close();
  });

  test("should create a map layer", async ({ page }) => {
    await page.goto("/login");
    await page.fill('[name="email"]', "test@example.com");
    await page.fill('[name="password"]', "password");
    await page.click('button[type="submit"]');
    await page.waitForURL("/dashboard");

    // Navigate to map
    await page.goto(`/maps/${mapId}`);

    // Go to Layers tab
    await page.click("text=Layers");

    // Click Add Layer button
    await page.click('button:has-text("Add Layer")');

    // Fill in layer form
    await page.fill('[name="name"]', "Ground Layer");
    await page.fill('input[type="number"][value="0"]', "0");
    await page.fill('input[type="number"][step="0.1"]', "0.8");

    // Submit form
    await page.click('button[type="submit"]:has-text("Create")');

    // Verify layer was created
    await expect(page.locator("text=Ground Layer")).toBeVisible();
    await expect(page.locator("text=Opacity: 80%")).toBeVisible();
  });

  test("should create a marker group", async ({ page }) => {
    await page.goto("/login");
    await page.fill('[name="email"]', "test@example.com");
    await page.fill('[name="password"]', "password");
    await page.click('button[type="submit"]');
    await page.waitForURL("/dashboard");

    // Navigate to map
    await page.goto(`/maps/${mapId}`);

    // Go to Markers & Groups tab
    await page.click("text=Markers & Groups");

    // Switch to Groups tab
    await page.click('button:has-text("Groups")');

    // Click Add Group button
    await page.click('button:has-text("Add Group")');

    // Fill in group form
    await page.fill('input[type="text"][required]', "Points of Interest");

    // Submit form
    await page.click('button[type="submit"]:has-text("Create")');

    // Verify group was created
    await expect(page.locator("text=Points of Interest")).toBeVisible();
  });

  test("should create a marker", async ({ page }) => {
    await page.goto("/login");
    await page.fill('[name="email"]', "test@example.com");
    await page.fill('[name="password"]', "password");
    await page.click('button[type="submit"]');
    await page.waitForURL("/dashboard");

    // Navigate to map
    await page.goto(`/maps/${mapId}`);

    // Go to Markers & Groups tab
    await page.click("text=Markers & Groups");

    // Click Add Marker button
    await page.click('button:has-text("Add Marker")');

    // Fill in marker form
    await page.fill('input[type="text"][required]', "Entrance");
    await page.fill('input[type="number"][step="0.1"]', "100");
    await page.fill('input[type="number"][step="0.1"]', "200");

    // Select shape
    await page.selectOption("select", "marker");

    // Submit form
    await page.click('button[type="submit"]:has-text("Create")');

    // Verify marker was created
    await expect(page.locator("text=Entrance")).toBeVisible();
    await expect(page.locator("text=(100.0, 200.0)")).toBeVisible();
  });

  test("should edit a layer", async ({ page }) => {
    await page.goto("/login");
    await page.fill('[name="email"]', "test@example.com");
    await page.fill('[name="password"]', "password");
    await page.click('button[type="submit"]');
    await page.waitForURL("/dashboard");

    // Navigate to map
    await page.goto(`/maps/${mapId}`);

    // Go to Layers tab
    await page.click("text=Layers");

    // Click Edit button on first layer
    await page.click('button:has-text("Edit")').first();

    // Change name
    await page.fill('input[type="text"][required]', "Updated Ground Layer");

    // Submit form
    await page.click('button[type="submit"]:has-text("Update")');

    // Verify layer was updated
    await expect(page.locator("text=Updated Ground Layer")).toBeVisible();
  });

  test("should delete a marker", async ({ page }) => {
    await page.goto("/login");
    await page.fill('[name="email"]', "test@example.com");
    await page.fill('[name="password"]', "password");
    await page.click('button[type="submit"]');
    await page.waitForURL("/dashboard");

    // Navigate to map
    await page.goto(`/maps/${mapId}`);

    // Go to Markers & Groups tab
    await page.click("text=Markers & Groups");

    // Get initial marker count
    const initialMarkerCount = await page.locator("text=(").count();

    // Click Delete button on first marker
    page.on("dialog", (dialog) => dialog.accept());
    await page.click('button:has-text("Delete")').first();

    // Wait for marker to be removed
    await page.waitForTimeout(500);

    // Verify marker count decreased
    const newMarkerCount = await page.locator("text=(").count();
    expect(newMarkerCount).toBe(initialMarkerCount - 1);
  });

  test("should toggle layer visibility", async ({ page }) => {
    await page.goto("/login");
    await page.fill('[name="email"]', "test@example.com");
    await page.fill('[name="password"]', "password");
    await page.click('button[type="submit"]');
    await page.waitForURL("/dashboard");

    // Navigate to map
    await page.goto(`/maps/${mapId}`);

    // Go to Layers tab
    await page.click("text=Layers");

    // Click visibility toggle
    await page.click('button[title*="layer"]').first();

    // Verify toast notification
    await expect(page.locator("text=Layer visibility updated")).toBeVisible();
  });

  test("should display interactive map", async ({ page }) => {
    await page.goto("/login");
    await page.fill('[name="email"]', "test@example.com");
    await page.fill('[name="password"]', "password");
    await page.click('button[type="submit"]');
    await page.waitForURL("/dashboard");

    // Navigate to map
    await page.goto(`/maps/${mapId}`);

    // Interactive Map tab should be active by default
    await expect(page.locator("text=Pan: Click and drag")).toBeVisible();
    await expect(
      page.locator("text=Zoom: Mouse wheel or buttons")
    ).toBeVisible();

    // Verify zoom controls are present
    await expect(page.locator('button:has-text("+")')).toBeVisible();
    await expect(page.locator('button:has-text("100%")')).toBeVisible();
    await expect(page.locator('button:has-text("−")')).toBeVisible();
  });

  test("should create marker with different shapes", async ({ page }) => {
    await page.goto("/login");
    await page.fill('[name="email"]', "test@example.com");
    await page.fill('[name="password"]', "password");
    await page.click('button[type="submit"]');
    await page.waitForURL("/dashboard");

    // Navigate to map
    await page.goto(`/maps/${mapId}`);

    // Go to Markers & Groups tab
    await page.click("text=Markers & Groups");

    const shapes = ["circle", "label"];

    for (const shape of shapes) {
      // Click Add Marker button
      await page.click('button:has-text("Add Marker")');

      // Fill in marker form
      await page.fill('input[type="text"][required]', `${shape} Marker`);
      await page.fill(
        'input[type="number"][step="0.1"]',
        `${Math.random() * 100}`
      );
      await page.fill(
        'input[type="number"][step="0.1"]',
        `${Math.random() * 100}`
      );

      // Select shape
      await page.selectOption("select", shape);

      // Submit form
      await page.click('button[type="submit"]:has-text("Create")');

      // Verify marker was created
      await expect(page.locator(`text=${shape} Marker`)).toBeVisible();

      // Wait a bit before creating next marker
      await page.waitForTimeout(300);
    }
  });

  test("should assign marker to group", async ({ page }) => {
    await page.goto("/login");
    await page.fill('[name="email"]', "test@example.com");
    await page.fill('[name="password"]', "password");
    await page.click('button[type="submit"]');
    await page.waitForURL("/dashboard");

    // Navigate to map
    await page.goto(`/maps/${mapId}`);

    // Go to Markers & Groups tab
    await page.click("text=Markers & Groups");

    // Click Add Marker button
    await page.click('button:has-text("Add Marker")');

    // Fill in marker form
    await page.fill('input[type="text"][required]', "Grouped Marker");
    await page.fill('input[type="number"][step="0.1"]', "50");
    await page.fill('input[type="number"][step="0.1"]', "75");

    // Select group (assuming "Points of Interest" group exists from previous test)
    const groupSelect = page.locator("select").last();
    await groupSelect.selectOption({ label: /Points of Interest/i });

    // Submit form
    await page.click('button[type="submit"]:has-text("Create")');

    // Verify marker was created with group
    await expect(page.locator("text=Grouped Marker")).toBeVisible();
    await expect(page.locator("text=Group: Points of Interest")).toBeVisible();
  });
});
