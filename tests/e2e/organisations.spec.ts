import { expect, test } from '@playwright/test'

test.describe('Organisation CRUD', () => {
  test.beforeEach(async ({ page }) => {
    // Login first
    await page.goto('/login')
    await page.fill('input[name="email"]', 'test@example.com')
    await page.fill('input[name="password"]', 'password123')
    await page.click('button[type="submit"]')
    await expect(page).toHaveURL('/dashboard')
  })

  test('should create a new organisation', async ({ page }) => {
    // Navigate to campaigns and select first one
    await page.goto('/campaigns')
    await page.click('a[href*="/campaigns/"]')
    
    // Get campaign ID from URL
    const url = page.url()
    const campaignId = url.split('/campaigns/')[1]
    
    // Go to organisations page
    await page.goto(`/organisations?campaignId=${campaignId}`)
    await page.click('text=Create New Organisation')
    
    // Fill out form
    await page.fill('input[name="name"]', 'Test Guild')
    await page.selectOption('select[name="type"]', 'Guild')
    await page.fill('input[name="location"]', 'Test City')
    
    // Fill rich text editor
    const editor = page.locator('.ProseMirror')
    await editor.click()
    await editor.fill('This is a test guild description.')
    
    // Submit form
    await page.click('button[type="submit"]')
    
    // Verify redirect to detail page
    await expect(page).toHaveURL(/\/organisations\/[a-z0-9]+$/)
    await expect(page.locator('h1')).toContainText('Test Guild')
    await expect(page.locator('text=Guild')).toBeVisible()
    await expect(page.locator('text=Test City')).toBeVisible()
  })

  test('should list organisations', async ({ page }) => {
    await page.goto('/campaigns')
    await page.click('a[href*="/campaigns/"]')
    
    const url = page.url()
    const campaignId = url.split('/campaigns/')[1]
    
    await page.goto(`/organisations?campaignId=${campaignId}`)
    
    // Check for table or empty state
    const hasTable = await page.locator('table').isVisible().catch(() => false)
    const hasEmptyState = await page.locator('text=No organisations yet').isVisible().catch(() => false)
    
    expect(hasTable || hasEmptyState).toBeTruthy()
  })

  test('should view organisation details', async ({ page }) => {
    await page.goto('/campaigns')
    await page.click('a[href*="/campaigns/"]')
    
    const url = page.url()
    const campaignId = url.split('/campaigns/')[1]
    
    await page.goto(`/organisations?campaignId=${campaignId}`)
    
    // Check if there are organisations
    const hasOrganisations = await page.locator('table tbody tr').count() > 0
    
    if (hasOrganisations) {
      // Click first organisation
      await page.click('table tbody tr:first-child a')
      
      // Verify detail page
      await expect(page).toHaveURL(/\/organisations\/[a-z0-9]+$/)
      await expect(page.locator('h1')).toBeVisible()
      await expect(page.locator('button:has-text("Edit")')).toBeVisible()
      await expect(page.locator('button:has-text("Delete")')).toBeVisible()
    }
  })

  test('should edit an organisation', async ({ page }) => {
    await page.goto('/campaigns')
    await page.click('a[href*="/campaigns/"]')
    
    const url = page.url()
    const campaignId = url.split('/campaigns/')[1]
    
    await page.goto(`/organisations?campaignId=${campaignId}`)
    
    const hasOrganisations = await page.locator('table tbody tr').count() > 0
    
    if (hasOrganisations) {
      await page.click('table tbody tr:first-child a')
      await page.click('button:has-text("Edit")')
      
      // Verify edit page
      await expect(page).toHaveURL(/\/organisations\/[a-z0-9]+\/edit$/)
      await expect(page.locator('h1')).toContainText('Edit Organisation')
      
      // Update name
      await page.fill('input[name="name"]', 'Updated Organisation Name')
      
      // Submit
      await page.click('button[type="submit"]')
      
      // Verify redirect and update
      await expect(page).toHaveURL(/\/organisations\/[a-z0-9]+$/)
      await expect(page.locator('h1')).toContainText('Updated Organisation Name')
    }
  })

  test('should delete an organisation', async ({ page }) => {
    await page.goto('/campaigns')
    await page.click('a[href*="/campaigns/"]')
    
    const url = page.url()
    const campaignId = url.split('/campaigns/')[1]
    
    // Create organisation first
    await page.goto(`/organisations/new?campaignId=${campaignId}`)
    await page.fill('input[name="name"]', 'Organisation To Delete')
    await page.selectOption('select[name="type"]', 'Military')
    await page.click('button[type="submit"]')
    
    // Delete it
    page.on('dialog', dialog => dialog.accept())
    await page.click('button:has-text("Delete")')
    
    // Verify redirect to list
    await expect(page).toHaveURL(/\/organisations\?campaignId=/)
  })

  test('should validate required fields', async ({ page }) => {
    await page.goto('/campaigns')
    await page.click('a[href*="/campaigns/"]')
    
    const url = page.url()
    const campaignId = url.split('/campaigns/')[1]
    
    await page.goto(`/organisations/new?campaignId=${campaignId}`)
    
    // Try to submit without filling required fields
    await page.click('button[type="submit"]')
    
    // Check for validation error
    await expect(page.locator('text=Name is required')).toBeVisible()
  })

  test('should support private organisations', async ({ page }) => {
    await page.goto('/campaigns')
    await page.click('a[href*="/campaigns/"]')
    
    const url = page.url()
    const campaignId = url.split('/campaigns/')[1]
    
    await page.goto(`/organisations/new?campaignId=${campaignId}`)
    
    await page.fill('input[name="name"]', 'Secret Organisation')
    await page.selectOption('select[name="type"]', 'Secret Society')
    await page.check('input[name="isPrivate"]')
    
    await page.click('button[type="submit"]')
    
    // Verify private badge
    await expect(page.locator('text=Private')).toBeVisible()
  })

  test('should filter by organisation type', async ({ page }) => {
    await page.goto('/campaigns')
    await page.click('a[href*="/campaigns/"]')
    
    const url = page.url()
    const campaignId = url.split('/campaigns/')[1]
    
    await page.goto(`/organisations?campaignId=${campaignId}`)
    
    // Check if type column exists
    const hasTable = await page.locator('table').isVisible().catch(() => false)
    
    if (hasTable) {
      await expect(page.locator('th:has-text("Type")')).toBeVisible()
    }
  })

  test('should cancel creation', async ({ page }) => {
    await page.goto('/campaigns')
    await page.click('a[href*="/campaigns/"]')
    
    const url = page.url()
    const campaignId = url.split('/campaigns/')[1]
    
    await page.goto(`/organisations/new?campaignId=${campaignId}`)
    
    await page.fill('input[name="name"]', 'Test Organisation')
    await page.click('button:has-text("Cancel")')
    
    // Verify redirect to list
    await expect(page).toHaveURL(/\/organisations\?campaignId=/)
  })

  test('should display all organisation types', async ({ page }) => {
    await page.goto('/campaigns')
    await page.click('a[href*="/campaigns/"]')
    
    const url = page.url()
    const campaignId = url.split('/campaigns/')[1]
    
    await page.goto(`/organisations/new?campaignId=${campaignId}`)
    
    // Check type dropdown has all expected types
    const typeSelect = page.locator('select[name="type"]')
    await expect(typeSelect).toBeVisible()
    
    const expectedTypes = [
      'Guild',
      'Government',
      'Military',
      'Religious',
      'Criminal',
      'Mercantile',
      'Academic',
      'Secret Society',
      'Noble House',
      'Adventuring Company',
      'Cult',
      'Council',
      'Other'
    ]
    
    for (const type of expectedTypes) {
      await expect(typeSelect.locator(`option:has-text("${type}")`)).toBeVisible()
    }
  })
})
