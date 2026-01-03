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
import { locationSchema, type Location, type LocationFormData } from '@/types/location'
import { zodResolver } from '@hookform/resolvers/zod'
import { useState } from 'react'
import { useForm } from 'react-hook-form'

interface LocationFormProps {
  location?: Location
  campaignId: string
  availableLocations?: Location[]
  onSubmit: (data: LocationFormData) => Promise<void>
  onCancel: () => void
}

const LOCATION_TYPES = [
  { value: 'Continent', label: 'Continent' },
  { value: 'Country', label: 'Country' },
  { value: 'Region', label: 'Region' },
  { value: 'City', label: 'City' },
  { value: 'Town', label: 'Town' },
  { value: 'Village', label: 'Village' },
  { value: 'District', label: 'District' },
  { value: 'Building', label: 'Building' },
  { value: 'Room', label: 'Room' },
  { value: 'Dungeon', label: 'Dungeon' },
  { value: 'Forest', label: 'Forest' },
  { value: 'Mountain', label: 'Mountain' },
  { value: 'Plains', label: 'Plains' },
  { value: 'Sea', label: 'Sea' },
  { value: 'Other', label: 'Other' },
]

export default function LocationForm({
  location,
  campaignId,
  availableLocations = [],
  onSubmit,
  onCancel
}: LocationFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)

  const form = useForm<LocationFormData>({
    resolver: zodResolver(locationSchema),
    defaultValues: {
      name: location?.name || '',
      type: location?.type || '',
      parentId: location?.parentId || '',
      description: location?.description || '',
      image: location?.image || '',
      mapImage: location?.mapImage || '',
      isPrivate: location?.isPrivate || false,
    },
  })

  // Filter out current location and its descendants from parent options
  const parentOptions = [
    { value: '', label: 'None (Top Level)' },
    ...availableLocations
      .filter(loc => loc.id !== location?.id) // Can't be parent of itself
      .map(loc => ({
        value: loc.id,
        label: loc.name + (loc.type ? ` (${loc.type})` : ''),
      })),
  ]

  const handleFormSubmit = async (data: LocationFormData) => {
    setIsSubmitting(true)
    try {
      await onSubmit(data)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleFormSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Name *</FormLabel>
              <FormControl>
                <Input {...field} placeholder="Enter location name" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FormField
            control={form.control}
            name="type"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Type</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select type..." />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {LOCATION_TYPES.map(option => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
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
            name="parentId"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Parent Location</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="None (Top Level)" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {parentOptions.map(option => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormDescription>
                  Create a hierarchy by setting a parent location
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="image"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Location Image</FormLabel>
              <FormControl>
                <ImageUpload
                  currentImage={field.value}
                  onImageUpload={field.onChange}
                  folder="locations"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="mapImage"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Map Image</FormLabel>
              <FormControl>
                <ImageUpload
                  currentImage={field.value}
                  onImageUpload={field.onChange}
                  folder="locations/maps"
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
                <RichTextEditor
                  content={field.value || ''}
                  onChange={field.onChange}
                  placeholder="Describe the location's geography, climate, culture, history..."
                />
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
                <FormLabel>
                  Private (only visible to campaign owner and creator)
                </FormLabel>
              </div>
            </FormItem>
          )}
        />

        <div className="flex items-center justify-end space-x-4 pt-4 border-t">
          <Button
            type="button"
            variant="secondary"
            onClick={onCancel}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Saving...' : location ? 'Update Location' : 'Create Location'}
          </Button>
        </div>
      </form>
    </Form>
  )
}
