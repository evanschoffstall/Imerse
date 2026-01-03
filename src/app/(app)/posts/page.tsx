import PostList from '@/components/posts/PostList'
import Link from 'next/link'
import { Suspense } from 'react'
import { Button } from '@/components/ui/button'

async function getPosts(campaignId: string) {
  // In a real app, this would be a server-side fetch
  // For now, return empty array as placeholder
  return []
}

interface PageProps {
  searchParams: { campaignId?: string }
}

export default async function PostsPage({ searchParams }: PageProps) {
  const campaignId = searchParams.campaignId

  if (!campaignId) {
    return (
      <div className="container mx-auto px-6 py-8">
        <div className="bg-yellow-50 border border-yellow-200 text-yellow-800 px-4 py-3 rounded">
          Please select a campaign first
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-6 py-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold">Posts</h1>
        <Button asChild>
          <Link href={`/posts/create?campaignId=${campaignId}`}>
            Create Post
          </Link>
        </Button>
      </div>

      <Suspense fallback={<div>Loading posts...</div>}>
        <PostListWrapper campaignId={campaignId} />
      </Suspense>
    </div>
  )
}

async function PostListWrapper({ campaignId }: { campaignId: string }) {
  const posts = await getPosts(campaignId)

  return (
    <PostList
      posts={posts}
      campaignId={campaignId}
      showEntityLink={true}
    />
  )
}
