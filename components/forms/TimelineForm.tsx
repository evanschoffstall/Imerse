'use client'

import { Button } from '@/components/ui/button'
import ImageUpload from '@/components/ui/ImageUpload'
import type { Timeline, TimelineFormData } from '@/types/timeline'
import { TIMELINE_TYPES } from '@/types/timeline'
import { zodResolver } from '@hookform/resolvers/zod'
import { EditorContent, useEditor } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import { useForm } from 'react-hook-form'
import { z } from 'zod'

const timelineFormSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  type: z.string().optional(),
  description: z.string().optional(),
  image: z.string().optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  isPrivate: z.boolean().default(false)
})

interface TimelineFormProps {
  timeline?: Timeline
  campaignId: string
  onSubmit: (data: TimelineFormData) => Promise<void>
  onCancel: () => void
}

const timelineTypes: readonly string[] = TIMELINE_TYPES

export default function TimelineForm({ timeline, campaignId, onSubmit, onCancel }: TimelineFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    setValue,
    watch
  } = useForm<TimelineFormData>({
    resolver: zodResolver(timelineFormSchema),
    defaultValues: timeline ? {
      name: timeline.name,
      type: timeline.type || '',
      description: timeline.description || '',
      image: timeline.image || '',
      startDate: timeline.startDate || '',
      endDate: timeline.endDate || '',
      isPrivate: timeline.isPrivate
    } : {
      name: '',
      type: '',
      description: '',
      image: '',
      startDate: '',
      endDate: '',
      isPrivate: false
    }
  })

  const image = watch('image')
  const handleImageUpload = (url: string) => {
    setValue('image', url, { shouldValidate: true })
  }

  const editor = useEditor({
    extensions: [StarterKit],
    content: timeline?.description || '',
    editorProps: {
      attributes: {
        class: 'prose dark:prose-invert max-w-none min-h-[150px] p-4 focus:outline-none'
      }
    },
    onUpdate: ({ editor }) => {
      setValue('description', editor.getHTML())
    }
  })

  const handleFormSubmit = async (data: TimelineFormData) => {
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
          {timelineTypes.map((type) => (
            <option key={type} value={type}>
              {type}
            </option>
          ))}
        </select>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label htmlFor="startDate" className="block text-sm font-medium mb-2">
            Start Date (Optional)
          </label>
          <input
            type="text"
            id="startDate"
            {...register('startDate')}
            placeholder="e.g., Year 1000, Ancient Era"
            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700"
          />
          <p className="text-xs text-gray-500 mt-1">Flexible format</p>
        </div>
        <div>
          <label htmlFor="endDate" className="block text-sm font-medium mb-2">
            End Date (Optional)
          </label>
          <input
            type="text"
            id="endDate"
            {...register('endDate')}
            placeholder="e.g., Year 2000, Modern Era"
            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700"
          />
          <p className="text-xs text-gray-500 mt-1">Flexible format</p>
        </div>
      </div>

      <ImageUpload
        currentImage={image}
        onImageUpload={handleImageUpload}
        folder="timelines"
        label="Timeline Image"
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
          {isSubmitting ? 'Saving...' : timeline ? 'Update Timeline' : 'Create Timeline'}
        </Button>
        <Button type="button" onClick={onCancel} variant="secondary">
          Cancel
        </Button>
      </div>
    </form>
  )
}
