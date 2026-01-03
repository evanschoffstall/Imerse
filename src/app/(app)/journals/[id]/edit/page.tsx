'use client'

import JournalForm from '@/components/forms/JournalForm'
import type { Journal, JournalFormData } from '@/types/journal'
import { Card, CardContent } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { toast } from 'sonner'

export default function EditJournalPage({ params }: { params: { id: string } }) {
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

  const handleSubmit = async (data: JournalFormData) => {
    try {
      const response = await fetch(`/api/journals/${params.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
      })

      if (!response.ok) throw new Error('Failed to update journal')

      toast.success('Journal updated successfully')
      router.push(`/journals/${params.id}`)
    } catch (error) {
      console.error('Error updating journal:', error)
      toast.error('Failed to update journal')
      throw error
    }
  }

  const handleCancel = () => {
    router.push(`/journals/${params.id}`)
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
          href={`/journals/${journal.id}`}
          className="text-primary hover:underline mb-4 inline-block"
        >
          ← Back to Journal
        </Link>
      </div>

      <Card>
        <CardContent className="p-6">
          <h1 className="text-3xl font-bold mb-6">Edit Journal</h1>
          <JournalForm
            journal={journal}
            campaignId={journal.campaignId}
            onSubmit={handleSubmit}
            onCancel={handleCancel}
          />
        </CardContent>
      </Card>
    </div>
  )
}
