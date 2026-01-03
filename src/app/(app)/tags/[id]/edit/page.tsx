'use client'

import TagForm from '@/components/forms/TagForm'
import type { Tag, TagFormData } from '@/types/tag'
import { Card, CardContent } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { toast } from 'sonner'

export default function EditTagPage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const [tag, setTag] = useState<Tag | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchTag()
  }, [params.id])

  const fetchTag = async () => {
    try {
      const response = await fetch(`/api/tags/${params.id}`)
      if (!response.ok) throw new Error('Failed to fetch tag')
      const data = await response.json()
      setTag(data.tag)
    } catch (error) {
      console.error('Error fetching tag:', error)
      toast.error('Failed to load tag')
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (data: TagFormData) => {
    try {
      const response = await fetch(`/api/tags/${params.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
      })

      if (!response.ok) throw new Error('Failed to update tag')

      toast.success('Tag updated successfully')
      router.push(`/tags/${params.id}`)
    } catch (error) {
      console.error('Error updating tag:', error)
      toast.error('Failed to update tag')
      throw error
    }
  }

  const handleCancel = () => {
    router.push(`/tags/${params.id}`)
  }

  if (loading) {
    return (
      <div className="container mx-auto px-6 py-8">
        <div className="space-y-4">
          <Skeleton className="h-8 w-1/3" />
          <Skeleton className="h-4 w-1/2" />
          <Skeleton className="h-4 w-3/4" />
        </div>
      </div>
    )
  }

  if (!tag) {
    return (
      <div className="container mx-auto px-6 py-8">
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-6">
          <p className="text-red-800 dark:text-red-200">Tag not found</p>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-6 py-8">
      <div className="mb-6">
        <Link
          href={`/tags/${tag.id}`}
          className="text-blue-600 hover:text-blue-700 mb-4 inline-block"
        >
          ← Back to Tag
        </Link>
      </div>

      <Card>
        <CardContent className="p-6">
          <h1 className="text-3xl font-bold mb-6">Edit Tag</h1>
          <TagForm
            tag={tag}
            campaignId={tag.campaignId}
            onSubmit={handleSubmit}
            onCancel={handleCancel}
          />
        </CardContent>
      </Card>
    </div>
  )
}
