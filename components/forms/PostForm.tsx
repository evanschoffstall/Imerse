'use client'

import RichTextEditor from '@/components/editor/RichTextEditor'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import type { PostFormData } from '@/types/post'
import { POST_LAYOUTS, POST_LAYOUT_NAMES } from '@/types/post'
import { zodResolver } from '@hookform/resolvers/zod'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'

const postSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  entry: z.string().optional(),
  isPrivate: z.boolean().optional(),
  isPinned: z.boolean().optional(),
  position: z.number().optional(),
  layoutId: z.string().nullable().optional(),
  characterId: z.string().nullable().optional(),
  locationId: z.string().nullable().optional(),
  itemId: z.string().nullable().optional(),
  questId: z.string().nullable().optional(),
  eventId: z.string().nullable().optional(),
  journalId: z.string().nullable().optional(),
  familyId: z.string().nullable().optional(),
  organisationId: z.string().nullable().optional(),
  tagIds: z.array(z.string()).optional(),
})

interface PostFormProps {
  campaignId: string
  post?: any
  onSuccess?: () => void
}

export default function PostForm({ campaignId, post, onSuccess }: PostFormProps) {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [entry, setEntry] = useState(post?.entry || '')
  const [tags, setTags] = useState<any[]>([])
  const [selectedTagIds, setSelectedTagIds] = useState<string[]>(
    post?.tags?.map((pt: any) => pt.tagId) || []
  )

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
  } = useForm<PostFormData>({
    resolver: zodResolver(postSchema),
    defaultValues: {
      name: post?.name || '',
      isPrivate: post?.isPrivate || false,
      isPinned: post?.isPinned || false,
      position: post?.position || 0,
      layoutId: post?.layoutId || POST_LAYOUTS.ONE_COLUMN,
      characterId: post?.characterId || null,
      locationId: post?.locationId || null,
      itemId: post?.itemId || null,
      questId: post?.questId || null,
      eventId: post?.eventId || null,
      journalId: post?.journalId || null,
      familyId: post?.familyId || null,
      organisationId: post?.organisationId || null,
    },
  })

  // Fetch tags
  useEffect(() => {
    const fetchTags = async () => {
      try {
        const res = await fetch(`/api/tags?campaignId=${campaignId}`)
        if (res.ok) {
          const data = await res.json()
          setTags(data)
        }
      } catch (err) {
        console.error('Failed to fetch tags:', err)
      }
    }
    fetchTags()
  }, [campaignId])

  const onSubmit = async (data: PostFormData) => {
    setIsSubmitting(true)
    setError('')

    try {
      const payload = {
        ...data,
        campaignId,
        entry,
        tagIds: selectedTagIds,
      }

      const url = post ? `/api/posts/${post.id}` : '/api/posts'
      const method = post ? 'PATCH' : 'POST'

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })

      if (!res.ok) {
        const errorData = await res.json()
        throw new Error(errorData.error || 'Failed to save post')
      }

      const savedPost = await res.json()

      if (onSuccess) {
        onSuccess()
      } else {
        router.push(`/posts/${savedPost.id}`)
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred')
    } finally {
      setIsSubmitting(false)
    }
  }

  const layoutId = watch('layoutId')

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Name */}
      <div className="space-y-2">
        <Label htmlFor="name">Name *</Label>
        <Input
          id="name"
          type="text"
          {...register('name')}
        />
        {errors.name && (
          <p className="text-destructive text-sm">{errors.name.message}</p>
        )}
      </div>

      {/* Layout */}
      <div className="space-y-2">
        <Label htmlFor="layout">Layout</Label>
        <Select
          value={layoutId || POST_LAYOUTS.ONE_COLUMN}
          onValueChange={(value) => setValue('layoutId', value)}
        >
          <SelectTrigger id="layout">
            <SelectValue placeholder="Select layout" />
          </SelectTrigger>
          <SelectContent>
            {Object.entries(POST_LAYOUT_NAMES).map(([value, label]) => (
              <SelectItem key={value} value={value}>
                {label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Content */}
      <div className="space-y-2">
        <Label>Content</Label>
        <div className="border rounded-md">
          <RichTextEditor content={entry} onChange={setEntry} />
        </div>
      </div>

      {/* Tags */}
      <div className="space-y-2">
        <Label>Tags</Label>
        <div className="flex flex-wrap gap-2">
          {tags.map((tag) => (
            <Badge
              key={tag.id}
              variant={selectedTagIds.includes(tag.id) ? 'default' : 'secondary'}
              className="cursor-pointer"
              onClick={() => {
                setSelectedTagIds((prev) =>
                  prev.includes(tag.id)
                    ? prev.filter((id) => id !== tag.id)
                    : [...prev, tag.id]
                )
              }}
              style={
                selectedTagIds.includes(tag.id) && tag.color
                  ? { backgroundColor: tag.color }
                  : {}
              }
            >
              {tag.name}
            </Badge>
          ))}
        </div>
      </div>

      {/* Options */}
      <div className="space-y-3">
        <label className="flex items-center gap-2 text-sm">
          <Checkbox
            checked={watch('isPrivate')}
            onCheckedChange={(checked) => setValue('isPrivate', Boolean(checked))}
          />
          <span>Private (only visible to you)</span>
        </label>

        <label className="flex items-center gap-2 text-sm">
          <Checkbox
            checked={watch('isPinned')}
            onCheckedChange={(checked) => setValue('isPinned', Boolean(checked))}
          />
          <span>Pin to top</span>
        </label>
      </div>

      {/* Position */}
      <div className="space-y-2">
        <Label htmlFor="position">Position (for sorting)</Label>
        <Input
          id="position"
          type="number"
          {...register('position', { valueAsNumber: true })}
        />
      </div>

      {/* Submit */}
      <div className="flex gap-3">
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? 'Saving...' : post ? 'Update Post' : 'Create Post'}
        </Button>
        <Button
          type="button"
          variant="outline"
          onClick={() => router.back()}
        >
          Cancel
        </Button>
      </div>
    </form>
  )
}
