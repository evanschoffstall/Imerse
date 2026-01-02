'use client'

import RichTextEditor from '@/components/editor/RichTextEditor'
import { Button } from '@/components/ui/button'
import FormField from '@/components/ui/FormField'
import ImageUpload from '@/components/ui/ImageUpload'
import { Input } from '@/components/ui/input'
import { itemSchema, type Item, type ItemFormData } from '@/types/item'
import { zodResolver } from '@hookform/resolvers/zod'
import { useState } from 'react'
import { useForm } from 'react-hook-form'

interface ItemFormProps {
  item?: Item
  campaignId: string
  onSubmit: (data: ItemFormData) => Promise<void>
  onCancel: () => void
}

const ITEM_TYPES = [
  { value: '', label: 'Select type...' },
  { value: 'Weapon', label: 'Weapon' },
  { value: 'Armor', label: 'Armor' },
  { value: 'Potion', label: 'Potion' },
  { value: 'Scroll', label: 'Scroll' },
  { value: 'Wand', label: 'Wand' },
  { value: 'Ring', label: 'Ring' },
  { value: 'Amulet', label: 'Amulet' },
  { value: 'Tool', label: 'Tool' },
  { value: 'Treasure', label: 'Treasure' },
  { value: 'Consumable', label: 'Consumable' },
  { value: 'Quest Item', label: 'Quest Item' },
  { value: 'Material', label: 'Material' },
  { value: 'Container', label: 'Container' },
  { value: 'Other', label: 'Other' },
]

const SIZE_OPTIONS = [
  { value: '', label: 'Select size...' },
  { value: 'Tiny', label: 'Tiny' },
  { value: 'Small', label: 'Small' },
  { value: 'Medium', label: 'Medium' },
  { value: 'Large', label: 'Large' },
  { value: 'Huge', label: 'Huge' },
]

export default function ItemForm({ item, campaignId, onSubmit, onCancel }: ItemFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<ItemFormData>({
    resolver: zodResolver(itemSchema),
    defaultValues: {
      name: item?.name || '',
      type: item?.type || '',
      description: item?.description || '',
      image: item?.image || '',
      location: item?.location || '',
      character: item?.character || '',
      price: item?.price || '',
      size: item?.size || '',
      isPrivate: item?.isPrivate || false,
    },
  })

  const description = watch('description')
  const image = watch('image')
  const handleImageUpload = (url: string) => {
    setValue('image', url, { shouldValidate: true })
  }

  const handleFormSubmit = async (data: ItemFormData) => {
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
          placeholder="Enter item name"
        />
      </FormField>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <FormField label="Type" error={errors.type?.message}>
          <select
            {...register('type')}
            className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-1 focus:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
          >
            {ITEM_TYPES.map(option => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </FormField>

        <FormField label="Size" error={errors.size?.message}>
          <select
            {...register('size')}
            className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-1 focus:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
          >
            {SIZE_OPTIONS.map(option => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </FormField>
      </div>

      <FormField label="Price" error={errors.price?.message}>
        <Input
          {...register('price')}
          placeholder="e.g., 100 gold, 5 silver"
        />
      </FormField>

      <ImageUpload
        currentImage={image}
        onImageUpload={handleImageUpload}
        folder="items"
        label="Item Image"
      />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <FormField label="Location" error={errors.location?.message}>
          <Input
            {...register('location')}
            placeholder="Where is this item located?"
          />
        </FormField>

        <FormField label="Owner/Character" error={errors.character?.message}>
          <Input
            {...register('character')}
            placeholder="Who owns or possesses this item?"
          />
        </FormField>
      </div>

      <FormField
        label="Description"
        error={errors.description?.message}
      >
        <RichTextEditor
          content={description || ''}
          onChange={(html: string) => setValue('description', html)}
          placeholder="Describe the item's appearance, properties, history, magical effects..."
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
          {isSubmitting ? 'Saving...' : item ? 'Update Item' : 'Create Item'}
        </Button>
      </div>
    </form>
  )
}
