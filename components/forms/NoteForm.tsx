'use client'

import { Button } from '@/components/ui/button'
import ImageUpload from '@/components/ui/ImageUpload'
import { Input } from '@/components/ui/input'
import type { Note, NoteFormData } from '@/types/note'
import { NOTE_TYPES } from '@/types/note'
import { zodResolver } from '@hookform/resolvers/zod'
import { useEditor } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import { useForm } from 'react-hook-form'
import { z } from 'zod'

const noteSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  type: z.string().optional(),
  description: z.string().optional(),
  image: z.string().url('Must be a valid URL').optional().or(z.literal('')),
  isPrivate: z.boolean().optional()
})

interface NoteFormProps {
  note?: Note
  campaignId: string
  onSubmit: (data: NoteFormData) => Promise<void>
  onCancel: () => void
}

export default function NoteForm({ note, campaignId, onSubmit, onCancel }: NoteFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    watch,
    setValue
  } = useForm<NoteFormData>({
    resolver: zodResolver(noteSchema),
    defaultValues: {
      name: note?.name || '',
      type: note?.type || '',
      description: note?.description || '',
      image: note?.image || '',
      isPrivate: note?.isPrivate || false
    }
  })

  const image = watch('image')
  const handleImageUpload = (url: string) => {
    setValue('image', url, { shouldValidate: true })
  }

  const editor = useEditor({
    extensions: [StarterKit],
    content: note?.description || '',
    editorProps: {
      attributes: {
        class: 'prose dark:prose-invert max-w-none min-h-[200px] px-4 py-2 focus:outline-none'
      }
    }
  })

  const onSubmitForm = async (data: NoteFormData) => {
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
          placeholder="Enter note name"
        />
        {errors.name && (
          <p className="text-red-600 text-sm mt-1">{errors.name.message}</p>
        )}
      </div>

      <div>
        <label htmlFor="type" className="block text-sm font-medium mb-2">
          Type
        </label>
        <select
          {...register('type')}
          className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-1 focus:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
        >
          <option value="">Select a type</option>
          {NOTE_TYPES.map((type) => (
            <option key={type} value={type}>
              {type}
            </option>
          ))}
        </select>
      </div>

      <ImageUpload
        currentImage={image}
        onImageUpload={handleImageUpload}
        folder="notes"
        label="Note Image"
      />

      <div>
        <label className="block text-sm font-medium mb-2">
          Content
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
          {isSubmitting ? 'Saving...' : note ? 'Update Note' : 'Create Note'}
        </Button>
        <Button type="button" onClick={onCancel} variant="secondary">
          Cancel
        </Button>
      </div>
    </form>
  )
}
