import { randomBytes } from 'crypto'
import { existsSync } from 'fs'
import { mkdir, unlink, writeFile } from 'fs/promises'
import path from 'path'
import sharp from 'sharp'

const UPLOAD_DIR = path.join(process.cwd(), 'public', 'uploads')
const MAX_FILE_SIZE = 10 * 1024 * 1024 // 10MB
const MAX_DIMENSION = 1200

/**
 * Upload and optimize an image to the local file system
 * @param file - The file to upload
 * @param folder - Subfolder within uploads (e.g., 'campaigns', 'characters')
 * @returns The relative URL path to the uploaded file
 */
export async function uploadImage(
  file: File,
  folder: string = 'general'
): Promise<string> {
  // Validate file size
  if (file.size > MAX_FILE_SIZE) {
    throw new Error(`File size exceeds ${MAX_FILE_SIZE / 1024 / 1024}MB limit`)
  }

  // Validate file type
  const validTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif']
  if (!validTypes.includes(file.type)) {
    throw new Error('Invalid file type. Only JPG, PNG, WebP, and GIF are allowed.')
  }

  // Create folder if it doesn't exist
  const folderPath = path.join(UPLOAD_DIR, folder)
  if (!existsSync(folderPath)) {
    await mkdir(folderPath, { recursive: true })
  }

  // Generate unique filename
  const ext = 'webp' // Always convert to WebP for optimal compression
  const filename = `${Date.now()}-${randomBytes(8).toString('hex')}.${ext}`
  const filePath = path.join(folderPath, filename)

  // Read file buffer
  const arrayBuffer = await file.arrayBuffer()
  const buffer = Buffer.from(arrayBuffer)

  // Optimize image with Sharp
  const optimizedBuffer = await sharp(buffer)
    .resize(MAX_DIMENSION, MAX_DIMENSION, {
      fit: 'inside',
      withoutEnlargement: true,
    })
    .webp({ quality: 80 })
    .toBuffer()

  // Write to file system
  await writeFile(filePath, optimizedBuffer)

  // Return relative URL path
  return `/uploads/${folder}/${filename}`
}

/**
 * Delete an image from the local file system
 * @param imagePath - The relative URL path (e.g., '/uploads/campaigns/123.webp')
 */
export async function deleteImage(imagePath: string): Promise<void> {
  if (!imagePath.startsWith('/uploads/')) {
    throw new Error('Invalid image path')
  }

  const filePath = path.join(process.cwd(), 'public', imagePath)
  
  if (existsSync(filePath)) {
    await unlink(filePath)
  }
}

/**
 * Get the absolute file system path for an image
 * @param imagePath - The relative URL path
 * @returns Absolute file system path
 */
export function getImagePath(imagePath: string): string {
  if (!imagePath.startsWith('/uploads/')) {
    throw new Error('Invalid image path')
  }
  
  return path.join(process.cwd(), 'public', imagePath)
}

/**
 * Check if an image exists
 * @param imagePath - The relative URL path
 * @returns True if the image exists
 */
export function imageExists(imagePath: string): boolean {
  try {
    return existsSync(getImagePath(imagePath))
  } catch {
    return false
  }
}

/**
 * Create all upload directories
 */
export async function initializeUploadDirectories(): Promise<void> {
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

  for (const folder of folders) {
    const folderPath = path.join(UPLOAD_DIR, folder)
    if (!existsSync(folderPath)) {
      await mkdir(folderPath, { recursive: true })
    }
  }
}
