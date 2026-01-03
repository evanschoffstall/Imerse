'use client'

import { Alert, AlertDescription } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import type { Organisation } from '@/types/organisation'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { useEffect, useState } from 'react'
import { toast } from 'sonner'

export default function OrganisationsPage() {
  const searchParams = useSearchParams()
  const campaignId = searchParams.get('campaignId')

  const [organisations, setOrganisations] = useState<Organisation[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (campaignId) {
      fetchOrganisations()
    } else {
      setLoading(false)
    }
  }, [campaignId])

  const fetchOrganisations = async () => {
    try {
      const response = await fetch(`/api/organisations?campaignId=${campaignId}`)
      if (!response.ok) throw new Error('Failed to fetch organisations')
      const data = await response.json()
      setOrganisations(data.organisations)
    } catch (error) {
      console.error('Error fetching organisations:', error)
      toast.error('Failed to load organisations')
    } finally {
      setLoading(false)
    }
  }

  const formatDate = (date: Date) => {
    const now = new Date()
    const diff = now.getTime() - new Date(date).getTime()
    const days = Math.floor(diff / (1000 * 60 * 60 * 24))

    if (days === 0) return 'Today'
    if (days === 1) return 'Yesterday'
    if (days < 7) return `${days} days ago`
    return new Date(date).toLocaleDateString()
  }

  if (!campaignId) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Alert>
          <AlertDescription>
            Please select a campaign to view organisations.
          </AlertDescription>
        </Alert>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-4xl font-bold">Organisations</h1>
        <Link href={`/organisations/new?campaignId=${campaignId}`}>
          <Button>Create New Organisation</Button>
        </Link>
      </div>

      <Card>
        <CardContent className="p-0">
          {loading ? (
            <div className="p-6 space-y-4">
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-4 w-1/2" />
              <Skeleton className="h-4 w-5/6" />
            </div>
          ) : organisations.length === 0 ? (
            <div className="p-6 text-center">
              <p className="text-muted-foreground mb-4">
                No organisations yet. Create your first organisation to get started!
              </p>
              <Link href={`/organisations/new?campaignId=${campaignId}`}>
                <Button>Create Organisation</Button>
              </Link>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Location</TableHead>
                  <TableHead>Updated</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {organisations.map((organisation) => (
                  <TableRow key={organisation.id}>
                    <TableCell>
                      <Link
                        href={`/organisations/${organisation.id}`}
                        className="font-medium text-primary hover:underline"
                      >
                        {organisation.name}
                      </Link>
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {organisation.type || '-'}
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {organisation.location || '-'}
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {formatDate(organisation.updatedAt)}
                    </TableCell>
                    <TableCell className="text-right space-x-2">
                      <Link
                        href={`/organisations/${organisation.id}/edit`}
                        className="text-primary hover:underline"
                      >
                        Edit
                      </Link>
                      <Link
                        href={`/organisations/${organisation.id}`}
                        className="text-muted-foreground hover:underline"
                      >
                        View
                      </Link>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
