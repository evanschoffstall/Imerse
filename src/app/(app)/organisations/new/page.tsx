'use client'

import OrganisationForm from '@/components/forms/OrganisationForm'
import type { OrganisationFormData } from '@/types/organisation'
import { Card, CardContent } from '@/components/ui/card'
import { useSession } from 'next-auth/react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { toast } from 'sonner'

export default function NewOrganisationPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { data: session } = useSession()
  const campaignId = searchParams.get('campaignId')

  if (!campaignId) {
    return (
      <div className="container mx-auto px-6 py-8">
        <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-6">
          <p className="text-yellow-800 dark:text-yellow-200 mb-4">
            Campaign ID is required to create an organisation.
          </p>
          <Link href="/campaigns" className="text-primary hover:underline">
            Go to Campaigns
          </Link>
        </div>
      </div>
    )
  }

  const handleSubmit = async (data: OrganisationFormData) => {
    if (!session?.user?.id) {
      toast.error('You must be logged in to create an organisation')
      return
    }

    try {
      const response = await fetch('/api/organisations', {
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

      if (!response.ok) throw new Error('Failed to create organisation')

      const { organisation } = await response.json()
      toast.success('Organisation created successfully')
      router.push(`/organisations/${organisation.id}`)
    } catch (error) {
      console.error('Error creating organisation:', error)
      toast.error('Failed to create organisation')
      throw error
    }
  }

  const handleCancel = () => {
    router.push(`/organisations?campaignId=${campaignId}`)
  }

  return (
    <div className="container mx-auto px-6 py-8">
      <div className="mb-6">
        <Link
          href={`/organisations?campaignId=${campaignId}`}
          className="text-primary hover:underline mb-4 inline-block"
        >
          ← Back to Organisations
        </Link>
      </div>

      <Card>
        <CardContent className="p-6">
          <h1 className="text-3xl font-bold mb-6">Create New Organisation</h1>
          <OrganisationForm
            campaignId={campaignId}
            onSubmit={handleSubmit}
            onCancel={handleCancel}
          />
        </CardContent>
      </Card>
    </div>
  )
}
