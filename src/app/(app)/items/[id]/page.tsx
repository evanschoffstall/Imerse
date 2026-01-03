'use client'

import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Skeleton } from '@/components/ui/skeleton'
import type { Item } from '@/types/item'
import NextImage from 'next/image'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { toast } from 'sonner'

export default function ItemDetailPage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const [item, setItem] = useState<Item | null>(null)
  const [loading, setLoading] = useState(true)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)

  useEffect(() => {
    fetchItem()
  }, [params.id])

  const fetchItem = async () => {
    try {
      const response = await fetch(`/api/items/${params.id}`)
      if (!response.ok) throw new Error('Failed to fetch item')
      const data = await response.json()
      setItem(data.item)
    } catch (error) {
      console.error('Error fetching item:', error)
      toast.error('Failed to load item')
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async () => {
    setIsDeleting(true)
    try {
      const response = await fetch(`/api/items/${params.id}`, {
        method: 'DELETE',
      })

      if (!response.ok) throw new Error('Failed to delete item')

      toast.success('Item deleted successfully')
      router.push('/items')
    } catch (error) {
      console.error('Error deleting item:', error)
      toast.error('Failed to delete item')
      setIsDeleting(false)
    }
  }

  if (loading) {
    return (
      <div className="container mx-auto px-6 py-8">
        <div className="space-y-4">
          <Skeleton className="h-8 w-1/4" />
          <Skeleton className="h-64 w-full" />
        </div>
      </div>
    )
  }

  if (!item) {
    return (
      <div className="container mx-auto px-6 py-8">
        <Card>
          <CardContent className="p-6 text-center">
            <p className="text-muted-foreground mb-4">Item not found</p>
            <Link href="/items">
              <Button>Back to Items</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-6 py-8">
      <div className="mb-6">
        <Link href="/items" className="text-blue-600 hover:text-blue-700 mb-4 inline-block">
          ← Back to Items
        </Link>
      </div>

      <Card className="overflow-hidden">
        {item.image && (
          <div className="relative w-full h-64">
            <NextImage
              src={item.image}
              alt={item.name}
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, 768px"
              priority
            />
          </div>
        )}

        <CardContent className="p-6">
          <div className="flex items-start justify-between mb-6">
            <div className="flex-1">
              <h1 className="text-4xl font-bold mb-2">{item.name}</h1>
              <div className="flex flex-wrap gap-2 mb-4">
                {item.type && (
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                    {item.type}
                  </span>
                )}
                {item.size && (
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200">
                    {item.size}
                  </span>
                )}
                {item.isPrivate && (
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200">
                    Private
                  </span>
                )}
              </div>
            </div>
            <div className="flex space-x-2 ml-4">
              <Link href={`/items/${item.id}/edit`}>
                <Button>Edit</Button>
              </Link>
              <Button
                variant="destructive"
                onClick={() => setDeleteDialogOpen(true)}
              >
                Delete
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            {item.price && (
              <div>
                <h3 className="text-sm font-medium text-muted-foreground mb-1">
                  Price
                </h3>
                <p className="text-gray-900 dark:text-gray-100">{item.price}</p>
              </div>
            )}
            {item.location && (
              <div>
                <h3 className="text-sm font-medium text-muted-foreground mb-1">
                  Location
                </h3>
                <p className="text-gray-900 dark:text-gray-100">{item.location}</p>
              </div>
            )}
            {item.character && (
              <div>
                <h3 className="text-sm font-medium text-muted-foreground mb-1">
                  Owner/Character
                </h3>
                <p className="text-gray-900 dark:text-gray-100">{item.character}</p>
              </div>
            )}
          </div>

          {item.description && (
            <div className="mb-8">
              <h2 className="text-2xl font-bold mb-4">Description</h2>
              <div
                className="prose dark:prose-invert max-w-none"
                dangerouslySetInnerHTML={{ __html: item.description }}
              />
            </div>
          )}

          <div className="pt-6 border-t border-gray-200 dark:border-gray-700">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm text-muted-foreground">
              <div>
                <span className="font-medium">Campaign:</span>{' '}
                <Link
                  href={`/campaigns/${item.campaign?.id}`}
                  className="text-blue-600 hover:text-blue-700"
                >
                  {item.campaign?.name}
                </Link>
              </div>
              <div>
                <span className="font-medium">Created by:</span> {item.createdBy?.name}
              </div>
              <div>
                <span className="font-medium">Created:</span>{' '}
                {new Date(item.createdAt).toLocaleDateString()}
              </div>
              <div>
                <span className="font-medium">Last updated:</span>{' '}
                {new Date(item.updatedAt).toLocaleDateString()}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Item</DialogTitle>
          </DialogHeader>
          <p className="mb-4 text-gray-700 dark:text-gray-300">
            Are you sure you want to delete "{item.name}"? This action cannot be undone.
          </p>
          <DialogFooter>
            <Button
              variant="secondary"
              onClick={() => setDeleteDialogOpen(false)}
              disabled={isDeleting}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDelete}
              disabled={isDeleting}
            >
              {isDeleting ? 'Deleting...' : 'Delete'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
