'use client'

import { Alert, AlertDescription } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import type { Tag } from '@/types/tag'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { useEffect, useState } from 'react'
import { toast } from 'sonner'

export default function TagsPage() {
  const searchParams = useSearchParams()
  const campaignId = searchParams.get('campaignId')

  const [tags, setTags] = useState<Tag[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (campaignId) {
      fetchTags()
    } else {
      setLoading(false)
    }
  }, [campaignId])

  const fetchTags = async () => {
    try {
      const response = await fetch(`/api/tags?campaignId=${campaignId}`)
      if (!response.ok) throw new Error('Failed to fetch tags')
      const data = await response.json()
      setTags(data.tags)
    } catch (error) {
      console.error('Error fetching tags:', error)
      toast.error('Failed to load tags')
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
      <div className="container mx-auto px-6 py-8">
        <Alert>
          <AlertDescription>
            Please select a campaign to view tags.
          </AlertDescription>
        </Alert>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-6 py-8">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-4xl font-bold">Tags</h1>
        <Link href={`/tags/new?campaignId=${campaignId}`}>
          <Button>Create New Tag</Button>
        </Link>
      </div>

      <Card>
        {loading ? (
          <CardContent className="p-6">
            <div className="space-y-4">
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-4 w-1/2" />
              <Skeleton className="h-4 w-5/6" />
            </div>
          </CardContent>
        ) : tags.length === 0 ? (
          <CardContent className="p-6 text-center">
            <p className="text-muted-foreground mb-4">
              No tags yet. Create your first tag to get started!
            </p>
            <Link href={`/tags/new?campaignId=${campaignId}`}>
              <Button>Create Tag</Button>
            </Link>
          </CardContent>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Color</TableHead>
                <TableHead>Updated</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {tags.map((tag) => (
                <TableRow key={tag.id}>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      {tag.color && (
                        <div
                          className="w-4 h-4 rounded"
                          style={{ backgroundColor: tag.color }}
                        />
                      )}
                      <Link
                        href={`/tags/${tag.id}`}
                        className="font-medium text-primary hover:underline"
                      >
                        {tag.name}
                      </Link>
                    </div>
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {tag.type || '-'}
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {tag.color || '-'}
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {formatDate(tag.updatedAt)}
                  </TableCell>
                  <TableCell className="text-right">
                    <Link
                      href={`/tags/${tag.id}/edit`}
                      className="text-primary hover:underline mr-4"
                    >
                      Edit
                    </Link>
                    <Link
                      href={`/tags/${tag.id}`}
                      className="text-muted-foreground hover:text-foreground"
                    >
                      View
                    </Link>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </Card>
    </div>
  )
}
