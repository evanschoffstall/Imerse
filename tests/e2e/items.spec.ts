import { expect, test } from '@playwright/test'

test.describe('Item CRUD', () => {
  test.beforeEach(async ({ page }) => {
    // Login
    await page.goto('/login')
    await page.getByLabel('Email').fill('test@example.com')
    await page.getByLabel('Password').fill('password123')
    await page.getByRole('button', { name: 'Sign In' }).click()
    await expect(page).toHaveURL('/dashboard')

    // Navigate to campaigns
    await page.goto('/campaigns')
    
    // Create or select a test campaign
    const testCampaignExists = await page.getByRole('link', { name: 'Test Campaign' }).isVisible().catch(() => false)
    
    if (!testCampaignExists) {
      await page.getByRole('button', { name: 'Create New Campaign' }).click()
      await page.getByLabel('Name', { exact: true }).fill('Test Campaign')
      await page.getByLabel('Type').selectOption('Fantasy')
      await page.getByRole('button', { name: 'Create Campaign' }).click()
      await expect(page.getByText('Campaign created successfully')).toBeVisible()
    }
    
    // Click on the test campaign
    await page.getByRole('link', { name: 'Test Campaign' }).click()
  })

  test('should create a new item', async ({ page }) => {
    // Navigate to items list
    const campaignId = page.url().split('/').pop()
    await page.goto(`/items?campaignId=${campaignId}`)
    
    // Click create new item
    await page.getByRole('button', { name: 'Create New Item' }).click()
    
    // Fill form
    await page.getByLabel('Name', { exact: true }).fill('Sword of Testing')
    await page.getByLabel('Type').selectOption('Weapon')
    await page.getByLabel('Size').selectOption('Medium')
    await page.getByLabel('Price').fill('500 gold')
    
    // Fill description
    const editor = page.locator('.tiptap')
    await editor.click()
    await editor.fill('A legendary sword forged for testing purposes.')
    
    // Submit
    await page.getByRole('button', { name: 'Create Item' }).click()
    
    // Verify redirect and success
    await expect(page).toHaveURL(/\/items\/[a-z0-9]+/)
    await expect(page.getByText('Item created successfully')).toBeVisible()
    await expect(page.getByRole('heading', { name: 'Sword of Testing' })).toBeVisible()
  })

  test('should display items in a list', async ({ page }) => {
    const campaignId = page.url().split('/').pop()
    await page.goto(`/items?campaignId=${campaignId}`)
    
    // Wait for list to load
    await expect(page.getByRole('heading', { name: 'Items' })).toBeVisible()
    
    // Should have table headers
    await expect(page.getByText('Name')).toBeVisible()
    await expect(page.getByText('Type')).toBeVisible()
    await expect(page.getByText('Price')).toBeVisible()
  })

  test('should view item details', async ({ page }) => {
    const campaignId = page.url().split('/').pop()
    await page.goto(`/items?campaignId=${campaignId}`)
    
    // Click on the first item
    await page.getByRole('link', { name: 'Sword of Testing' }).click()
    
    // Verify details page
    await expect(page.getByRole('heading', { name: 'Sword of Testing' })).toBeVisible()
    await expect(page.getByText('Weapon')).toBeVisible()
    await expect(page.getByText('500 gold')).toBeVisible()
    await expect(page.getByText('A legendary sword forged for testing purposes.')).toBeVisible()
  })

  test('should edit an item', async ({ page }) => {
    const campaignId = page.url().split('/').pop()
    await page.goto(`/items?campaignId=${campaignId}`)
    
    // Click on the first item
    await page.getByRole('link', { name: 'Sword of Testing' }).click()
    
    // Click edit button
    await page.getByRole('button', { name: 'Edit' }).click()
    
    // Update name
    await page.getByLabel('Name', { exact: true }).fill('Updated Sword')
    await page.getByLabel('Price').fill('750 gold')
    
    // Submit
    await page.getByRole('button', { name: 'Update Item' }).click()
    
    // Verify update
    await expect(page.getByText('Item updated successfully')).toBeVisible()
    await expect(page.getByRole('heading', { name: 'Updated Sword' })).toBeVisible()
    await expect(page.getByText('750 gold')).toBeVisible()
  })

  test('should delete an item', async ({ page }) => {
    const campaignId = page.url().split('/').pop()
    await page.goto(`/items?campaignId=${campaignId}`)
    
    // Click on the first item
    await page.getByRole('link', { name: 'Updated Sword' }).click()
    
    // Click delete button
    page.on('dialog', dialog => dialog.accept())
    await page.getByRole('button', { name: 'Delete' }).click()
    
    // Verify redirect
    await expect(page).toHaveURL(/\/items\?campaignId=/)
    await expect(page.getByText('Item deleted successfully')).toBeVisible()
    
    // Verify item is not in list
    await expect(page.getByRole('link', { name: 'Updated Sword' })).not.toBeVisible()
  })

  test('should validate required fields', async ({ page }) => {
    const campaignId = page.url().split('/').pop()
    await page.goto(`/items/new?campaignId=${campaignId}`)
    
    // Submit empty form
    await page.getByRole('button', { name: 'Create Item' }).click()
    
    // Should show validation errors
    await expect(page.getByText('Name is required')).toBeVisible()
  })

  test('should create item with all fields', async ({ page }) => {
    const campaignId = page.url().split('/').pop()
    await page.goto(`/items/new?campaignId=${campaignId}`)
    
    // Fill all fields
    await page.getByLabel('Name', { exact: true }).fill('Complete Item')
    await page.getByLabel('Type').selectOption('Armor')
    await page.getByLabel('Size').selectOption('Large')
    await page.getByLabel('Price').fill('1000 gold')
    await page.getByLabel('Location').fill('Treasure Vault')
    await page.getByLabel('Character Owner').fill('Aragorn')
    await page.getByLabel('Image URL').fill('https://example.com/armor.jpg')
    
    // Set private
    await page.getByLabel('Private').check()
    
    // Fill description
    const editor = page.locator('.tiptap')
    await editor.click()
    await editor.fill('A complete set of armor with all properties.')
    
    // Submit
    await page.getByRole('button', { name: 'Create Item' }).click()
    
    // Verify all fields
    await expect(page.getByText('Item created successfully')).toBeVisible()
    await expect(page.getByRole('heading', { name: 'Complete Item' })).toBeVisible()
    await expect(page.getByText('Armor')).toBeVisible()
    await expect(page.getByText('Large')).toBeVisible()
    await expect(page.getByText('1000 gold')).toBeVisible()
    await expect(page.getByText('Treasure Vault')).toBeVisible()
    await expect(page.getByText('Aragorn')).toBeVisible()
    await expect(page.getByText('Private')).toBeVisible()
  })

  test('should filter items by type', async ({ page }) => {
    const campaignId = page.url().split('/').pop()
    
    // Create items of different types
    await page.goto(`/items/new?campaignId=${campaignId}`)
    await page.getByLabel('Name', { exact: true }).fill('Health Potion')
    await page.getByLabel('Type').selectOption('Potion')
    await page.getByRole('button', { name: 'Create Item' }).click()
    await expect(page.getByText('Item created successfully')).toBeVisible()
    
    await page.goto(`/items/new?campaignId=${campaignId}`)
    await page.getByLabel('Name', { exact: true }).fill('Magic Scroll')
    await page.getByLabel('Type').selectOption('Scroll')
    await page.getByRole('button', { name: 'Create Item' }).click()
    await expect(page.getByText('Item created successfully')).toBeVisible()
    
    // Go to list
    await page.goto(`/items?campaignId=${campaignId}`)
    
    // Verify both items are visible
    await expect(page.getByRole('link', { name: 'Health Potion' })).toBeVisible()
    await expect(page.getByRole('link', { name: 'Magic Scroll' })).toBeVisible()
  })

  test('should handle empty state', async ({ page }) => {
    // Create a new campaign to ensure empty state
    await page.goto('/campaigns')
    await page.getByRole('button', { name: 'Create New Campaign' }).click()
    await page.getByLabel('Name', { exact: true }).fill('Empty Campaign')
    await page.getByLabel('Type').selectOption('Science Fiction')
    await page.getByRole('button', { name: 'Create Campaign' }).click()
    
    const campaignId = page.url().split('/').pop()
    await page.goto(`/items?campaignId=${campaignId}`)
    
    // Should show empty state
    await expect(page.getByText('No items yet')).toBeVisible()
    await expect(page.getByRole('button', { name: 'Create Item' })).toBeVisible()
  })

  test('should toggle privacy setting', async ({ page }) => {
    const campaignId = page.url().split('/').pop()
    await page.goto(`/items/new?campaignId=${campaignId}`)
    
    // Create private item
    await page.getByLabel('Name', { exact: true }).fill('Secret Item')
    await page.getByLabel('Type').selectOption('Quest Item')
    await page.getByLabel('Private').check()
    await page.getByRole('button', { name: 'Create Item' }).click()
    
    // Verify private badge
    await expect(page.getByText('Private')).toBeVisible()
    
    // Edit to make public
    await page.getByRole('button', { name: 'Edit' }).click()
    await page.getByLabel('Private').uncheck()
    await page.getByRole('button', { name: 'Update Item' }).click()
    
    // Verify no private badge
    await expect(page.getByText('Private')).not.toBeVisible()
  })

  test('should handle different item sizes', async ({ page }) => {
    const campaignId = page.url().split('/').pop()
    const sizes = ['Tiny', 'Small', 'Medium', 'Large', 'Huge']
    
    for (const size of sizes) {
      await page.goto(`/items/new?campaignId=${campaignId}`)
      await page.getByLabel('Name', { exact: true }).fill(`${size} Item`)
      await page.getByLabel('Type').selectOption('Container')
      await page.getByLabel('Size').selectOption(size)
      await page.getByRole('button', { name: 'Create Item' }).click()
      
      // Verify size
      await expect(page.getByText(size)).toBeVisible()
    }
  })

  test('should cancel item creation', async ({ page }) => {
    const campaignId = page.url().split('/').pop()
    await page.goto(`/items/new?campaignId=${campaignId}`)
    
    // Fill some fields
    await page.getByLabel('Name', { exact: true }).fill('Cancelled Item')
    
    // Click cancel
    await page.getByRole('button', { name: 'Cancel' }).click()
    
    // Should redirect to list
    await expect(page).toHaveURL(`/items?campaignId=${campaignId}`)
    
    // Item should not be created
    await expect(page.getByRole('link', { name: 'Cancelled Item' })).not.toBeVisible()
  })

  test('should display item owner correctly', async ({ page }) => {
    const campaignId = page.url().split('/').pop()
    await page.goto(`/items/new?campaignId=${campaignId}`)
    
    // Create item with character owner
    await page.getByLabel('Name', { exact: true }).fill('Owned Weapon')
    await page.getByLabel('Type').selectOption('Weapon')
    await page.getByLabel('Character Owner').fill('Gandalf')
    await page.getByRole('button', { name: 'Create Item' }).click()
    
    // Verify owner in detail page
    await expect(page.getByText('Gandalf')).toBeVisible()
    
    // Go to list
    await page.goto(`/items?campaignId=${campaignId}`)
    
    // Verify owner in table
    const row = page.locator('tr', { hasText: 'Owned Weapon' })
    await expect(row.getByText('Gandalf')).toBeVisible()
  })
})
