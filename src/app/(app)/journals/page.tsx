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
import type { Journal } from '@/types/journal'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { useCallback, useEffect, useState } from 'react'
import { toast } from 'sonner'

export default function JournalsPage() {
  const searchParams = useSearchParams()
  const campaignId = searchParams.get('campaignId')

  const [journals, setJournals] = useState<Journal[]>([])
  const [loading, setLoading] = useState(true)

  const fetchJournals = useCallback(async () => {
    try {
      const response = await fetch(`/api/journals?campaignId=${campaignId}`)
      if (!response.ok) throw new Error('Failed to fetch journals')
      const data = await response.json()
      setJournals(data.journals)
    } catch (error) {
      console.error('Error fetching journals:', error)
      toast.error('Failed to load journals')
    } finally {
      setLoading(false)
    }
  }, [campaignId])

  useEffect(() => {
    if (campaignId) {
      fetchJournals()
    } else {
      setLoading(false)
    }
  }, [campaignId, fetchJournals])

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
            Please select a campaign to view journals.
          </AlertDescription>
        </Alert>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-4xl font-bold">Journals</h1>
        <Link href={`/journals/new?campaignId=${campaignId}`}>
          <Button>Create New Journal</Button>
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
          ) : journals.length === 0 ? (
            <div className="p-6 text-center">
              <p className="text-muted-foreground mb-4">
                No journals yet. Create your first journal entry to get started!
              </p>
              <Link href={`/journals/new?campaignId=${campaignId}`}>
                <Button>Create Journal</Button>
              </Link>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Updated</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {journals.map((journal) => (
                  <TableRow key={journal.id}>
                    <TableCell>
                      <Link
                        href={`/journals/${journal.id}`}
                        className="font-medium text-primary hover:underline"
                      >
                        {journal.name}
                      </Link>
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {journal.type || '-'}
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {journal.date || '-'}
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {formatDate(journal.updatedAt)}
                    </TableCell>
                    <TableCell className="text-right space-x-2">
                      <Link
                        href={`/journals/${journal.id}/edit`}
                        className="text-primary hover:underline"
                      >
                        Edit
                      </Link>
                      <Link
                        href={`/journals/${journal.id}`}
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
