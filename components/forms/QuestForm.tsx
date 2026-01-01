'use client'

import Button from '@/components/ui/Button'
import ImageUpload from '@/components/ui/ImageUpload'
import Input from '@/components/ui/Input'
import Select from '@/components/ui/Select'
import type { Quest, QuestFormData } from '@/types/quest'
import { QUEST_STATUSES, QUEST_TYPES } from '@/types/quest'
import { zodResolver } from '@hookform/resolvers/zod'
import { useEditor } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import { useForm } from 'react-hook-form'
import { z } from 'zod'

const questSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  type: z.string().optional(),
  description: z.string().optional(),
  image: z.string().url('Must be a valid URL').optional().or(z.literal('')),
  status: z.string().optional(),
  isPrivate: z.boolean().optional()
})

interface QuestFormProps {
  quest?: Quest
  campaignId: string
  onSubmit: (data: QuestFormData) => Promise<void>
  onCancel: () => void
}

export default function QuestForm({ quest, campaignId, onSubmit, onCancel }: QuestFormProps) {
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors, isSubmitting }
  } = useForm<QuestFormData>({
    resolver: zodResolver(questSchema),
    defaultValues: {
      name: quest?.name || '',
      type: quest?.type || '',
      description: quest?.description || '',
      image: quest?.image || '',
      status: quest?.status || 'active',
      isPrivate: quest?.isPrivate || false
    }
  })

  const image = watch('image')
  const handleImageUpload = (url: string) => {
    setValue('image', url, { shouldValidate: true })
  }

  const editor = useEditor({
    extensions: [StarterKit],
    content: quest?.description || '',
    editorProps: {
      attributes: {
        class: 'prose dark:prose-invert max-w-none min-h-[200px] px-4 py-2 focus:outline-none'
      }
    }
  })

  const onSubmitForm = async (data: QuestFormData) => {
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
          placeholder="Enter quest name"
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
          {QUEST_TYPES.map((type) => (
            <option key={type} value={type}>
              {type}
            </option>
          ))}
        </Select>
      </div>

      <div>
        <label htmlFor="status" className="block text-sm font-medium mb-2">
          Status
        </label>
        <Select id="status" {...register('status')}>
          {QUEST_STATUSES.map((status) => (
            <option key={status} value={status}>
              {status.charAt(0).toUpperCase() + status.slice(1).replace('-', ' ')}
            </option>
          ))}
        </Select>
      </div>

      <ImageUpload
        currentImage={image}
        onImageUpload={handleImageUpload}
        folder="quests"
        label="Quest Image"
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
          {isSubmitting ? 'Saving...' : quest ? 'Update Quest' : 'Create Quest'}
        </Button>
        <Button type="button" onClick={onCancel} variant="secondary">
          Cancel
        </Button>
      </div>
    </form>
  )
}
