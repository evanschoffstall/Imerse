'use client'

import RichTextEditor from '@/components/editor/RichTextEditor'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import ImageUpload from '@/components/ui/ImageUpload'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import type { Event, EventFormData } from '@/types/event'
import { EVENT_TYPES } from '@/types/event'
import type { Timeline } from '@/types/timeline'
import { zodResolver } from '@hookform/resolvers/zod'
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

  const form = useForm<EventFormData>({
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

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Name *</FormLabel>
              <FormControl>
                <Input {...field} placeholder="Enter event name" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="type"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Type</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a type" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="">Select a type</SelectItem>
                  {EVENT_TYPES.map((type) => (
                    <SelectItem key={type} value={type}>
                      {type}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="date"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Date</FormLabel>
              <FormControl>
                <Input {...field} placeholder="e.g., Year 1450, Spring 23rd" />
              </FormControl>
              <FormDescription>
                Can be any format - campaign-specific dates, historical dates, etc.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="location"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Location</FormLabel>
              <FormControl>
                <Input {...field} placeholder="Where did this event occur?" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="timelineId"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Timeline (Optional)</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="No timeline" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="">No timeline</SelectItem>
                  {timelines.map((timeline) => (
                    <SelectItem key={timeline.id} value={timeline.id}>
                      {timeline.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormDescription>
                Link this event to a timeline for chronological tracking
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="image"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Event Image</FormLabel>
              <FormControl>
                <ImageUpload
                  currentImage={field.value}
                  onImageUpload={field.onChange}
                  folder="events"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Description</FormLabel>
              <FormControl>
                <RichTextEditor content={field.value || ''} onChange={field.onChange} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="isPrivate"
          render={({ field }) => (
            <FormItem className="flex flex-row items-start space-x-3 space-y-0">
              <FormControl>
                <Checkbox
                  checked={field.value}
                  onCheckedChange={field.onChange}
                />
              </FormControl>
              <div className="space-y-1 leading-none">
                <FormLabel>Private</FormLabel>
              </div>
            </FormItem>
          )}
        />

        <div className="flex gap-4">
          <Button type="submit" disabled={form.formState.isSubmitting}>
            {form.formState.isSubmitting ? 'Saving...' : event ? 'Update Event' : 'Create Event'}
          </Button>
          <Button type="button" onClick={onCancel} variant="secondary">
            Cancel
          </Button>
        </div>
      </form>
    </Form>
  )
}
