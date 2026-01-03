'use client'

import RaceForm from '@/components/forms/RaceForm'
import type { RaceFormData } from '@/types/race'
import { Card, CardContent } from '@/components/ui/card'
import { useSession } from 'next-auth/react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { toast } from 'sonner'

export default function NewRacePage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { data: session } = useSession()
  const campaignId = searchParams.get('campaignId')

  if (!campaignId) {
    return (
      <div className="container mx-auto px-6 py-8">
        <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-6">
          <p className="text-yellow-800 dark:text-yellow-200 mb-4">
            Campaign ID is required to create a race.
          </p>
          <Link href="/campaigns" className="text-primary hover:underline">
            Go to Campaigns
          </Link>
        </div>
      </div>
    )
  }

  const handleSubmit = async (data: RaceFormData) => {
    if (!session?.user?.id) {
      toast.error('You must be logged in to create a race')
      return
    }

    try {
      const response = await fetch('/api/races', {
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

      if (!response.ok) throw new Error('Failed to create race')

      const { race } = await response.json()
      toast.success('Race created successfully')
      router.push(`/races/${race.id}`)
    } catch (error) {
      console.error('Error creating race:', error)
      toast.error('Failed to create race')
      throw error
    }
  }

  const handleCancel = () => {
    router.push(`/races?campaignId=${campaignId}`)
  }

  return (
    <div className="container mx-auto px-6 py-8">
      <div className="mb-6">
        <Link
          href={`/races?campaignId=${campaignId}`}
          className="text-primary hover:underline mb-4 inline-block"
        >
          ← Back to Races
        </Link>
      </div>

      <Card>
        <CardContent className="p-6">
          <h1 className="text-3xl font-bold mb-6">Create New Race</h1>
          <RaceForm
            campaignId={campaignId}
            onSubmit={handleSubmit}
            onCancel={handleCancel}
          />
        </CardContent>
      </Card>
    </div>
  )
}
