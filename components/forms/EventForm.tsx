'use client'

import Button from '@/components/ui/Button'
import ImageUpload from '@/components/ui/ImageUpload'
import Input from '@/components/ui/Input'
import Select from '@/components/ui/Select'
import type { Event, EventFormData } from '@/types/event'
import { EVENT_TYPES } from '@/types/event'
import type { Timeline } from '@/types/timeline'
import { zodResolver } from '@hookform/resolvers/zod'
import { useEditor } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'

const eventSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  type: z.string().optional(),
  date: z.string().optional(),
  description: z.string().optional(),
  image: z.string().url('Must be a valid URL').optional().or(z.literal('')),
  location: z.string().optional(),
  timelineId: z.string().optional(),
  isPrivate: z.boolean().optional()
})

interface EventFormProps {
  event?: Event
  campaignId: string
  onSubmit: (data: EventFormData) => Promise<void>
  onCancel: () => void
}

export default function EventForm({ event, campaignId, onSubmit, onCancel }: EventFormProps) {
  const [timelines, setTimelines] = useState<Timeline[]>([])

  useEffect(() => {
    async function fetchTimelines() {
      try {
        const response = await fetch(`/api/timelines?campaignId=${campaignId}`)
        if (response.ok) {
          const data = await response.json()
          setTimelines(data.timelines || [])
        }
      } catch (error) {
        console.error('Error fetching timelines:', error)
      }
    }
    fetchTimelines()
  }, [campaignId])

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors, isSubmitting }
  } = useForm<EventFormData>({
    resolver: zodResolver(eventSchema),
    defaultValues: {
      name: event?.name || '',
      type: event?.type || '',
      date: event?.date || '',
      description: event?.description || '',
      image: event?.image || '',
      location: event?.location || '',
      timelineId: event?.timelineId || '',
      isPrivate: event?.isPrivate || false
    }
  })

  const image = watch('image')
  const handleImageUpload = (url: string) => {
    setValue('image', url, { shouldValidate: true })
  }

  const editor = useEditor({
    extensions: [StarterKit],
    content: event?.description || '',
    editorProps: {
      attributes: {
        class: 'prose dark:prose-invert max-w-none min-h-[200px] px-4 py-2 focus:outline-none'
      }
    }
  })

  const onSubmitForm = async (data: EventFormData) => {
    const description = editor?.getHTML() || ''
    await onSubmit({ ...data, description })
  }

  return (
    <form onSubmit={handleSubmit(onSubmitForm)} className="space-y-6">
      <div>
        <label htmlFor="name" className="block text-sm font-medium mb-2">
          Name *
        </label>
        <Input
          id="name"
          {...register('name')}
          placeholder="Enter event name"
        />
        {errors.name && (
          <p className="text-red-600 text-sm mt-1">{errors.name.message}</p>
        )}
      </div>

      <div>
        <label htmlFor="type" className="block text-sm font-medium mb-2">
          Type
        </label>
        <Select id="type" {...register('type')}>
          <option value="">Select a type</option>
          {EVENT_TYPES.map((type) => (
            <option key={type} value={type}>
              {type}
            </option>
          ))}
        </Select>
      </div>

      <div>
        <label htmlFor="date" className="block text-sm font-medium mb-2">
          Date
        </label>
        <Input
          id="date"
          {...register('date')}
          placeholder="e.g., Year 1450, Spring 23rd"
        />
        <p className="text-sm text-gray-500 mt-1">
          Can be any format - campaign-specific dates, historical dates, etc.
        </p>
      </div>

      <div>
        <label htmlFor="location" className="block text-sm font-medium mb-2">
          Location
        </label>
        <Input
          id="location"
          {...register('location')}
          placeholder="Where did this event occur?"
        />
      </div>

      <div>
        <label htmlFor="timelineId" className="block text-sm font-medium mb-2">
          Timeline (Optional)
        </label>
        <Select id="timelineId" {...register('timelineId')}>
          <option value="">No timeline</option>
          {timelines.map((timeline) => (
            <option key={timeline.id} value={timeline.id}>
              {timeline.name}
            </option>
          ))}
        </Select>
        <p className="text-sm text-gray-500 mt-1">
          Link this event to a timeline for chronological tracking
        </p>
      </div>

      <ImageUpload
        currentImage={image}
        onImageUpload={handleImageUpload}
        folder="events"
        label="Event Image"
      />

      <div>
        <label className="block text-sm font-medium mb-2">
          Description
        </label>
        <div className="border border-gray-300 dark:border-gray-600 rounded-lg overflow-hidden">
          <div className="bg-gray-100 dark:bg-gray-700 border-b border-gray-300 dark:border-gray-600 px-3 py-2">
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => editor?.chain().focus().toggleBold().run()}
                className={`px-2 py-1 rounded ${editor?.isActive('bold') ? 'bg-gray-300 dark:bg-gray-600' : ''}`}
              >
                B
              </button>
              <button
                type="button"
                onClick={() => editor?.chain().focus().toggleItalic().run()}
                className={`px-2 py-1 rounded ${editor?.isActive('italic') ? 'bg-gray-300 dark:bg-gray-600' : ''}`}
              >
                I
              </button>
              <button
                type="button"
                onClick={() => editor?.chain().focus().toggleBulletList().run()}
                className={`px-2 py-1 rounded ${editor?.isActive('bulletList') ? 'bg-gray-300 dark:bg-gray-600' : ''}`}
              >
                •
              </button>
            </div>
          </div>
          <div className="tiptap">
            <div className="editor-content" />
          </div>
        </div>
      </div>

      <div className="flex items-center">
        <input
          type="checkbox"
          id="isPrivate"
          {...register('isPrivate')}
          className="h-4 w-4 text-blue-600 border-gray-300 rounded"
        />
        <label htmlFor="isPrivate" className="ml-2 text-sm">
          Private
        </label>
      </div>

      <div className="flex gap-4">
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? 'Saving...' : event ? 'Update Event' : 'Create Event'}
        </Button>
        <Button type="button" onClick={onCancel} variant="secondary">
          Cancel
        </Button>
      </div>
    </form>
  )
}
