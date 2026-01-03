'use client'

import { CharacterForm } from '@/components/forms/CharacterForm'
import type { CharacterFormData } from '@/types/character'
import { Card, CardContent } from '@/components/ui/card'
import { useSession } from 'next-auth/react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { toast } from 'sonner'

export default function NewCharacterPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { data: session } = useSession()
  const campaignId = searchParams.get('campaignId')

  if (!campaignId) {
    return (
      <div className="container mx-auto px-6 py-8">
        <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-6">
          <p className="text-yellow-800 dark:text-yellow-200 mb-4">
            Campaign ID is required to create a character.
          </p>
          <Link href="/campaigns" className="text-blue-600 hover:text-blue-700">
            Go to Campaigns
          </Link>
        </div>
      </div>
    )
  }

  const handleSubmit = async (data: CharacterFormData) => {
    if (!session?.user?.id) {
      toast.error('You must be logged in to create a character')
      return
    }

    try {
      const response = await fetch('/api/characters', {
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

      if (!response.ok) throw new Error('Failed to create character')

      const { character } = await response.json()
      toast.success('Character created successfully')
      router.push(`/characters/${character.id}`)
    } catch (error) {
      console.error('Error creating character:', error)
      toast.error('Failed to create character')
      throw error
    }
  }

  const handleCancel = () => {
    router.push(`/characters?campaignId=${campaignId}`)
  }

  return (
    <div className="container mx-auto px-6 py-8">
      <div className="mb-6">
        <Link
          href={`/characters?campaignId=${campaignId}`}
          className="text-blue-600 hover:text-blue-700 mb-4 inline-block"
        >
          ← Back to Characters
        </Link>
      </div>

      <Card>
        <CardContent className="p-6">
          <h1 className="text-3xl font-bold mb-6">Create New Character</h1>
          <CharacterForm
            campaignId={campaignId}
            onSubmit={handleSubmit}
            onCancel={handleCancel}
          />
        </CardContent>
      </Card>
    </div>
  )
}
