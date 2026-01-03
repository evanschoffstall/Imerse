'use client'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import type { PostWithRelations } from '@/types/post'
import { POST_LAYOUT_NAMES } from '@/types/post'
import Link from 'next/link'
import { useState } from 'react'

interface PostListProps {
  posts: PostWithRelations[]
  campaignId: string
  showEntityLink?: boolean
  onDelete?: (postId: string) => void
}

export default function PostList({ posts, campaignId, showEntityLink = true, onDelete }: PostListProps) {
  const [filter, setFilter] = useState<'all' | 'pinned'>('all')

  const filteredPosts = posts.filter((post) => {
    if (filter === 'pinned') return post.isPinned
    return true
  })

  const pinnedPosts = filteredPosts.filter((p) => p.isPinned)
  const regularPosts = filteredPosts.filter((p) => !p.isPinned)
  const sortedPosts = [...pinnedPosts, ...regularPosts]

  const getEntityLink = (post: PostWithRelations) => {
    if (post.character) return `/characters/${post.character.id}`
    if (post.location) return `/locations/${post.location.id}`
    return null
  }

  const getEntityName = (post: PostWithRelations) => {
    if (post.character) return post.character.name
    if (post.location) return post.location.name
    return null
  }

  return (
    <div className="space-y-4">
      {/* Filter */}
      <div className="flex gap-2">
        <Button
          onClick={() => setFilter('all')}
          variant={filter === 'all' ? 'default' : 'outline'}
        >
          All Posts
        </Button>
        <Button
          onClick={() => setFilter('pinned')}
          variant={filter === 'pinned' ? 'default' : 'outline'}
        >
          Pinned Only
        </Button>
      </div>

      {/* Posts List */}
      {sortedPosts.length === 0 ? (
        <Card className="text-center py-12">
          <p className="text-muted-foreground">No posts found</p>
          <Button asChild className="mt-4">
            <Link href={`/posts/create?campaignId=${campaignId}`}>
              Create First Post
            </Link>
          </Button>
        </Card>
      ) : (
        <div className="space-y-3">
          {sortedPosts.map((post) => (
            <Card
              key={post.id}
              className={`p-4 hover:shadow-md transition-shadow ${post.isPinned ? 'border-2 border-yellow-400' : ''}`}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    {post.isPinned && (
                      <Badge variant="outline" className="border-yellow-400">
                        📌 Pinned
                      </Badge>
                    )}
                    {post.isPrivate && (
                      <Badge variant="secondary">
                        🔒 Private
                      </Badge>
                    )}
                    {post.layoutId && post.layoutId !== 'content' && (
                      <Badge variant="default">
                        {POST_LAYOUT_NAMES[post.layoutId as keyof typeof POST_LAYOUT_NAMES] || post.layoutId}
                      </Badge>
                    )}
                  </div>

                  <Link
                    href={`/posts/${post.id}`}
                    className="text-xl font-semibold text-primary hover:underline"
                  >
                    {post.name}
                  </Link>

                  {post.entry && (
                    <div
                      className="mt-2 text-muted-foreground line-clamp-2"
                      dangerouslySetInnerHTML={{
                        __html: post.entry.substring(0, 200) + (post.entry.length > 200 ? '...' : ''),
                      }}
                    />
                  )}

                  <div className="mt-3 flex items-center gap-4 text-sm text-muted-foreground">
                    <span>by {post.createdBy.name}</span>
                    <span>•</span>
                    <span>{new Date(post.createdAt).toLocaleDateString()}</span>
                    {showEntityLink && getEntityName(post) && (
                      <>
                        <span>•</span>
                        <Link
                          href={getEntityLink(post) || '#'}
                          className="text-primary hover:underline"
                        >
                          {getEntityName(post)}
                        </Link>
                      </>
                    )}
                  </div>

                  {/* Tags */}
                  {post.tags && post.tags.length > 0 && (
                    <div className="mt-2 flex flex-wrap gap-2">
                      {post.tags.map((postTag) => (
                        <Badge
                          key={postTag.id}
                          variant="outline"
                          style={{
                            backgroundColor: postTag.tag.color || undefined,
                            color: postTag.tag.color ? '#fff' : undefined,
                          }}
                        >
                          {postTag.tag.name}
                        </Badge>
                      ))}
                    </div>
                  )}
                </div>

                {/* Actions */}
                <div className="flex gap-2 ml-4">
                  <Button variant="outline" size="sm" asChild>
                    <Link href={`/posts/${post.id}/edit`}>
                      Edit
                    </Link>
                  </Button>
                  {onDelete && (
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => {
                        if (confirm('Are you sure you want to delete this post?')) {
                          onDelete(post.id)
                        }
                      }}
                    >
                      Delete
                    </Button>
                  )}
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
