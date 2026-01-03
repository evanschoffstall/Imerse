'use client'

import OrganisationForm from '@/components/forms/OrganisationForm'
import type { Organisation, OrganisationFormData } from '@/types/organisation'
import { Card, CardContent } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { toast } from 'sonner'

export default function EditOrganisationPage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const [organisation, setOrganisation] = useState<Organisation | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchOrganisation()
  }, [params.id])

  const fetchOrganisation = async () => {
    try {
      const response = await fetch(`/api/organisations/${params.id}`)
      if (!response.ok) throw new Error('Failed to fetch organisation')
      const data = await response.json()
      setOrganisation(data.organisation)
    } catch (error) {
      console.error('Error fetching organisation:', error)
      toast.error('Failed to load organisation')
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (data: OrganisationFormData) => {
    try {
      const response = await fetch(`/api/organisations/${params.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
      })

      if (!response.ok) throw new Error('Failed to update organisation')

      toast.success('Organisation updated successfully')
      router.push(`/organisations/${params.id}`)
    } catch (error) {
      console.error('Error updating organisation:', error)
      toast.error('Failed to update organisation')
      throw error
    }
  }

  const handleCancel = () => {
    router.push(`/organisations/${params.id}`)
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

  if (!organisation) {
    return (
      <div className="container mx-auto px-6 py-8">
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-6">
          <p className="text-red-800 dark:text-red-200">Organisation not found</p>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-6 py-8">
      <div className="mb-6">
        <Link
          href={`/organisations/${organisation.id}`}
          className="text-blue-600 hover:text-blue-700 mb-4 inline-block"
        >
          ← Back to Organisation
        </Link>
      </div>

      <Card>
        <CardContent className="p-6">
          <h1 className="text-3xl font-bold mb-6">Edit Organisation</h1>
          <OrganisationForm
            organisation={organisation}
            campaignId={organisation.campaignId}
            onSubmit={handleSubmit}
            onCancel={handleCancel}
          />
        </CardContent>
      </Card>
    </div>
  )
}
