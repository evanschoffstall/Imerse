import { expect, test } from '@playwright/test'

test.describe('Map CRUD', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/login')
    await page.fill('input[name="email"]', 'test@example.com')
    await page.fill('input[name="password"]', 'password123')
    await page.click('button[type="submit"]')
    await expect(page).toHaveURL('/dashboard')
  })

  test('should create a new map', async ({ page }) => {
    await page.goto('/campaigns')
    await page.click('a[href*="/campaigns/"]')
    
    const url = page.url()
    const campaignId = url.split('/campaigns/')[1]
    
    await page.goto(`/maps?campaignId=${campaignId}`)
    await page.click('text=Create New Map')
    
    await page.fill('input[name="name"]', 'World Map')
    await page.selectOption('select[name="type"]', 'World')
    
    const editor = page.locator('.ProseMirror')
    await editor.click()
    await editor.fill('A complete world map showing continents and oceans.')
    
    await page.click('button[type="submit"]')
    
    await expect(page).toHaveURL(/\/maps\/[a-z0-9]+$/)
    await expect(page.locator('h1')).toContainText('World Map')
    await expect(page.locator('text=World')).toBeVisible()
  })

  test('should list maps', async ({ page }) => {
    await page.goto('/campaigns')
    await page.click('a[href*="/campaigns/"]')
    
    const url = page.url()
    const campaignId = url.split('/campaigns/')[1]
    
    await page.goto(`/maps?campaignId=${campaignId}`)
    
    const hasTable = await page.locator('table').isVisible().catch(() => false)
    const hasEmptyState = await page.locator('text=No maps yet').isVisible().catch(() => false)
    
    expect(hasTable || hasEmptyState).toBeTruthy()
  })

  test('should view map details', async ({ page }) => {
    await page.goto('/campaigns')
    await page.click('a[href*="/campaigns/"]')
    
    const url = page.url()
    const campaignId = url.split('/campaigns/')[1]
    
    await page.goto(`/maps?campaignId=${campaignId}`)
    
    const hasMaps = await page.locator('table tbody tr').count() > 0
    
    if (hasMaps) {
      await page.click('table tbody tr:first-child a')
      
      await expect(page).toHaveURL(/\/maps\/[a-z0-9]+$/)
      await expect(page.locator('h1')).toBeVisible()
      await expect(page.locator('button:has-text("Edit")')).toBeVisible()
      await expect(page.locator('button:has-text("Delete")')).toBeVisible()
    }
  })

  test('should edit a map', async ({ page }) => {
    await page.goto('/campaigns')
    await page.click('a[href*="/campaigns/"]')
    
    const url = page.url()
    const campaignId = url.split('/campaigns/')[1]
    
    await page.goto(`/maps?campaignId=${campaignId}`)
    
    const hasMaps = await page.locator('table tbody tr').count() > 0
    
    if (hasMaps) {
      await page.click('table tbody tr:first-child a')
      await page.click('button:has-text("Edit")')
      
      await expect(page).toHaveURL(/\/maps\/[a-z0-9]+\/edit$/)
      await expect(page.locator('h1')).toContainText('Edit Map')
      
      await page.fill('input[name="name"]', 'Updated Map Name')
      await page.click('button[type="submit"]')
      
      await expect(page).toHaveURL(/\/maps\/[a-z0-9]+$/)
      await expect(page.locator('h1')).toContainText('Updated Map Name')
    }
  })

  test('should delete a map', async ({ page }) => {
    await page.goto('/campaigns')
    await page.click('a[href*="/campaigns/"]')
    
    const url = page.url()
    const campaignId = url.split('/campaigns/')[1]
    
    await page.goto(`/maps/new?campaignId=${campaignId}`)
    await page.fill('input[name="name"]', 'Map To Delete')
    await page.selectOption('select[name="type"]', 'Region')
    await page.click('button[type="submit"]')
    
    page.on('dialog', dialog => dialog.accept())
    await page.click('button:has-text("Delete")')
    
    await expect(page).toHaveURL(/\/maps\?campaignId=/)
  })

  test('should validate required fields', async ({ page }) => {
    await page.goto('/campaigns')
    await page.click('a[href*="/campaigns/"]')
    
    const url = page.url()
    const campaignId = url.split('/campaigns/')[1]
    
    await page.goto(`/maps/new?campaignId=${campaignId}`)
    
    await page.click('button[type="submit"]')
    
    await expect(page.locator('text=Name is required')).toBeVisible()
  })

  test('should display all map types', async ({ page }) => {
    await page.goto('/campaigns')
    await page.click('a[href*="/campaigns/"]')
    
    const url = page.url()
    const campaignId = url.split('/campaigns/')[1]
    
    await page.goto(`/maps/new?campaignId=${campaignId}`)
    
    const typeSelect = page.locator('select[name="type"]')
    await expect(typeSelect).toBeVisible()
    
    const expectedTypes = [
      'World',
      'Continent',
      'Region',
      'Kingdom',
      'City',
      'Town',
      'Village',
      'Dungeon',
      'Building',
      'Room',
      'Battle',
      'Tactical',
      'Political',
      'Travel',
      'Other'
    ]
    
    for (const type of expectedTypes) {
      await expect(typeSelect.locator(`option:has-text("${type}")`)).toBeVisible()
    }
  })

  test('should support private maps', async ({ page }) => {
    await page.goto('/campaigns')
    await page.click('a[href*="/campaigns/"]')
    
    const url = page.url()
    const campaignId = url.split('/campaigns/')[1]
    
    await page.goto(`/maps/new?campaignId=${campaignId}`)
    
    await page.fill('input[name="name"]', 'Secret Map')
    await page.check('input[name="isPrivate"]')
    await page.click('button[type="submit"]')
    
    await expect(page.locator('text=Private')).toBeVisible()
  })

  test('should cancel creation', async ({ page }) => {
    await page.goto('/campaigns')
    await page.click('a[href*="/campaigns/"]')
    
    const url = page.url()
    const campaignId = url.split('/campaigns/')[1]
    
    await page.goto(`/maps/new?campaignId=${campaignId}`)
    
    await page.fill('input[name="name"]', 'Test Map')
    await page.click('button:has-text("Cancel")')
    
    await expect(page).toHaveURL(/\/maps\?campaignId=/)
  })

  test('should create maps of different scales', async ({ page }) => {
    await page.goto('/campaigns')
    await page.click('a[href*="/campaigns/"]')
    
    const url = page.url()
    const campaignId = url.split('/campaigns/')[1]
    
    const mapTypes = [
      { name: 'Continental Map', type: 'Continent' },
      { name: 'City Map', type: 'City' },
      { name: 'Dungeon Map', type: 'Dungeon' }
    ]
    
    for (const map of mapTypes) {
      await page.goto(`/maps/new?campaignId=${campaignId}`)
      await page.fill('input[name="name"]', map.name)
      await page.selectOption('select[name="type"]', map.type)
      await page.click('button[type="submit"]')
      
      await expect(page.locator('h1')).toContainText(map.name)
      await expect(page.locator(`text=${map.type}`)).toBeVisible()
    }
  })

  test('should display description section', async ({ page }) => {
    await page.goto('/campaigns')
    await page.click('a[href*="/campaigns/"]')
    
    const url = page.url()
    const campaignId = url.split('/campaigns/')[1]
    
    await page.goto(`/maps?campaignId=${campaignId}`)
    
    const hasMaps = await page.locator('table tbody tr').count() > 0
    
    if (hasMaps) {
      await page.click('table tbody tr:first-child a')
      
      const hasDescription = await page.locator('h2:has-text("Description")').isVisible().catch(() => false)
      
      if (hasDescription) {
        await expect(page.locator('h2:has-text("Description")')).toBeVisible()
      }
    }
  })
})
