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
  const form = useForm<QuestFormData>({
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
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmitForm)} className="space-y-6">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Name *</FormLabel>
              <FormControl>
                <Input {...field} placeholder="Enter quest name" />
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
                  {QUEST_TYPES.map((type) => (
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
          name="status"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Status</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {QUEST_STATUSES.map((status) => (
                    <SelectItem key={status} value={status}>
                      {status.charAt(0).toUpperCase() + status.slice(1).replace('-', ' ')}
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
              <FormLabel>Quest Image</FormLabel>
              <FormControl>
                <ImageUpload
                  currentImage={field.value}
                  onImageUpload={field.onChange}
                  folder="quests"
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
            {form.formState.isSubmitting ? 'Saving...' : quest ? 'Update Quest' : 'Create Quest'}
          </Button>
          <Button type="button" onClick={onCancel} variant="secondary">
            Cancel
          </Button>
        </div>
      </form>
    </Form>
  )
}
