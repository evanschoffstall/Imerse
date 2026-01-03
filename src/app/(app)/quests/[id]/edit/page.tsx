'use client'

import QuestForm from '@/components/forms/QuestForm'
import type { Quest, QuestFormData } from '@/types/quest'
import { Card, CardContent } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { toast } from 'sonner'

export default function EditQuestPage({ params }: { params: { id: string } }) {
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

  const handleSubmit = async (data: QuestFormData) => {
    try {
      const response = await fetch(`/api/quests/${params.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
      })

      if (!response.ok) throw new Error('Failed to update quest')

      toast.success('Quest updated successfully')
      router.push(`/quests/${params.id}`)
    } catch (error) {
      console.error('Error updating quest:', error)
      toast.error('Failed to update quest')
      throw error
    }
  }

  const handleCancel = () => {
    router.push(`/quests/${params.id}`)
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

  if (!quest) {
    return (
      <div className="container mx-auto px-6 py-8">
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-6">
          <p className="text-red-800 dark:text-red-200">Quest not found</p>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-6 py-8">
      <div className="mb-6">
        <Link
          href={`/quests/${quest.id}`}
          className="text-primary hover:underline mb-4 inline-block"
        >
          ← Back to Quest
        </Link>
      </div>

      <Card>
        <CardContent className="p-6">
          <h1 className="text-3xl font-bold mb-6">Edit Quest</h1>
          <QuestForm
            quest={quest}
            campaignId={quest.campaignId}
            onSubmit={handleSubmit}
            onCancel={handleCancel}
          />
        </CardContent>
      </Card>
    </div>
  )
}
