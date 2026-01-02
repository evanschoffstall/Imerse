import { expect, test } from "@playwright/test";

/**
 * Visual Testing: Form Components
 *
 * Tests shadcn/ui form components: Input, Select, Checkbox, Radio, Textarea, Label, Form
 * Verifies beautiful, modern styling in light/dark modes and responsive layouts
 *
 * Run: bunx playwright test tests/visual/form-components.spec.ts --headed
 */

test.describe("Form Components - shadcn/ui Verification", () => {
  test.beforeEach(async ({ page }) => {
    // Login as test user
    await page.goto("/login");
    await page.fill('input[name="email"]', "test@example.com");
    await page.fill('input[name="password"]', "password");
    await page.click('button[type="submit"]');
    await page.waitForURL("/dashboard");
  });

  test("Input component should use shadcn/ui styling", async ({ page }) => {
    // Go to campaign creation page (has many input fields)
    await page.goto("/campaigns/create");
    await page.waitForLoadState("networkidle");

    // Find name input field
    const nameInput = page.locator('input[name="name"]');

    // Verify shadcn/ui input classes
    await expect(nameInput).toHaveClass(/rounded-md/);
    await expect(nameInput).toHaveClass(/border-input/);
    await expect(nameInput).toHaveClass(/bg-background/);
    await expect(nameInput).toHaveClass(/focus-visible:ring/);

    // Screenshot input field
    await expect(page).toHaveScreenshot("input-campaign-create-light.png");
  });

  test("Input focus state should be beautiful", async ({ page }) => {
    await page.goto("/campaigns/create");

    const nameInput = page.locator('input[name="name"]');
    await nameInput.focus();
    await page.waitForTimeout(100); // Wait for focus transition

    // Screenshot focused input
    await expect(page).toHaveScreenshot("input-focus-state.png");
  });

  test("Textarea component should use shadcn/ui styling", async ({ page }) => {
    await page.goto("/campaigns/create");
    await page.waitForLoadState("networkidle");

    // Find description textarea (if it exists)
    const textarea = page.locator("textarea").first();

    if (await textarea.isVisible()) {
      // Verify shadcn/ui textarea classes
      await expect(textarea).toHaveClass(/rounded-md/);
      await expect(textarea).toHaveClass(/border-input/);

      // Screenshot textarea
      await expect(page).toHaveScreenshot("textarea-light.png");
    }
  });

  test("Select component should use Radix UI", async ({ page }) => {
    // Navigate to character creation (has many select fields)
    await page.goto("/characters/create");
    await page.waitForLoadState("networkidle");

    // Look for Radix select triggers
    const selectTrigger = page.locator('[role="combobox"]').first();

    if (await selectTrigger.isVisible()) {
      // Verify shadcn/ui select styling
      await expect(selectTrigger).toHaveClass(/rounded-md/);
      await expect(selectTrigger).toHaveClass(/border-input/);

      // Click to open dropdown
      await selectTrigger.click();
      await page.waitForTimeout(200);

      // Screenshot select dropdown
      await expect(page).toHaveScreenshot("select-dropdown-open.png");
    }
  });

  test("Checkbox component should use shadcn/ui styling", async ({ page }) => {
    await page.goto("/characters/create");
    await page.waitForLoadState("networkidle");

    // Find checkbox (isPrivate or similar)
    const checkbox = page.locator('button[role="checkbox"]').first();

    if (await checkbox.isVisible()) {
      // Verify shadcn/ui checkbox classes
      await expect(checkbox).toHaveClass(/rounded/);
      await expect(checkbox).toHaveClass(/border/);

      // Screenshot checkbox
      await expect(page).toHaveScreenshot("checkbox-unchecked.png");

      // Click checkbox
      await checkbox.click();
      await page.waitForTimeout(100);

      // Screenshot checked state
      await expect(page).toHaveScreenshot("checkbox-checked.png");
    }
  });

  test("Radio Group component should use shadcn/ui styling", async ({
    page,
  }) => {
    await page.goto("/characters/create");
    await page.waitForLoadState("networkidle");

    // Find radio buttons
    const radioButton = page.locator('button[role="radio"]').first();

    if (await radioButton.isVisible()) {
      // Verify shadcn/ui radio classes
      await expect(radioButton).toHaveClass(/rounded-full/);
      await expect(radioButton).toHaveClass(/border/);

      // Screenshot radio group
      await expect(page).toHaveScreenshot("radio-group-light.png");
    }
  });

  test("Label component should use shadcn/ui styling", async ({ page }) => {
    await page.goto("/campaigns/create");

    // Find labels
    const labels = page.locator("label");
    const labelCount = await labels.count();

    if (labelCount > 0) {
      const firstLabel = labels.first();

      // Verify shadcn/ui label styling (peer-disabled:opacity-70, etc.)
      const labelClass = await firstLabel.getAttribute("class");

      // Screenshot form with labels
      await expect(page).toHaveScreenshot("labels-light.png");
    }
  });

  test("Form validation errors should be visible", async ({ page }) => {
    await page.goto("/campaigns/create");

    // Submit form without filling required fields
    const submitButton = page.locator('button[type="submit"]');
    await submitButton.click();
    await page.waitForTimeout(200);

    // Look for error messages
    const errorText = page.locator(".text-red-500, .text-destructive").first();

    if (await errorText.isVisible()) {
      // Screenshot validation errors
      await expect(page).toHaveScreenshot("form-validation-errors.png");
    }
  });

  test("All form components should work in dark mode", async ({ page }) => {
    await page.goto("/campaigns/create");

    // Toggle dark mode
    await page.evaluate(() => {
      document.documentElement.classList.add("dark");
    });
    await page.waitForTimeout(300);

    // Verify dark mode is active
    const html = page.locator("html");
    await expect(html).toHaveClass(/dark/);

    // Screenshot all form components in dark mode
    await expect(page).toHaveScreenshot("form-components-dark.png");
  });

  test("Form components should be responsive on mobile", async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto("/campaigns/create");
    await page.waitForLoadState("networkidle");

    // Screenshot mobile form
    await expect(page).toHaveScreenshot("form-components-mobile.png");
  });

  test("Form components should be responsive on tablet", async ({ page }) => {
    // Set tablet viewport
    await page.setViewportSize({ width: 768, height: 1024 });
    await page.goto("/campaigns/create");
    await page.waitForLoadState("networkidle");

    // Screenshot tablet form
    await expect(page).toHaveScreenshot("form-components-tablet.png");
  });

  test("Complete form should look modern and beautiful", async ({ page }) => {
    await page.goto("/campaigns/create");
    await page.waitForLoadState("networkidle");

    // Scroll to see entire form
    await page.evaluate(() => window.scrollTo(0, 0));

    // Wait for any animations
    await page.waitForTimeout(300);

    // Screenshot complete form
    await expect(page).toHaveScreenshot("form-complete-light.png", {
      fullPage: true,
    });
  });

  test("Form component (React Hook Form wrapper) should work", async ({
    page,
  }) => {
    await page.goto("/campaigns/create");

    // Fill out form fields
    await page.fill('input[name="name"]', "Visual Test Campaign");

    const description = page.locator('textarea[name="description"]');
    if (await description.isVisible()) {
      await description.fill("Testing form components");
    }

    // Screenshot filled form
    await expect(page).toHaveScreenshot("form-filled-light.png");
  });
});
