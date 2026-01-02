'use client'

import type { PostFormData } from '@/types/post'
import { POST_LAYOUTS, POST_LAYOUT_NAMES } from '@/types/post'
import { zodResolver } from '@hookform/resolvers/zod'
import dynamic from 'next/dynamic'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'

const TiptapEditor = dynamic(() => import('@/components/editor/TiptapEditor'), { ssr: false })

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
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      )}

      {/* Name */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Name *
        </label>
        <input
          type="text"
          {...register('name')}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        {errors.name && (
          <p className="text-red-500 text-sm mt-1">{errors.name.message}</p>
        )}
      </div>

      {/* Layout */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Layout
        </label>
        <select
          {...register('layoutId')}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          {Object.entries(POST_LAYOUT_NAMES).map(([value, label]) => (
            <option key={value} value={value}>
              {label}
            </option>
          ))}
        </select>
      </div>

      {/* Content */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Content
        </label>
        <div className="border border-gray-300 rounded-md">
          <TiptapEditor content={entry} onChange={setEntry} />
        </div>
      </div>

      {/* Tags */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Tags
        </label>
        <div className="flex flex-wrap gap-2">
          {tags.map((tag) => (
            <button
              key={tag.id}
              type="button"
              onClick={() => {
                setSelectedTagIds((prev) =>
                  prev.includes(tag.id)
                    ? prev.filter((id) => id !== tag.id)
                    : [...prev, tag.id]
                )
              }}
              className={`px-3 py-1 rounded-full text-sm ${selectedTagIds.includes(tag.id)
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              style={
                selectedTagIds.includes(tag.id) && tag.color
                  ? { backgroundColor: tag.color }
                  : {}
              }
            >
              {tag.name}
            </button>
          ))}
        </div>
      </div>

      {/* Options */}
      <div className="space-y-3">
        <label className="flex items-center space-x-2">
          <input
            type="checkbox"
            {...register('isPrivate')}
            className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
          />
          <span className="text-sm text-gray-700">Private (only visible to you)</span>
        </label>

        <label className="flex items-center space-x-2">
          <input
            type="checkbox"
            {...register('isPinned')}
            className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
          />
          <span className="text-sm text-gray-700">Pin to top</span>
        </label>
      </div>

      {/* Position */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Position (for sorting)
        </label>
        <input
          type="number"
          {...register('position', { valueAsNumber: true })}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      {/* Submit */}
      <div className="flex gap-3">
        <button
          type="submit"
          disabled={isSubmitting}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
        >
          {isSubmitting ? 'Saving...' : post ? 'Update Post' : 'Create Post'}
        </button>
        <button
          type="button"
          onClick={() => router.back()}
          className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300"
        >
          Cancel
        </button>
      </div>
    </form>
  )
}
