'use client'

import { ImageIcon, Upload, X } from 'lucide-react'
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
    <div className="space-y-2">
      {preview ? (
        <div className="space-y-3">
          <div className="relative w-full aspect-video rounded-md overflow-hidden border bg-muted">
            <Image
              src={preview}
              alt="Preview"
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, 400px"
            />
          </div>
          <div className="flex gap-2">
            <Button
              type="button"
              onClick={handleButtonClick}
              disabled={uploading}
              variant="outline"
              size="sm"
              className="gap-2"
            >
              <Upload className="h-4 w-4" />
              {uploading ? 'Uploading...' : 'Change'}
            </Button>
            <Button
              type="button"
              onClick={handleRemove}
              disabled={uploading}
              variant="outline"
              size="sm"
              className="gap-2 text-destructive hover:text-destructive"
            >
              <X className="h-4 w-4" />
              Remove
            </Button>
          </div>
        </div>
      ) : (
        <button
          type="button"
          onClick={handleButtonClick}
          disabled={uploading}
          className="relative w-full aspect-video rounded-md border-2 border-dashed border-muted-foreground/25 hover:border-muted-foreground/50 transition-colors flex flex-col items-center justify-center gap-2 bg-muted/50 hover:bg-muted group disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <ImageIcon className="h-10 w-10 text-muted-foreground/50 group-hover:text-muted-foreground/75 transition-colors" />
          <div className="text-center">
            <p className="text-sm font-medium text-muted-foreground group-hover:text-foreground transition-colors">
              {uploading ? 'Uploading...' : 'Click to upload'}
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              JPG, PNG, WebP or GIF (max 5MB)
            </p>
          </div>
        </button>
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
