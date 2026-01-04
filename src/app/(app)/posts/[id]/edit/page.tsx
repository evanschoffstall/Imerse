'use client'

import PostForm from '@/components/forms/PostForm'
import { useParams } from 'next/navigation'
import { useEffect, useState } from 'react'

export default function EditPostPage() {
  const params = useParams()
  const [post, setPost] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    const fetchPost = async () => {
      try {
        const res = await fetch(`/api/posts/${params.id}`)
        if (!res.ok) throw new Error('Failed to fetch post')
        const data = await res.json()
        setPost(data)
      } catch (err: any) {
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }
    fetchPost()
  }, [params.id])

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <Skeleton className="h-8 w-64 mb-8" />
        <Card>
          <CardContent className="pt-6">
            <div className="space-y-4">
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-64 w-full" />
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (error || !post) {
    return (
      <div className="container mx-auto px-6 py-8">
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
          {error || 'Post not found'}
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-6 py-8 max-w-4xl">
      <h1 className="text-3xl font-bold mb-6">Edit Post</h1>
      <div className="bg-white rounded-lg shadow-md p-6">
        <PostForm campaignId={(post as any).campaignId} post={post} />
      </div>
    </div>
  )
}
