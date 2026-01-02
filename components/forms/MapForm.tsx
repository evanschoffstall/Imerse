'use client'

import { Button } from '@/components/ui/button'
import ImageUpload from '@/components/ui/ImageUpload'
import type { Map, MapFormData } from '@/types/map'
import { MAP_TYPES } from '@/types/map'
import { zodResolver } from '@hookform/resolvers/zod'
import { EditorContent, useEditor } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import { useForm } from 'react-hook-form'
import { z } from 'zod'

const mapFormSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  type: z.string().optional(),
  description: z.string().optional(),
  image: z.string().optional(),
  isPrivate: z.boolean().default(false)
})

interface MapFormProps {
  map?: Map
  campaignId: string
  onSubmit: (data: MapFormData) => Promise<void>
  onCancel: () => void
}

const mapTypes: readonly string[] = MAP_TYPES

export default function MapForm({ map, campaignId, onSubmit, onCancel }: MapFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    setValue,
    watch
  } = useForm<MapFormData>({
    resolver: zodResolver(mapFormSchema),
    defaultValues: map ? {
      name: map.name,
      type: map.type || '',
      description: map.description || '',
      image: map.image || '',
      isPrivate: map.isPrivate
    } : {
      name: '',
      type: '',
      description: '',
      image: '',
      isPrivate: false
    }
  })

  const image = watch('image')
  const handleImageUpload = (url: string) => {
    setValue('image', url, { shouldValidate: true })
  }

  const editor = useEditor({
    extensions: [StarterKit],
    content: map?.description || '',
    editorProps: {
      attributes: {
        class: 'prose dark:prose-invert max-w-none min-h-[150px] p-4 focus:outline-none'
      }
    },
    onUpdate: ({ editor }) => {
      setValue('description', editor.getHTML())
    }
  })

  const handleFormSubmit = async (data: MapFormData) => {
    try {
      await onSubmit(data)
    } catch (error) {
      console.error('Form submission error:', error)
    }
  }

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
      <div>
        <label htmlFor="name" className="block text-sm font-medium mb-2">
          Name *
        </label>
        <input
          type="text"
          id="name"
          {...register('name')}
          className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700"
        />
        {errors.name && (
          <p className="text-red-500 text-sm mt-1">{errors.name.message}</p>
        )}
      </div>

      <div>
        <label htmlFor="type" className="block text-sm font-medium mb-2">
          Type
        </label>
        <select
          id="type"
          {...register('type')}
          className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700"
        >
          <option value="">Select a type</option>
          {mapTypes.map((type) => (
            <option key={type} value={type}>
              {type}
            </option>
          ))}
        </select>
      </div>

      <ImageUpload
        currentImage={image}
        onImageUpload={handleImageUpload}
        folder="maps"
        label="Map Image"
      />

      <div>
        <label className="block text-sm font-medium mb-2">
          Description
        </label>
        <div className="border border-gray-300 dark:border-gray-600 rounded-lg overflow-hidden">
          <EditorContent editor={editor} />
        </div>
      </div>

      <div className="flex items-center">
        <input
          type="checkbox"
          id="isPrivate"
          {...register('isPrivate')}
          className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
        />
        <label htmlFor="isPrivate" className="ml-2 text-sm">
          Private (only visible to campaign owner)
        </label>
      </div>

      <div className="flex gap-4">
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? 'Saving...' : map ? 'Update Map' : 'Create Map'}
        </Button>
        <Button type="button" onClick={onCancel} variant="secondary">
          Cancel
        </Button>
      </div>
    </form>
  )
}
