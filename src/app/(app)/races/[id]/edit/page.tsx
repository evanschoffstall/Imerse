'use client'

import RaceForm from '@/components/forms/RaceForm'
import type { Race, RaceFormData } from '@/types/race'
import { Card, CardContent } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { toast } from 'sonner'

export default function EditRacePage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const [race, setRace] = useState<Race | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchRace()
  }, [params.id])

  const fetchRace = async () => {
    try {
      const response = await fetch(`/api/races/${params.id}`)
      if (!response.ok) throw new Error('Failed to fetch race')
      const data = await response.json()
      setRace(data.race)
    } catch (error) {
      console.error('Error fetching race:', error)
      toast.error('Failed to load race')
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (data: RaceFormData) => {
    try {
      const response = await fetch(`/api/races/${params.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
      })

      if (!response.ok) throw new Error('Failed to update race')

      toast.success('Race updated successfully')
      router.push(`/races/${params.id}`)
    } catch (error) {
      console.error('Error updating race:', error)
      toast.error('Failed to update race')
      throw error
    }
  }

  const handleCancel = () => {
    router.push(`/races/${params.id}`)
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

  if (!race) {
    return (
      <div className="container mx-auto px-6 py-8">
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-6">
          <p className="text-red-800 dark:text-red-200">Race not found</p>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-6 py-8">
      <div className="mb-6">
        <Link
          href={`/races/${race.id}`}
          className="text-primary hover:underline mb-4 inline-block"
        >
          ← Back to Race
        </Link>
      </div>

      <Card>
        <CardContent className="p-6">
          <h1 className="text-3xl font-bold mb-6">Edit Race</h1>
          <RaceForm
            race={race}
            campaignId={race.campaignId}
            onSubmit={handleSubmit}
            onCancel={handleCancel}
          />
        </CardContent>
      </Card>
    </div>
  )
}
