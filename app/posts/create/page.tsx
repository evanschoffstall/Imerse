'use client'

import PostForm from '@/components/forms/PostForm'
import { useSearchParams } from 'next/navigation'

export default function CreatePostPage() {
  const searchParams = useSearchParams()
  const campaignId = searchParams.get('campaignId')

  if (!campaignId) {
    return (
      <div className="container mx-auto px-6 py-8">
        <div className="bg-yellow-50 border border-yellow-200 text-yellow-800 px-4 py-3 rounded">
          Campaign ID is required
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-6 py-8 max-w-4xl">
      <h1 className="text-3xl font-bold mb-6">Create Post</h1>
      <div className="bg-white rounded-lg shadow-md p-6">
        <PostForm campaignId={campaignId} />
      </div>
    </div>
  )
}
