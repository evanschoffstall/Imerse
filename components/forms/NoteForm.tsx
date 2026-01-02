'use client'

import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import {
  Form,
  FormControl,
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
  const form = useForm<NoteFormData>({
    resolver: zodResolver(noteSchema),
    defaultValues: {
      name: note?.name || '',
      type: note?.type || '',
      description: note?.description || '',
      image: note?.image || '',
      isPrivate: note?.isPrivate || false
    }
  })

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
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmitForm)} className="space-y-6">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Name *</FormLabel>
              <FormControl>
                <Input {...field} placeholder="Enter note name" />
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
                  {NOTE_TYPES.map((type) => (
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
          name="image"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Note Image</FormLabel>
              <FormControl>
                <ImageUpload
                  currentImage={field.value}
                  onImageUpload={field.onChange}
                  folder="notes"
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
              <FormLabel>Content</FormLabel>
              <FormControl>
                <div className="border rounded-lg overflow-hidden">
                  <div className="bg-muted border-b px-3 py-2">
                    <div className="flex gap-2">
                      <Button
                        type="button"
                        size="sm"
                        variant={editor?.isActive('bold') ? 'secondary' : 'ghost'}
                        onClick={() => editor?.chain().focus().toggleBold().run()}
                      >
                        B
                      </Button>
                      <Button
                        type="button"
                        size="sm"
                        variant={editor?.isActive('italic') ? 'secondary' : 'ghost'}
                        onClick={() => editor?.chain().focus().toggleItalic().run()}
                      >
                        I
                      </Button>
                      <Button
                        type="button"
                        size="sm"
                        variant={editor?.isActive('bulletList') ? 'secondary' : 'ghost'}
                        onClick={() => editor?.chain().focus().toggleBulletList().run()}
                      >
                        •
                      </Button>
                    </div>
                  </div>
                  <div className="tiptap">
                    <div className="editor-content" />
                  </div>
                </div>
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
            {form.formState.isSubmitting ? 'Saving...' : note ? 'Update Note' : 'Create Note'}
          </Button>
          <Button type="button" onClick={onCancel} variant="secondary">
            Cancel
          </Button>
        </div>
      </form>
    </Form>
  )
}
