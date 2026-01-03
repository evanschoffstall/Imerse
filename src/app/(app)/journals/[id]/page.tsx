'use client'

import { Button } from '@/components/ui/button'
import type { Journal } from '@/types/journal'
import NextImage from 'next/image'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { toast } from 'sonner'

export default function JournalDetailPage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const [journal, setJournal] = useState<Journal | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchJournal()
  }, [params.id])

  const fetchJournal = async () => {
    try {
      const response = await fetch(`/api/journals/${params.id}`)
      if (!response.ok) throw new Error('Failed to fetch journal')
      const data = await response.json()
      setJournal(data.journal)
    } catch (error) {
      console.error('Error fetching journal:', error)
      toast.error('Failed to load journal')
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this journal entry?')) return

    try {
      const response = await fetch(`/api/journals/${params.id}`, {
        method: 'DELETE'
      })

      if (!response.ok) throw new Error('Failed to delete journal')

      toast.success('Journal deleted successfully')
      router.push(`/journals?campaignId=${journal?.campaignId}`)
    } catch (error) {
      console.error('Error deleting journal:', error)
      toast.error('Failed to delete journal')
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

  if (!journal) {
    return (
      <div className="container mx-auto px-6 py-8">
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-6">
          <p className="text-red-800 dark:text-red-200">Journal not found</p>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-6 py-8">
      <div className="mb-6">
        <Link
          href={`/journals?campaignId=${journal.campaignId}`}
          className="text-primary hover:underline mb-4 inline-block"
        >
          ← Back to Journals
        </Link>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden">
        {journal.image && (
          <div className="relative w-full h-64">
            <NextImage
              src={journal.image}
              alt={journal.name}
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
              <h1 className="text-4xl font-bold mb-2">{journal.name}</h1>
              <div className="flex gap-2 mb-4">
                {journal.type && (
                  <span className="inline-block px-3 py-1 text-sm font-medium rounded-full bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300">
                    {journal.type}
                  </span>
                )}
                {journal.date && (
                  <span className="inline-block px-3 py-1 text-sm font-medium rounded-full bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300">
                    {journal.date}
                  </span>
                )}
                {journal.isPrivate && (
                  <span className="inline-block px-3 py-1 text-sm font-medium rounded-full bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-300">
                    Private
                  </span>
                )}
              </div>
            </div>
            <div className="flex gap-2">
              <Link href={`/journals/${journal.id}/edit`}>
                <Button>Edit</Button>
              </Link>
              <Button onClick={handleDelete} variant="destructive">
                Delete
              </Button>
            </div>
          </div>

          {journal.description && (
            <div className="mb-6">
              <h2 className="text-xl font-semibold mb-2">Entry</h2>
              <div
                className="prose dark:prose-invert max-w-none"
                dangerouslySetInnerHTML={{ __html: journal.description }}
              />
            </div>
          )}

          <div className="border-t border-gray-200 dark:border-gray-700 pt-6">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="font-medium">Campaign:</span>{' '}
                <Link
                  href={`/campaigns/${journal.campaign?.id}`}
                  className="text-primary hover:underline"
                >
                  {journal.campaign?.name}
                </Link>
              </div>
              <div>
                <span className="font-medium">Created by:</span>{' '}
                {journal.createdBy?.name || journal.createdBy?.email}
              </div>
              <div>
                <span className="font-medium">Created:</span>{' '}
                {new Date(journal.createdAt).toLocaleDateString()}
              </div>
              <div>
                <span className="font-medium">Updated:</span>{' '}
                {new Date(journal.updatedAt).toLocaleDateString()}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
