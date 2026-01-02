'use client'

import FamilyForm from '@/components/forms/FamilyForm'
import type { FamilyFormData } from '@/types/family'
import { useSession } from 'next-auth/react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { toast } from 'sonner'

export default function NewFamilyPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { data: session } = useSession()
  const campaignId = searchParams.get('campaignId')

  if (!campaignId) {
    return (
      <div className="container mx-auto px-6 py-8">
        <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-6">
          <p className="text-yellow-800 dark:text-yellow-200 mb-4">
            Campaign ID is required to create a family.
          </p>
          <Link href="/campaigns" className="text-blue-600 hover:text-blue-700">
            Go to Campaigns
          </Link>
        </div>
      </div>
    )
  }

  const handleSubmit = async (data: FamilyFormData) => {
    if (!session?.user?.id) {
      toast.error('You must be logged in to create a family')
      return
    }

    try {
      const response = await fetch('/api/families', {
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

      if (!response.ok) throw new Error('Failed to create family')

      const { family } = await response.json()
      toast.success('Family created successfully')
      router.push(`/families/${family.id}`)
    } catch (error) {
      console.error('Error creating family:', error)
      toast.error('Failed to create family')
      throw error
    }
  }

  const handleCancel = () => {
    router.push(`/families?campaignId=${campaignId}`)
  }

  return (
    <div className="container mx-auto px-6 py-8">
      <div className="mb-6">
        <Link
          href={`/families?campaignId=${campaignId}`}
          className="text-blue-600 hover:text-blue-700 mb-4 inline-block"
        >
          ← Back to Families
        </Link>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
        <h1 className="text-3xl font-bold mb-6">Create New Family</h1>
        <FamilyForm
          campaignId={campaignId}
          onSubmit={handleSubmit}
          onCancel={handleCancel}
        />
      </div>
    </div>
  )
}
