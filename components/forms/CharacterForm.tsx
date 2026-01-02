'use client'

import RichTextEditor from '@/components/editor/RichTextEditor'
import { Button } from '@/components/ui/button'
import FormField from '@/components/ui/FormField'
import ImageUpload from '@/components/ui/ImageUpload'
import { Input } from '@/components/ui/input'
import Select from '@/components/ui/select'
import { characterSchema, type Character, type CharacterFormData } from '@/types/character'
import { zodResolver } from '@hookform/resolvers/zod'
import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'

interface CharacterFormProps {
  character?: Character
  campaignId: string
  onSubmit: (data: CharacterFormData) => Promise<void>
  onCancel: () => void
}

const CHARACTER_TYPES = [
  { value: '', label: 'Select type...' },
  { value: 'PC', label: 'Player Character' },
  { value: 'NPC', label: 'Non-Player Character' },
  { value: 'Villain', label: 'Villain' },
  { value: 'Ally', label: 'Ally' },
  { value: 'Companion', label: 'Companion' },
  { value: 'Other', label: 'Other' },
]

const SEX_OPTIONS = [
  { value: '', label: 'Select...' },
  { value: 'Male', label: 'Male' },
  { value: 'Female', label: 'Female' },
  { value: 'Non-binary', label: 'Non-binary' },
  { value: 'Other', label: 'Other' },
]

export function CharacterForm({ character, campaignId, onSubmit, onCancel }: CharacterFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [calendars, setCalendars] = useState<Array<{ id: string; name: string }>>([])

  useEffect(() => {
    // Fetch available calendars for this campaign
    async function fetchCalendars() {
      try {
        const response = await fetch(`/api/calendars?campaignId=${campaignId}`)
        if (response.ok) {
          const data = await response.json()
          setCalendars(data.calendars || [])
        }
      } catch (error) {
        console.error('Failed to fetch calendars:', error)
      }
    }
    fetchCalendars()
  }, [campaignId])

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<CharacterFormData>({
    resolver: zodResolver(characterSchema),
    defaultValues: {
      name: character?.name || '',
      title: character?.title || '',
      type: character?.type || '',
      age: character?.age || '',
      sex: character?.sex || '',
      pronouns: character?.pronouns || '',
      location: character?.location || '',
      family: character?.family || '',
      description: character?.description || '',
      image: character?.image || '',
      isPrivate: character?.isPrivate || false,
      birthCalendarId: character?.birthCalendarId || '',
      birthDate: character?.birthDate || '',
    },
  })

  const description = watch('description')
  const image = watch('image')

  const handleImageUpload = (url: string) => {
    setValue('image', url, { shouldValidate: true })
  }

  const handleFormSubmit = async (data: CharacterFormData) => {
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
          placeholder="Enter character name"
          error={errors.name?.message}
        />
      </FormField>

      <FormField label="Title" error={errors.title?.message}>
        <Input
          {...register('title')}
          placeholder="e.g., The Brave, Knight of the Realm"
          error={errors.title?.message}
        />
      </FormField>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <FormField label="Type" error={errors.type?.message}>
          <Select
            {...register('type')}
            options={CHARACTER_TYPES}
            error={errors.type?.message}
          />
        </FormField>

        <FormField label="Age" error={errors.age?.message}>
          <Input
            {...register('age')}
            placeholder="e.g., 25, Ancient, Young adult"
            error={errors.age?.message}
          />
        </FormField>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <FormField label="Sex" error={errors.sex?.message}>
          <Select
            {...register('sex')}
            options={SEX_OPTIONS}
            error={errors.sex?.message}
          />
        </FormField>

        <FormField label="Pronouns" error={errors.pronouns?.message}>
          <Input
            {...register('pronouns')}
            placeholder="e.g., he/him, she/her, they/them"
            error={errors.pronouns?.message}
          />
        </FormField>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <FormField label="Location" error={errors.location?.message}>
          <Input
            {...register('location')}
            placeholder="Current location or hometown"
            error={errors.location?.message}
          />
        </FormField>

        <FormField label="Family" error={errors.family?.message}>
          <Input
            {...register('family')}
            placeholder="Family name or house"
            error={errors.family?.message}
          />
        </FormField>
      </div>

      <ImageUpload
        currentImage={image}
        onImageUpload={handleImageUpload}
        folder="characters"
        label="Character Image"
      />

      {/* Birthday Section */}
      <div className="border-t pt-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Birthday (Optional)</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FormField label="Calendar" error={errors.birthCalendarId?.message}>
            <Select {...register('birthCalendarId')} error={errors.birthCalendarId?.message}>
              <option value="">Select a calendar...</option>
              {calendars.map((calendar) => (
                <option key={calendar.id} value={calendar.id}>
                  {calendar.name}
                </option>
              ))}
            </Select>
            <p className="text-xs text-gray-500 mt-1">
              Select which calendar system this birthday uses
            </p>
          </FormField>

          <FormField label="Birth Date" error={errors.birthDate?.message}>
            <Input
              {...register('birthDate')}
              placeholder="YYYY-MM-DD (e.g., 1985-03-15)"
              error={errors.birthDate?.message}
            />
            <p className="text-xs text-gray-500 mt-1">
              Format: YYYY-MM-DD (negative years supported)
            </p>
          </FormField>
        </div>
      </div>

      <FormField
        label="Description"
        error={errors.description?.message}
      >
        <RichTextEditor
          content={description || ''}
          onChange={(html: string) => setValue('description', html)}
          placeholder="Describe your character's appearance, personality, background..."
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
          {isSubmitting ? 'Saving...' : character ? 'Update Character' : 'Create Character'}
        </Button>
      </div>
    </form>
  )
}
