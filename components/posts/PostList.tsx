'use client'

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
        <button
          onClick={() => setFilter('all')}
          className={`px-4 py-2 rounded-md ${filter === 'all'
              ? 'bg-blue-600 text-white'
              : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
        >
          All Posts
        </button>
        <button
          onClick={() => setFilter('pinned')}
          className={`px-4 py-2 rounded-md ${filter === 'pinned'
              ? 'bg-blue-600 text-white'
              : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
        >
          Pinned Only
        </button>
      </div>

      {/* Posts List */}
      {sortedPosts.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-lg">
          <p className="text-gray-500">No posts found</p>
          <Link
            href={`/posts/create?campaignId=${campaignId}`}
            className="inline-block mt-4 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            Create First Post
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {sortedPosts.map((post) => (
            <div
              key={post.id}
              className={`bg-white border rounded-lg p-4 hover:shadow-md transition-shadow ${post.isPinned ? 'border-yellow-400 border-2' : 'border-gray-200'
                }`}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    {post.isPinned && (
                      <span className="px-2 py-1 bg-yellow-100 text-yellow-800 text-xs rounded-full">
                        📌 Pinned
                      </span>
                    )}
                    {post.isPrivate && (
                      <span className="px-2 py-1 bg-gray-100 text-gray-800 text-xs rounded-full">
                        🔒 Private
                      </span>
                    )}
                    {post.layoutId && post.layoutId !== 'content' && (
                      <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                        {POST_LAYOUT_NAMES[post.layoutId as keyof typeof POST_LAYOUT_NAMES] || post.layoutId}
                      </span>
                    )}
                  </div>

                  <Link
                    href={`/posts/${post.id}`}
                    className="text-xl font-semibold text-blue-600 hover:text-blue-800"
                  >
                    {post.name}
                  </Link>

                  {post.entry && (
                    <div
                      className="mt-2 text-gray-600 line-clamp-2"
                      dangerouslySetInnerHTML={{
                        __html: post.entry.substring(0, 200) + (post.entry.length > 200 ? '...' : ''),
                      }}
                    />
                  )}

                  <div className="mt-3 flex items-center gap-4 text-sm text-gray-500">
                    <span>by {post.createdBy.name}</span>
                    <span>•</span>
                    <span>{new Date(post.createdAt).toLocaleDateString()}</span>
                    {showEntityLink && getEntityName(post) && (
                      <>
                        <span>•</span>
                        <Link
                          href={getEntityLink(post) || '#'}
                          className="text-blue-600 hover:underline"
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
                        <span
                          key={postTag.id}
                          className="px-2 py-1 text-xs rounded-full"
                          style={{
                            backgroundColor: postTag.tag.color || '#e5e7eb',
                            color: postTag.tag.color ? '#fff' : '#374151',
                          }}
                        >
                          {postTag.tag.name}
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                {/* Actions */}
                <div className="flex gap-2 ml-4">
                  <Link
                    href={`/posts/${post.id}/edit`}
                    className="px-3 py-1 text-sm bg-gray-100 text-gray-700 rounded hover:bg-gray-200"
                  >
                    Edit
                  </Link>
                  {onDelete && (
                    <button
                      onClick={() => {
                        if (confirm('Are you sure you want to delete this post?')) {
                          onDelete(post.id)
                        }
                      }}
                      className="px-3 py-1 text-sm bg-red-100 text-red-700 rounded hover:bg-red-200"
                    >
                      Delete
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
