'use client'

import Button from '@/components/ui/Button'
import type { Tag, TagFormData } from '@/types/tag'
import { TAG_COLORS, TAG_TYPES } from '@/types/tag'
import { zodResolver } from '@hookform/resolvers/zod'
import { EditorContent, useEditor } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import { useForm } from 'react-hook-form'
import { z } from 'zod'

const tagFormSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  type: z.string().optional(),
  description: z.string().optional(),
  color: z.string().optional(),
  isPrivate: z.boolean().default(false)
})

interface TagFormProps {
  tag?: Tag
  campaignId: string
  onSubmit: (data: TagFormData) => Promise<void>
  onCancel: () => void
}

const tagTypes: readonly string[] = TAG_TYPES
const tagColors: readonly string[] = TAG_COLORS

export default function TagForm({ tag, campaignId, onSubmit, onCancel }: TagFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    setValue,
    watch
  } = useForm<TagFormData>({
    resolver: zodResolver(tagFormSchema),
    defaultValues: tag ? {
      name: tag.name,
      type: tag.type || '',
      description: tag.description || '',
      color: tag.color || '#3b82f6',
      isPrivate: tag.isPrivate
    } : {
      name: '',
      type: '',
      description: '',
      color: '#3b82f6',
      isPrivate: false
    }
  })

  const selectedColor = watch('color')

  const editor = useEditor({
    extensions: [StarterKit],
    content: tag?.description || '',
    editorProps: {
      attributes: {
        class: 'prose dark:prose-invert max-w-none min-h-[150px] p-4 focus:outline-none'
      }
    },
    onUpdate: ({ editor }) => {
      setValue('description', editor.getHTML())
    }
  })

  const handleFormSubmit = async (data: TagFormData) => {
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
          {tagTypes.map((type) => (
            <option key={type} value={type}>
              {type}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium mb-2">
          Color
        </label>
        <div className="flex flex-wrap gap-2">
          {tagColors.map((color) => (
            <button
              key={color}
              type="button"
              onClick={() => setValue('color', color)}
              className={`w-10 h-10 rounded-lg border-2 transition-all ${selectedColor === color
                  ? 'border-gray-900 dark:border-white scale-110'
                  : 'border-gray-300 dark:border-gray-600 hover:scale-105'
                }`}
              style={{ backgroundColor: color }}
              title={color}
            />
          ))}
        </div>
        <input type="hidden" {...register('color')} />
      </div>

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
          {isSubmitting ? 'Saving...' : tag ? 'Update Tag' : 'Create Tag'}
        </Button>
        <Button type="button" onClick={onCancel} variant="secondary">
          Cancel
        </Button>
      </div>
    </form>
  )
}
