import { expect, test } from '@playwright/test'

test.describe('Tag CRUD', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/login')
    await page.fill('input[name="email"]', 'test@example.com')
    await page.fill('input[name="password"]', 'password123')
    await page.click('button[type="submit"]')
    await expect(page).toHaveURL('/dashboard')
  })

  test('should create a new tag with color', async ({ page }) => {
    await page.goto('/campaigns')
    await page.click('a[href*="/campaigns/"]')
    
    const url = page.url()
    const campaignId = url.split('/campaigns/')[1]
    
    await page.goto(`/tags?campaignId=${campaignId}`)
    await page.click('text=Create New Tag')
    
    await page.fill('input[name="name"]', 'Story Arc')
    await page.selectOption('select[name="type"]', 'Story Arc')
    
    // Select a color
    const colorButtons = page.locator('button[style*="background-color"]')
    await colorButtons.first().click()
    
    const editor = page.locator('.ProseMirror')
    await editor.click()
    await editor.fill('Important story arc tag.')
    
    await page.click('button[type="submit"]')
    
    await expect(page).toHaveURL(/\/tags\/[a-z0-9]+$/)
    await expect(page.locator('h1')).toContainText('Story Arc')
    
    // Verify color badge is displayed
    const colorBadge = page.locator('div[style*="background-color"]').first()
    await expect(colorBadge).toBeVisible()
  })

  test('should list tags with colors', async ({ page }) => {
    await page.goto('/campaigns')
    await page.click('a[href*="/campaigns/"]')
    
    const url = page.url()
    const campaignId = url.split('/campaigns/')[1]
    
    await page.goto(`/tags?campaignId=${campaignId}`)
    
    const hasTable = await page.locator('table').isVisible().catch(() => false)
    const hasEmptyState = await page.locator('text=No tags yet').isVisible().catch(() => false)
    
    expect(hasTable || hasEmptyState).toBeTruthy()
    
    if (hasTable) {
      await expect(page.locator('th:has-text("Color")')).toBeVisible()
    }
  })

  test('should view tag details', async ({ page }) => {
    await page.goto('/campaigns')
    await page.click('a[href*="/campaigns/"]')
    
    const url = page.url()
    const campaignId = url.split('/campaigns/')[1]
    
    await page.goto(`/tags?campaignId=${campaignId}`)
    
    const hasTags = await page.locator('table tbody tr').count() > 0
    
    if (hasTags) {
      await page.click('table tbody tr:first-child a')
      
      await expect(page).toHaveURL(/\/tags\/[a-z0-9]+$/)
      await expect(page.locator('h1')).toBeVisible()
      await expect(page.locator('button:has-text("Edit")')).toBeVisible()
      await expect(page.locator('button:has-text("Delete")')).toBeVisible()
    }
  })

  test('should edit a tag', async ({ page }) => {
    await page.goto('/campaigns')
    await page.click('a[href*="/campaigns/"]')
    
    const url = page.url()
    const campaignId = url.split('/campaigns/')[1]
    
    await page.goto(`/tags?campaignId=${campaignId}`)
    
    const hasTags = await page.locator('table tbody tr').count() > 0
    
    if (hasTags) {
      await page.click('table tbody tr:first-child a')
      await page.click('button:has-text("Edit")')
      
      await expect(page).toHaveURL(/\/tags\/[a-z0-9]+\/edit$/)
      await expect(page.locator('h1')).toContainText('Edit Tag')
      
      await page.fill('input[name="name"]', 'Updated Tag Name')
      await page.click('button[type="submit"]')
      
      await expect(page).toHaveURL(/\/tags\/[a-z0-9]+$/)
      await expect(page.locator('h1')).toContainText('Updated Tag Name')
    }
  })

  test('should delete a tag', async ({ page }) => {
    await page.goto('/campaigns')
    await page.click('a[href*="/campaigns/"]')
    
    const url = page.url()
    const campaignId = url.split('/campaigns/')[1]
    
    await page.goto(`/tags/new?campaignId=${campaignId}`)
    await page.fill('input[name="name"]', 'Tag To Delete')
    await page.selectOption('select[name="type"]', 'Character')
    await page.click('button[type="submit"]')
    
    page.on('dialog', dialog => dialog.accept())
    await page.click('button:has-text("Delete")')
    
    await expect(page).toHaveURL(/\/tags\?campaignId=/)
  })

  test('should validate required fields', async ({ page }) => {
    await page.goto('/campaigns')
    await page.click('a[href*="/campaigns/"]')
    
    const url = page.url()
    const campaignId = url.split('/campaigns/')[1]
    
    await page.goto(`/tags/new?campaignId=${campaignId}`)
    
    await page.click('button[type="submit"]')
    
    await expect(page.locator('text=Name is required')).toBeVisible()
  })

  test('should display all 13 color options', async ({ page }) => {
    await page.goto('/campaigns')
    await page.click('a[href*="/campaigns/"]')
    
    const url = page.url()
    const campaignId = url.split('/campaigns/')[1]
    
    await page.goto(`/tags/new?campaignId=${campaignId}`)
    
    // Count color buttons
    const colorButtons = page.locator('button[style*="background-color"]')
    const count = await colorButtons.count()
    
    expect(count).toBe(13)
  })

  test('should display all tag types', async ({ page }) => {
    await page.goto('/campaigns')
    await page.click('a[href*="/campaigns/"]')
    
    const url = page.url()
    const campaignId = url.split('/campaigns/')[1]
    
    await page.goto(`/tags/new?campaignId=${campaignId}`)
    
    const typeSelect = page.locator('select[name="type"]')
    await expect(typeSelect).toBeVisible()
    
    const expectedTypes = [
      'Character',
      'Location',
      'Story Arc',
      'Theme',
      'Faction',
      'Magic',
      'Technology',
      'Religion',
      'Culture',
      'Event',
      'Combat',
      'NPC',
      'Player',
      'Other'
    ]
    
    for (const type of expectedTypes) {
      await expect(typeSelect.locator(`option:has-text("${type}")`)).toBeVisible()
    }
  })

  test('should support private tags', async ({ page }) => {
    await page.goto('/campaigns')
    await page.click('a[href*="/campaigns/"]')
    
    const url = page.url()
    const campaignId = url.split('/campaigns/')[1]
    
    await page.goto(`/tags/new?campaignId=${campaignId}`)
    
    await page.fill('input[name="name"]', 'Private Tag')
    await page.check('input[name="isPrivate"]')
    await page.click('button[type="submit"]')
    
    await expect(page.locator('text=Private')).toBeVisible()
  })

  test('should change color selection', async ({ page }) => {
    await page.goto('/campaigns')
    await page.click('a[href*="/campaigns/"]')
    
    const url = page.url()
    const campaignId = url.split('/campaigns/')[1]
    
    await page.goto(`/tags/new?campaignId=${campaignId}`)
    
    const colorButtons = page.locator('button[style*="background-color"]')
    
    // Click first color
    await colorButtons.first().click()
    
    // First color should have scale-110 class
    const firstButton = colorButtons.first()
    await expect(firstButton).toHaveClass(/scale-110/)
    
    // Click second color
    await colorButtons.nth(1).click()
    
    // Second color should now have scale-110 class
    const secondButton = colorButtons.nth(1)
    await expect(secondButton).toHaveClass(/scale-110/)
  })

  test('should cancel creation', async ({ page }) => {
    await page.goto('/campaigns')
    await page.click('a[href*="/campaigns/"]')
    
    const url = page.url()
    const campaignId = url.split('/campaigns/')[1]
    
    await page.goto(`/tags/new?campaignId=${campaignId}`)
    
    await page.fill('input[name="name"]', 'Test Tag')
    await page.click('button:has-text("Cancel")')
    
    await expect(page).toHaveURL(/\/tags\?campaignId=/)
  })
})
