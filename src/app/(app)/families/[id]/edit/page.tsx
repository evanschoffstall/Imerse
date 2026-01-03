'use client'

import FamilyForm from '@/components/forms/FamilyForm'
import type { Family, FamilyFormData } from '@/types/family'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { toast } from 'sonner'

export default function EditFamilyPage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const [family, setFamily] = useState<Family | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchFamily()
  }, [params.id])

  const fetchFamily = async () => {
    try {
      const response = await fetch(`/api/families/${params.id}`)
      if (!response.ok) throw new Error('Failed to fetch family')
      const data = await response.json()
      setFamily(data.family)
    } catch (error) {
      console.error('Error fetching family:', error)
      toast.error('Failed to load family')
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (data: FamilyFormData) => {
    try {
      const response = await fetch(`/api/families/${params.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
      })

      if (!response.ok) throw new Error('Failed to update family')

      toast.success('Family updated successfully')
      router.push(`/families/${params.id}`)
    } catch (error) {
      console.error('Error updating family:', error)
      toast.error('Failed to update family')
      throw error
    }
  }

  const handleCancel = () => {
    router.push(`/families/${params.id}`)
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

  if (!family) {
    return (
      <div className="container mx-auto px-6 py-8">
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-6">
          <p className="text-red-800 dark:text-red-200">Family not found</p>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-6 py-8">
      <div className="mb-6">
        <Link
          href={`/families/${family.id}`}
          className="text-blue-600 hover:text-blue-700 mb-4 inline-block"
        >
          ← Back to Family
        </Link>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
        <h1 className="text-3xl font-bold mb-6">Edit Family</h1>
        <FamilyForm
          family={family}
          campaignId={family.campaignId}
          onSubmit={handleSubmit}
          onCancel={handleCancel}
        />
      </div>
    </div>
  )
}
