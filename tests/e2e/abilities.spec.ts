import { expect, test } from "@playwright/test";

test.describe("Abilities", () => {
  let testAbilityId: string;
  let testCampaignId: string;

  test.beforeAll(async ({ request }) => {
    // Create a test campaign
    const campaignRes = await request.post(
      "http://localhost:3000/api/campaigns",
      {
        data: {
          name: "Test Campaign for Abilities",
          slug: `test-abilities-${Date.now()}`,
          description: "Test campaign",
        },
      }
    );
    const campaign = await campaignRes.json();
    testCampaignId = campaign.id;
  });

  test("should create a new ability", async ({ page }) => {
    await page.goto(`/abilities/create?campaignId=${testCampaignId}`);

    await page.fill('[name="name"]', "Fireball");
    await page.selectOption('[id="type"]', "Spell");
    await page.fill('[name="charges"]', "3");

    await page.click('button[type="submit"]');

    await expect(page).toHaveURL(/\/abilities\/[a-z0-9]+$/);
    await expect(page.locator("h1")).toContainText("Fireball");
    await expect(page.locator("text=Spell")).toBeVisible();
    await expect(page.locator("text=⚡ 3")).toBeVisible();

    // Save ability ID for later tests
    const url = page.url();
    testAbilityId = url.split("/").pop() || "";
  });

  test("should display ability in list", async ({ page }) => {
    await page.goto(`/abilities?campaignId=${testCampaignId}`);

    await expect(page.locator("text=Fireball")).toBeVisible();
    await expect(page.locator("text=Spell")).toBeVisible();
  });

  test("should edit an ability", async ({ page }) => {
    await page.goto(`/abilities/${testAbilityId}/edit`);

    await page.fill('[name="name"]', "Fireball (Updated)");
    await page.fill('[name="charges"]', "5");

    await page.click('button[type="submit"]');

    await expect(page).toHaveURL(`/abilities/${testAbilityId}`);
    await expect(page.locator("h1")).toContainText("Fireball (Updated)");
    await expect(page.locator("text=⚡ 5")).toBeVisible();
  });

  test("should create a child ability", async ({ page }) => {
    await page.goto(`/abilities/create?campaignId=${testCampaignId}`);

    await page.fill('[name="name"]', "Fireball - Delayed Blast");
    await page.selectOption('[id="type"]', "Spell");
    await page.selectOption('[id="parentId"]', testAbilityId);

    await page.click('button[type="submit"]');

    await expect(page).toHaveURL(/\/abilities\/[a-z0-9]+$/);
    await expect(page.locator("h1")).toContainText("Fireball - Delayed Blast");

    // Check parent is shown
    await expect(page.locator("text=Parent Ability")).toBeVisible();
    await expect(
      page.locator(`a[href="/abilities/${testAbilityId}"]`)
    ).toBeVisible();
  });

  test("should show children in parent ability", async ({ page }) => {
    await page.goto(`/abilities/${testAbilityId}`);

    await expect(page.locator("text=Sub-Abilities")).toBeVisible();
    await expect(page.locator("text=Fireball - Delayed Blast")).toBeVisible();
  });

  test("should create ability with different types", async ({ page }) => {
    const types = ["Action", "Passive", "Feature"];

    for (const type of types) {
      await page.goto(`/abilities/create?campaignId=${testCampaignId}`);

      await page.fill('[name="name"]', `Test ${type} Ability`);
      await page.selectOption('[id="type"]', type);

      await page.click('button[type="submit"]');

      await expect(page).toHaveURL(/\/abilities\/[a-z0-9]+$/);
      await expect(page.locator(`text=${type}`)).toBeVisible();
    }
  });

  test("should mark ability as private", async ({ page }) => {
    await page.goto(`/abilities/create?campaignId=${testCampaignId}`);

    await page.fill('[name="name"]', "Secret Ability");
    await page.check('[id="isPrivate"]');

    await page.click('button[type="submit"]');

    await expect(page).toHaveURL(/\/abilities\/[a-z0-9]+$/);
    await expect(page.locator("text=🔒 Private")).toBeVisible();
  });

  test("should delete an ability", async ({ page }) => {
    // Create ability to delete
    await page.goto(`/abilities/create?campaignId=${testCampaignId}`);
    await page.fill('[name="name"]', "Ability to Delete");
    await page.click('button[type="submit"]');

    const url = page.url();
    const abilityId = url.split("/").pop();

    // Go to edit page and delete
    await page.goto(`/abilities/${abilityId}/edit`);

    page.on("dialog", (dialog) => dialog.accept());
    await page.click('button:has-text("Delete")');

    await expect(page).toHaveURL(
      new RegExp(`/abilities\\?campaignId=${testCampaignId}`)
    );
  });

  test("should search abilities", async ({ page }) => {
    await page.goto(`/abilities?campaignId=${testCampaignId}`);

    // Count initial abilities
    const initialCount = await page.locator("ul li").count();
    expect(initialCount).toBeGreaterThan(0);

    // Note: Actual search implementation would require adding search UI
    // This is a placeholder for future search functionality
  });
});
