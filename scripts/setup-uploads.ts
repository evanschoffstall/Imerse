#!/usr/bin/env bun

/**
 * Setup script to initialize upload directories for image storage
 * Run: bun run scripts/setup-uploads.ts
 */

import { existsSync } from 'fs'
import { mkdir } from 'fs/promises'
import path from 'path'

const UPLOAD_DIR = path.join(process.cwd(), 'public', 'uploads')

const folders = [
  'campaigns',
  'characters',
  'locations',
  'locations/maps',
  'items',
  'quests',
  'events',
  'journals',
  'notes',
  'families',
  'races',
  'organisations',
  'timelines',
  'maps',
  'general',
]

async function setupUploadDirectories() {
  console.log('🔧 Setting up upload directories...\n')

  for (const folder of folders) {
    const folderPath = path.join(UPLOAD_DIR, folder)
    
    if (existsSync(folderPath)) {
      console.log(`✓ ${folder} (exists)`)
    } else {
      await mkdir(folderPath, { recursive: true })
      console.log(`✓ ${folder} (created)`)
    }
  }

  console.log('\n✅ Upload directories ready!')
  console.log(`📁 Location: ${UPLOAD_DIR}`)
}

setupUploadDirectories().catch((error) => {
  console.error('❌ Error setting up directories:', error)
  process.exit(1)
})
