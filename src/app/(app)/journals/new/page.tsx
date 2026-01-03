'use client'

import JournalForm from '@/components/forms/JournalForm'
import type { JournalFormData } from '@/types/journal'
import { Card, CardContent } from '@/components/ui/card'
import { useSession } from 'next-auth/react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { toast } from 'sonner'

export default function NewJournalPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { data: session } = useSession()
  const campaignId = searchParams.get('campaignId')

  if (!campaignId) {
    return (
      <div className="container mx-auto px-6 py-8">
        <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-6">
          <p className="text-yellow-800 dark:text-yellow-200 mb-4">
            Campaign ID is required to create a journal.
          </p>
          <Link href="/campaigns" className="text-blue-600 hover:text-blue-700">
            Go to Campaigns
          </Link>
        </div>
      </div>
    )
  }

  const handleSubmit = async (data: JournalFormData) => {
    if (!session?.user?.id) {
      toast.error('You must be logged in to create a journal')
      return
    }

    try {
      const response = await fetch('/api/journals', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...data,
          campaignId,
          createdById: session.user.id,
        }),
      })

      if (!response.ok) throw new Error('Failed to create journal')

      const { journal } = await response.json()
      toast.success('Journal created successfully')
      router.push(`/journals/${journal.id}`)
    } catch (error) {
      console.error('Error creating journal:', error)
      toast.error('Failed to create journal')
      throw error
    }
  }

  const handleCancel = () => {
    router.push(`/journals?campaignId=${campaignId}`)
  }

  return (
    <div className="container mx-auto px-6 py-8">
      <div className="mb-6">
        <Link
          href={`/journals?campaignId=${campaignId}`}
          className="text-blue-600 hover:text-blue-700 mb-4 inline-block"
        >
          ← Back to Journals
        </Link>
      </div>

      <Card>
        <CardContent className="p-6">
          <h1 className="text-3xl font-bold mb-6">Create New Journal</h1>
          <JournalForm
            campaignId={campaignId}
            onSubmit={handleSubmit}
            onCancel={handleCancel}
          />
        </CardContent>
      </Card>
    </div>
  )
}
