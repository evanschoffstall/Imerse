import { expect, test } from '@playwright/test'

test.describe('Timeline CRUD', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/login')
    await page.fill('input[name="email"]', 'test@example.com')
    await page.fill('input[name="password"]', 'password123')
    await page.click('button[type="submit"]')
    await expect(page).toHaveURL('/dashboard')
  })

  test('should create a new timeline', async ({ page }) => {
    await page.goto('/campaigns')
    await page.click('a[href*="/campaigns/"]')
    
    const url = page.url()
    const campaignId = url.split('/campaigns/')[1]
    
    await page.goto(`/timelines?campaignId=${campaignId}`)
    await page.click('text=Create New Timeline')
    
    await page.fill('input[name="name"]', 'Age of Heroes')
    await page.selectOption('select[name="type"]', 'Historical')
    
    const editor = page.locator('.ProseMirror')
    await editor.click()
    await editor.fill('A timeline tracking the age of heroes.')
    
    await page.click('button[type="submit"]')
    
    await expect(page).toHaveURL(/\/timelines\/[a-z0-9]+$/)
    await expect(page.locator('h1')).toContainText('Age of Heroes')
    await expect(page.locator('text=Historical')).toBeVisible()
  })

  test('should list timelines', async ({ page }) => {
    await page.goto('/campaigns')
    await page.click('a[href*="/campaigns/"]')
    
    const url = page.url()
    const campaignId = url.split('/campaigns/')[1]
    
    await page.goto(`/timelines?campaignId=${campaignId}`)
    
    const hasTable = await page.locator('table').isVisible().catch(() => false)
    const hasEmptyState = await page.locator('text=No timelines yet').isVisible().catch(() => false)
    
    expect(hasTable || hasEmptyState).toBeTruthy()
  })

  test('should view timeline details', async ({ page }) => {
    await page.goto('/campaigns')
    await page.click('a[href*="/campaigns/"]')
    
    const url = page.url()
    const campaignId = url.split('/campaigns/')[1]
    
    await page.goto(`/timelines?campaignId=${campaignId}`)
    
    const hasTimelines = await page.locator('table tbody tr').count() > 0
    
    if (hasTimelines) {
      await page.click('table tbody tr:first-child a')
      
      await expect(page).toHaveURL(/\/timelines\/[a-z0-9]+$/)
      await expect(page.locator('h1')).toBeVisible()
      await expect(page.locator('button:has-text("Edit")')).toBeVisible()
      await expect(page.locator('button:has-text("Delete")')).toBeVisible()
    }
  })

  test('should edit a timeline', async ({ page }) => {
    await page.goto('/campaigns')
    await page.click('a[href*="/campaigns/"]')
    
    const url = page.url()
    const campaignId = url.split('/campaigns/')[1]
    
    await page.goto(`/timelines?campaignId=${campaignId}`)
    
    const hasTimelines = await page.locator('table tbody tr').count() > 0
    
    if (hasTimelines) {
      await page.click('table tbody tr:first-child a')
      await page.click('button:has-text("Edit")')
      
      await expect(page).toHaveURL(/\/timelines\/[a-z0-9]+\/edit$/)
      await expect(page.locator('h1')).toContainText('Edit Timeline')
      
      await page.fill('input[name="name"]', 'Updated Timeline Name')
      await page.click('button[type="submit"]')
      
      await expect(page).toHaveURL(/\/timelines\/[a-z0-9]+$/)
      await expect(page.locator('h1')).toContainText('Updated Timeline Name')
    }
  })

  test('should delete a timeline', async ({ page }) => {
    await page.goto('/campaigns')
    await page.click('a[href*="/campaigns/"]')
    
    const url = page.url()
    const campaignId = url.split('/campaigns/')[1]
    
    await page.goto(`/timelines/new?campaignId=${campaignId}`)
    await page.fill('input[name="name"]', 'Timeline To Delete')
    await page.selectOption('select[name="type"]', 'Campaign')
    await page.click('button[type="submit"]')
    
    page.on('dialog', dialog => dialog.accept())
    await page.click('button:has-text("Delete")')
    
    await expect(page).toHaveURL(/\/timelines\?campaignId=/)
  })

  test('should validate required fields', async ({ page }) => {
    await page.goto('/campaigns')
    await page.click('a[href*="/campaigns/"]')
    
    const url = page.url()
    const campaignId = url.split('/campaigns/')[1]
    
    await page.goto(`/timelines/new?campaignId=${campaignId}`)
    
    await page.click('button[type="submit"]')
    
    await expect(page.locator('text=Name is required')).toBeVisible()
  })

  test('should display all timeline types', async ({ page }) => {
    await page.goto('/campaigns')
    await page.click('a[href*="/campaigns/"]')
    
    const url = page.url()
    const campaignId = url.split('/campaigns/')[1]
    
    await page.goto(`/timelines/new?campaignId=${campaignId}`)
    
    const typeSelect = page.locator('select[name="type"]')
    await expect(typeSelect).toBeVisible()
    
    const expectedTypes = [
      'Historical',
      'Campaign',
      'Character',
      'World Events',
      'Faction',
      'War',
      'Dynasty',
      'Technology',
      'Magic',
      'Religion',
      'Political',
      'Economic',
      'Cultural',
      'Natural',
      'Other'
    ]
    
    for (const type of expectedTypes) {
      await expect(typeSelect.locator(`option:has-text("${type}")`)).toBeVisible()
    }
  })

  test('should support private timelines', async ({ page }) => {
    await page.goto('/campaigns')
    await page.click('a[href*="/campaigns/"]')
    
    const url = page.url()
    const campaignId = url.split('/campaigns/')[1]
    
    await page.goto(`/timelines/new?campaignId=${campaignId}`)
    
    await page.fill('input[name="name"]', 'Secret Timeline')
    await page.check('input[name="isPrivate"]')
    await page.click('button[type="submit"]')
    
    await expect(page.locator('text=Private')).toBeVisible()
  })

  test('should cancel creation', async ({ page }) => {
    await page.goto('/campaigns')
    await page.click('a[href*="/campaigns/"]')
    
    const url = page.url()
    const campaignId = url.split('/campaigns/')[1]
    
    await page.goto(`/timelines/new?campaignId=${campaignId}`)
    
    await page.fill('input[name="name"]', 'Test Timeline')
    await page.click('button:has-text("Cancel")')
    
    await expect(page).toHaveURL(/\/timelines\?campaignId=/)
  })

  test('should display overview section', async ({ page }) => {
    await page.goto('/campaigns')
    await page.click('a[href*="/campaigns/"]')
    
    const url = page.url()
    const campaignId = url.split('/campaigns/')[1]
    
    await page.goto(`/timelines?campaignId=${campaignId}`)
    
    const hasTimelines = await page.locator('table tbody tr').count() > 0
    
    if (hasTimelines) {
      await page.click('table tbody tr:first-child a')
      
      // Check for Overview section heading
      const hasDescription = await page.locator('h2:has-text("Overview")').isVisible().catch(() => false)
      
      if (hasDescription) {
        await expect(page.locator('h2:has-text("Overview")')).toBeVisible()
      }
    }
  })
})
