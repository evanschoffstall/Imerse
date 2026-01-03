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
import type { Item } from '@/types/item'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { useEffect, useState } from 'react'
import { toast } from 'sonner'

export default function ItemsPage() {
  const searchParams = useSearchParams()
  const campaignId = searchParams.get('campaignId')

  const [items, setItems] = useState<Item[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (campaignId) {
      fetchItems()
    } else {
      setLoading(false)
    }
  }, [campaignId])

  const fetchItems = async () => {
    try {
      const response = await fetch(`/api/items?campaignId=${campaignId}`)
      if (!response.ok) throw new Error('Failed to fetch items')
      const data = await response.json()
      setItems(data.items)
    } catch (error) {
      console.error('Error fetching items:', error)
      toast.error('Failed to load items')
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
            Please select a campaign to view items.
          </AlertDescription>
        </Alert>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-4xl font-bold">Items</h1>
        <Link href={`/items/new?campaignId=${campaignId}`}>
          <Button>Create New Item</Button>
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
          ) : items.length === 0 ? (
            <div className="p-6 text-center">
              <p className="text-muted-foreground mb-4">
                No items yet. Create your first item to get started!
              </p>
              <Link href={`/items/new?campaignId=${campaignId}`}>
                <Button>Create Item</Button>
              </Link>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Price</TableHead>
                  <TableHead>Owner</TableHead>
                  <TableHead>Updated</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {items.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell>
                      <Link
                        href={`/items/${item.id}`}
                        className="font-medium text-primary hover:underline"
                      >
                        {item.name}
                      </Link>
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {item.type || '-'}
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {item.price || '-'}
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {item.character || '-'}
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {formatDate(item.updatedAt)}
                    </TableCell>
                    <TableCell className="text-right space-x-2">
                      <Link
                        href={`/items/${item.id}/edit`}
                        className="text-primary hover:underline"
                      >
                        Edit
                      </Link>
                      <Link
                        href={`/items/${item.id}`}
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
