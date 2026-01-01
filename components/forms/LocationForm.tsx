'use client'

import RichTextEditor from '@/components/editor/RichTextEditor'
import Button from '@/components/ui/Button'
import FormField from '@/components/ui/FormField'
import ImageUpload from '@/components/ui/ImageUpload'
import Input from '@/components/ui/Input'
import Select from '@/components/ui/Select'
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
  { value: '', label: 'Select type...' },
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

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<LocationFormData>({
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

  const description = watch('description')
  const image = watch('image')
  const mapImage = watch('mapImage')

  const handleImageUpload = (url: string) => {
    setValue('image', url, { shouldValidate: true })
  }

  const handleMapImageUpload = (url: string) => {
    setValue('mapImage', url, { shouldValidate: true })
  }

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
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
      <FormField label="Name" error={errors.name?.message} required>
        <Input
          {...register('name')}
          placeholder="Enter location name"
          error={errors.name?.message}
        />
      </FormField>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <FormField label="Type" error={errors.type?.message}>
          <Select
            {...register('type')}
            options={LOCATION_TYPES}
            error={errors.type?.message}
          />
        </FormField>

        <FormField
          label="Parent Location"
          error={errors.parentId?.message}
          className="relative"
        >
          <Select
            {...register('parentId')}
            options={parentOptions}
            error={errors.parentId?.message}
          />
          <p className="mt-1 text-xs text-gray-500">
            Create a hierarchy by setting a parent location
          </p>
        </FormField>
      </div>

      <ImageUpload
        currentImage={image}
        onImageUpload={handleImageUpload}
        folder="locations"
        label="Location Image"
      />

      <ImageUpload
        currentImage={mapImage}
        onImageUpload={handleMapImageUpload}
        folder="locations/maps"
        label="Map Image"
      />

      <FormField
        label="Description"
        error={errors.description?.message}
      >
        <RichTextEditor
          content={description || ''}
          onChange={(html: string) => setValue('description', html)}
          placeholder="Describe the location's geography, climate, culture, history..."
        />
      </FormField>

      <FormField error={errors.isPrivate?.message}>
        <label className="flex items-center space-x-2">
          <input
            type="checkbox"
            {...register('isPrivate')}
            className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
          />
          <span className="text-sm text-gray-700">
            Private (only visible to campaign owner and creator)
          </span>
        </label>
      </FormField>

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
  )
}
