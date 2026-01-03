'use client'

import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import RichTextViewer from '@/components/editor/RichTextViewer'
import type { Race } from '@/types/race'
import NextImage from 'next/image'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { toast } from 'sonner'

export default function RaceDetailPage({ params }: { params: { id: string } }) {
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

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this race?')) return

    try {
      const response = await fetch(`/api/races/${params.id}`, {
        method: 'DELETE'
      })

      if (!response.ok) throw new Error('Failed to delete race')

      toast.success('Race deleted successfully')
      router.push(`/races?campaignId=${race?.campaignId}`)
    } catch (error) {
      console.error('Error deleting race:', error)
      toast.error('Failed to delete race')
    }
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
          href={`/races?campaignId=${race.campaignId}`}
          className="text-primary hover:underline mb-4 inline-block"
        >
          ← Back to Races
        </Link>
      </div>

      <Card className="overflow-hidden">
        {race.image && (
          <div className="relative w-full h-64">
            <NextImage
              src={race.image}
              alt={race.name}
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, 768px"
              priority
            />
          </div>
        )}

        <CardContent className="p-6">
          <div className="flex items-start justify-between mb-4">
            <div className="flex-1">
              <h1 className="text-4xl font-bold mb-2">{race.name}</h1>
              <div className="flex gap-2 mb-4">
                {race.type && (
                  <span className="inline-block px-3 py-1 text-sm font-medium rounded-full bg-teal-100 text-teal-800 dark:bg-teal-900/30 dark:text-teal-300">
                    {race.type}
                  </span>
                )}
                {race.isPrivate && (
                  <span className="inline-block px-3 py-1 text-sm font-medium rounded-full bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-300">
                    Private
                  </span>
                )}
              </div>
            </div>
            <div className="flex gap-2">
              <Link href={`/races/${race.id}/edit`}>
                <Button>Edit</Button>
              </Link>
              <Button onClick={handleDelete} variant="destructive">
                Delete
              </Button>
            </div>
          </div>

          {race.description && (
            <div className="mb-6">
              <h2 className="text-xl font-semibold mb-3">Details</h2>
              <RichTextViewer content={race.description} />
            </div>
          )}

          <div className="border-t border-gray-200 dark:border-gray-700 pt-6">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="font-medium">Campaign:</span>{' '}
                <Link
                  href={`/campaigns/${race.campaign?.id}`}
                  className="text-primary hover:underline"
                >
                  {race.campaign?.name}
                </Link>
              </div>
              <div>
                <span className="font-medium">Created by:</span>{' '}
                {race.createdBy?.name || race.createdBy?.email}
              </div>
              <div>
                <span className="font-medium">Created:</span>{' '}
                {new Date(race.createdAt).toLocaleDateString()}
              </div>
              <div>
                <span className="font-medium">Updated:</span>{' '}
                {new Date(race.updatedAt).toLocaleDateString()}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
