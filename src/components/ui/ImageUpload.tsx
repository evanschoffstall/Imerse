'use client'

import Image from 'next/image'
import { ChangeEvent, useRef, useState } from 'react'
import { toast } from 'sonner'
import { Button } from './button'

interface ImageUploadProps {
  currentImage?: string
  onImageUpload: (url: string) => void
  folder?: string
  label?: string
}

export default function ImageUpload({
  currentImage,
  onImageUpload,
  folder = 'imerse',
  label = 'Image'
}: ImageUploadProps) {
  const [uploading, setUploading] = useState(false)
  const [preview, setPreview] = useState<string | null>(currentImage || null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileChange = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Validate file type
    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif']
    if (!validTypes.includes(file.type)) {
      toast.error('Invalid file type. Only JPG, PNG, WebP, and GIF are allowed.')
      return
    }

    // Validate file size (5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error('File too large. Maximum size is 5MB.')
      return
    }

    // Show preview
    const reader = new FileReader()
    reader.onloadend = () => {
      setPreview(reader.result as string)
    }
    reader.readAsDataURL(file)

    // Upload to server
    setUploading(true)
    try {
      const formData = new FormData()
      formData.append('file', file)
      formData.append('folder', folder)

      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Upload failed')
      }

      const data = await response.json()
      onImageUpload(data.url)
      toast.success('Image uploaded successfully')
    } catch (error) {
      console.error('Upload error:', error)
      toast.error(error instanceof Error ? error.message : 'Failed to upload image')
      setPreview(currentImage || null)
    } finally {
      setUploading(false)
    }
  }

  const handleRemove = () => {
    setPreview(null)
    onImageUpload('')
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const handleButtonClick = () => {
    fileInputRef.current?.click()
  }

  return (
    <div className="space-y-4">
      <label className="block text-sm font-medium mb-2">
        {label}
      </label>

      {preview ? (
        <div className="relative w-full max-w-md">
          <div className="relative aspect-video rounded-lg overflow-hidden bg-gray-100 dark:bg-gray-800">
            <Image
              src={preview}
              alt="Preview"
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, 400px"
            />
          </div>
          <div className="flex gap-2 mt-2">
            <Button
              type="button"
              onClick={handleButtonClick}
              disabled={uploading}
              variant="secondary"
              size="sm"
            >
              {uploading ? 'Uploading...' : 'Change Image'}
            </Button>
            <Button
              type="button"
              onClick={handleRemove}
              disabled={uploading}
              variant="destructive"
              size="sm"
            >
              Remove
            </Button>
          </div>
        </div>
      ) : (
        <div className="w-full max-w-md">
          <button
            type="button"
            onClick={handleButtonClick}
            disabled={uploading}
            className="w-full aspect-video border-2 border-dashed border-border rounded-lg flex flex-col items-center justify-center hover:border-blue-500 dark:hover:border-blue-400 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <svg
              className="w-12 h-12 text-gray-400 mb-2"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
              />
            </svg>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              {uploading ? 'Uploading...' : 'Click to upload image'}
            </p>
            <p className="text-xs text-muted-foreground dark:text-muted-foreground mt-1">
              JPG, PNG, WebP, or GIF (max 5MB)
            </p>
          </button>
        </div>
      )}

      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/jpg,image/png,image/webp,image/gif"
        onChange={handleFileChange}
        className="hidden"
      />
    </div>
  )
}
