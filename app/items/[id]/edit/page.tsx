'use client'

import ItemForm from '@/components/forms/ItemForm'
import type { Item, ItemFormData } from '@/types/item'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { toast } from 'sonner'

export default function EditItemPage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const [item, setItem] = useState<Item | null>(null)
  const [loading, setLoading] = useState(true)

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

  const handleSubmit = async (data: ItemFormData) => {
    try {
      const response = await fetch(`/api/items/${params.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      })

      if (!response.ok) throw new Error('Failed to update item')

      toast.success('Item updated successfully')
      router.push(`/items/${params.id}`)
    } catch (error) {
      console.error('Error updating item:', error)
      toast.error('Failed to update item')
      throw error
    }
  }

  const handleCancel = () => {
    router.push(`/items/${params.id}`)
  }

  if (loading) {
    return (
      <div className="container mx-auto px-6 py-8">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="h-96 bg-gray-200 rounded"></div>
        </div>
      </div>
    )
  }

  if (!item) {
    return (
      <div className="container mx-auto px-6 py-8">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 text-center">
          <p className="text-gray-600 dark:text-gray-400 mb-4">Item not found</p>
          <Link href="/items" className="text-blue-600 hover:text-blue-700">
            Back to Items
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-6 py-8">
      <div className="mb-6">
        <Link
          href={`/items/${item.id}`}
          className="text-blue-600 hover:text-blue-700 mb-4 inline-block"
        >
          ← Back to Item
        </Link>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
        <h1 className="text-3xl font-bold mb-6">Edit Item</h1>
        <ItemForm
          item={item}
          campaignId={item.campaignId}
          onSubmit={handleSubmit}
          onCancel={handleCancel}
        />
      </div>
    </div>
  )
}
