'use client'

import { Button } from '@/components/ui/button'
import type { Quest } from '@/types/quest'
import NextImage from 'next/image'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { toast } from 'sonner'

export default function QuestDetailPage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const [quest, setQuest] = useState<Quest | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchQuest()
  }, [params.id])

  const fetchQuest = async () => {
    try {
      const response = await fetch(`/api/quests/${params.id}`)
      if (!response.ok) throw new Error('Failed to fetch quest')
      const data = await response.json()
      setQuest(data.quest)
    } catch (error) {
      console.error('Error fetching quest:', error)
      toast.error('Failed to load quest')
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this quest?')) return

    try {
      const response = await fetch(`/api/quests/${params.id}`, {
        method: 'DELETE'
      })

      if (!response.ok) throw new Error('Failed to delete quest')

      toast.success('Quest deleted successfully')
      router.push(`/quests?campaignId=${quest?.campaignId}`)
    } catch (error) {
      console.error('Error deleting quest:', error)
      toast.error('Failed to delete quest')
    }
  }

  if (loading) {
    return (
      <div className="container mx-auto px-6 py-8">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/3"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2"></div>
          <div className="h-4 bg-gray-200 rounded w-3/4"></div>
        </div>
      </div>
    )
  }

  if (!quest) {
    return (
      <div className="container mx-auto px-6 py-8">
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-6">
          <p className="text-red-800 dark:text-red-200">Quest not found</p>
        </div>
      </div>
    )
  }

  const getStatusColor = (status?: string | null) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300'
      case 'failed':
        return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300'
      case 'on-hold':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300'
      default:
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300'
    }
  }

  return (
    <div className="container mx-auto px-6 py-8">
      <div className="mb-6">
        <Link
          href={`/quests?campaignId=${quest.campaignId}`}
          className="text-blue-600 hover:text-blue-700 mb-4 inline-block"
        >
          ← Back to Quests
        </Link>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden">
        {quest.image && (
          <div className="relative w-full h-64">
            <NextImage
              src={quest.image}
              alt={quest.name}
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, 768px"
              priority
            />
          </div>
        )}

        <div className="p-6">
          <div className="flex items-start justify-between mb-4">
            <div className="flex-1">
              <h1 className="text-4xl font-bold mb-2">{quest.name}</h1>
              <div className="flex gap-2 mb-4">
                {quest.type && (
                  <span className="inline-block px-3 py-1 text-sm font-medium rounded-full bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300">
                    {quest.type}
                  </span>
                )}
                {quest.status && (
                  <span className={`inline-block px-3 py-1 text-sm font-medium rounded-full ${getStatusColor(quest.status)}`}>
                    {quest.status.charAt(0).toUpperCase() + quest.status.slice(1).replace('-', ' ')}
                  </span>
                )}
                {quest.isPrivate && (
                  <span className="inline-block px-3 py-1 text-sm font-medium rounded-full bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-300">
                    Private
                  </span>
                )}
              </div>
            </div>
            <div className="flex gap-2">
              <Link href={`/quests/${quest.id}/edit`}>
                <Button>Edit</Button>
              </Link>
              <Button onClick={handleDelete} variant="destructive">
                Delete
              </Button>
            </div>
          </div>

          {quest.description && (
            <div className="mb-6">
              <h2 className="text-xl font-semibold mb-2">Description</h2>
              <div
                className="prose dark:prose-invert max-w-none"
                dangerouslySetInnerHTML={{ __html: quest.description }}
              />
            </div>
          )}

          <div className="border-t border-gray-200 dark:border-gray-700 pt-6">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="font-medium">Campaign:</span>{' '}
                <Link
                  href={`/campaigns/${quest.campaign?.id}`}
                  className="text-blue-600 hover:text-blue-700"
                >
                  {quest.campaign?.name}
                </Link>
              </div>
              <div>
                <span className="font-medium">Created by:</span>{' '}
                {quest.createdBy?.name || quest.createdBy?.email}
              </div>
              <div>
                <span className="font-medium">Created:</span>{' '}
                {new Date(quest.createdAt).toLocaleDateString()}
              </div>
              <div>
                <span className="font-medium">Updated:</span>{' '}
                {new Date(quest.updatedAt).toLocaleDateString()}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
