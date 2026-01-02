# Visual Testing with Playwright

**Purpose**: Ensure every page is beautiful and modern with shadcn/ui styling.

## Why Visual Testing?

Phase 32 is replacing ALL UI with shadcn/ui components. We need to verify:

1. Every page uses shadcn/ui components (not custom Tailwind)
2. Dark mode works correctly
3. Responsive design works (mobile, tablet, desktop)
4. Accessibility is maintained
5. No visual regressions

## Test Structure

```
tests/visual/
├── README.md (this file)
├── button.spec.ts          # Button component variations
├── form.spec.ts            # Form components (Input, Select, etc.)
├── navigation.spec.ts      # Sidebar, Header, Dropdown
├── layout.spec.ts          # Main layout, responsive behavior
├── campaigns.spec.ts       # Campaign pages
├── characters.spec.ts      # Character pages
├── [entity].spec.ts        # One file per entity type
└── all-pages.spec.ts       # Screenshot every page
```

## Running Visual Tests

### Run with UI (Best for development)

```bash
bunx playwright test tests/visual --ui
```

### Run in headed mode (Watch browser)

```bash
bunx playwright test tests/visual --headed
```

### Run specific test

```bash
bunx playwright test tests/visual/button.spec.ts --headed
```

### Update screenshots (after confirming changes look good)

```bash
bunx playwright test tests/visual --update-snapshots
```

### Debug specific test

```bash
bunx playwright test tests/visual/campaigns.spec.ts --debug
```

## Test Template

```typescript
import { test, expect } from "@playwright/test";

test.describe("Component Name", () => {
  test.beforeEach(async ({ page }) => {
    // Login
    await page.goto("/login");
    await page.fill('input[name="email"]', "test@example.com");
    await page.fill('input[name="password"]', "password");
    await page.click('button[type="submit"]');
    await page.waitForURL("/dashboard");
  });

  test("should render with shadcn/ui styling", async ({ page }) => {
    await page.goto("/campaigns");

    // Verify shadcn/ui component is used
    const button = page.locator("button").first();
    await expect(button).toHaveClass(/inline-flex/); // shadcn/ui button class

    // Take screenshot
    await expect(page).toHaveScreenshot("campaigns-list.png");
  });

  test("should look good in dark mode", async ({ page }) => {
    await page.goto("/campaigns");

    // Toggle dark mode
    await page.click("[data-theme-toggle]");

    // Take screenshot
    await expect(page).toHaveScreenshot("campaigns-list-dark.png");
  });

  test("should be responsive on mobile", async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto("/campaigns");

    // Take screenshot
    await expect(page).toHaveScreenshot("campaigns-list-mobile.png");
  });
});
```

## Visual Checklist (Every Test)

Before marking any test as passing, verify:

### shadcn/ui Usage

- [ ] Component uses shadcn/ui classes (not custom Tailwind)
- [ ] Hover states work (shadcn/ui transitions)
- [ ] Focus states work (shadcn/ui ring system)
- [ ] Disabled states work (shadcn/ui opacity)

### Color & Typography

- [ ] Colors use CSS variables (--primary, --secondary, etc.)
- [ ] Typography uses shadcn/ui font sizes
- [ ] Text is readable (good contrast)
- [ ] Links use shadcn/ui link styles

### Spacing & Layout

- [ ] Spacing is consistent (shadcn/ui spacing scale)
- [ ] Borders are subtle (shadcn/ui border colors)
- [ ] Cards have proper elevation
- [ ] Layout doesn't break at any screen size

### Dark Mode

- [ ] Dark mode toggle works
- [ ] All colors adjust correctly
- [ ] No contrast issues in dark mode
- [ ] Images/icons work in dark mode

### Responsive

- [ ] Mobile (375px): All content accessible
- [ ] Tablet (768px): Layout adjusts correctly
- [ ] Desktop (1920px): Uses full width appropriately

### Accessibility

- [ ] Focus indicators visible
- [ ] Keyboard navigation works
- [ ] ARIA labels present
- [ ] Screen reader friendly

## Screenshot Comparison

Playwright will automatically compare screenshots and fail if there are differences.

### Viewing Differences

```bash
bunx playwright show-report
```

### Accepting New Screenshots

```bash
bunx playwright test tests/visual --update-snapshots
```

## Best Practices

1. **Name screenshots descriptively**: `entity-list-page.png`, not `screenshot1.png`
2. **Test common states**: default, hover, focus, disabled, error
3. **Test both themes**: light and dark mode
4. **Test multiple screen sizes**: mobile, tablet, desktop
5. **Wait for animations**: Use `await page.waitForLoadState('networkidle')`
6. **Verify component classes**: Check for shadcn/ui classes in DevTools
7. **Document expected behavior**: Add comments explaining what you're testing

## Common Pitfalls

1. **Timing issues**: Wait for content to load before screenshots
2. **Dynamic content**: Mock dates, randomness for consistent screenshots
3. **Flaky animations**: Disable animations in CI or wait for them to complete
4. **Font loading**: Wait for fonts to load before screenshots

## CI/CD Integration

Visual tests will run in CI and fail if screenshots don't match:

```yaml
# .github/workflows/test.yml
- name: Run Playwright tests
  run: bunx playwright test

- name: Upload test results
  if: failure()
  uses: actions/upload-artifact@v3
  with:
    name: playwright-report
    path: playwright-report/
```

## Example: Complete Page Test

```typescript
import { test, expect } from "@playwright/test";

test.describe("Campaign List Page", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/login");
    await page.fill('input[name="email"]', "test@example.com");
    await page.fill('input[name="password"]', "password");
    await page.click('button[type="submit"]');
    await page.waitForURL("/dashboard");
  });

  test("should use shadcn/ui Table component", async ({ page }) => {
    await page.goto("/campaigns");

    // Wait for table to load
    await page.waitForSelector("table");

    // Verify shadcn/ui table classes
    const table = page.locator("table");
    await expect(table).toHaveClass(/w-full/); // shadcn/ui table base class

    // Verify header styling
    const th = page.locator("th").first();
    await expect(th).toHaveCSS("text-align", "left");

    // Screenshot
    await expect(page).toHaveScreenshot("campaigns-table-light.png");
  });

  test("should use shadcn/ui Button for actions", async ({ page }) => {
    await page.goto("/campaigns");

    // Find "Create Campaign" button
    const createButton = page.getByRole("button", { name: /create campaign/i });

    // Verify shadcn/ui button classes
    await expect(createButton).toHaveClass(/inline-flex/);
    await expect(createButton).toHaveClass(/items-center/);
    await expect(createButton).toHaveClass(/justify-center/);

    // Test hover state
    await createButton.hover();
    await page.screenshot({ path: "create-button-hover.png" });
  });

  test("should work in dark mode", async ({ page }) => {
    await page.goto("/campaigns");

    // Find and click theme toggle
    const themeToggle = page.locator("[data-theme-toggle]");
    await themeToggle.click();

    // Wait for theme transition
    await page.waitForTimeout(300);

    // Verify dark mode active
    const html = page.locator("html");
    await expect(html).toHaveClass(/dark/);

    // Screenshot
    await expect(page).toHaveScreenshot("campaigns-table-dark.png");
  });

  test("should be responsive on mobile", async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto("/campaigns");

    // Verify mobile menu visible
    const mobileMenu = page.locator("[data-mobile-menu]");
    await expect(mobileMenu).toBeVisible();

    // Screenshot
    await expect(page).toHaveScreenshot("campaigns-mobile.png");
  });

  test("should be responsive on tablet", async ({ page }) => {
    await page.setViewportSize({ width: 768, height: 1024 });
    await page.goto("/campaigns");

    await expect(page).toHaveScreenshot("campaigns-tablet.png");
  });

  test("should be responsive on desktop", async ({ page }) => {
    await page.setViewportSize({ width: 1920, height: 1080 });
    await page.goto("/campaigns");

    await expect(page).toHaveScreenshot("campaigns-desktop.png");
  });
});
```

---

**Last Updated**: January 1, 2026  
**Status**: Template ready for Phase 32 Week 2+
