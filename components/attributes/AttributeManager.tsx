'use client'

import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'
import Select from '@/components/ui/Select'
import { Attribute, ATTRIBUTE_TYPES, AttributeFormData, COMMON_ATTRIBUTE_CATEGORIES, formatAttributeValue, groupAttributesByCategory } from '@/types/attribute'
import * as React from 'react'
import { toast } from 'sonner'

interface AttributeManagerProps {
  entityType: string
  entityId: string
  campaignId: string
  createdById: string
}

export function AttributeManager({ entityType, entityId, campaignId, createdById }: AttributeManagerProps) {
  const [attributes, setAttributes] = React.useState<Attribute[]>([])
  const [loading, setLoading] = React.useState(true)
  const [isAdding, setIsAdding] = React.useState(false)
  const [editingId, setEditingId] = React.useState<string | null>(null)
  const [formData, setFormData] = React.useState<AttributeFormData>({
    key: '',
    value: '',
    type: 'text',
    category: '',
    order: 0,
    isPrivate: false
  })

  React.useEffect(() => {
    fetchAttributes()
  }, [entityType, entityId, campaignId])

  const fetchAttributes = async () => {
    try {
      const response = await fetch(
        `/api/attributes?entityType=${entityType}&entityId=${entityId}&campaignId=${campaignId}`
      )
      if (response.ok) {
        const data = await response.json()
        setAttributes(data.attributes || [])
      }
    } catch (error) {
      console.error('Error fetching attributes:', error)
      toast.error('Failed to load attributes')
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.key || !formData.value) {
      toast.error('Key and value are required')
      return
    }

    try {
      if (editingId) {
        // Update existing attribute
        const response = await fetch(`/api/attributes/${editingId}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(formData)
        })

        if (!response.ok) {
          const error = await response.json()
          throw new Error(error.error || 'Failed to update attribute')
        }

        toast.success('Attribute updated')
      } else {
        // Create new attribute
        const response = await fetch('/api/attributes', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            ...formData,
            entityType,
            entityId,
            campaignId,
            createdById
          })
        })

        if (!response.ok) {
          const error = await response.json()
          throw new Error(error.error || 'Failed to create attribute')
        }

        toast.success('Attribute added')
      }

      // Reset form and refresh
      setFormData({
        key: '',
        value: '',
        type: 'text',
        category: '',
        order: 0,
        isPrivate: false
      })
      setIsAdding(false)
      setEditingId(null)
      fetchAttributes()
    } catch (error: any) {
      console.error('Error saving attribute:', error)
      toast.error(error.message || 'Failed to save attribute')
    }
  }

  const handleEdit = (attribute: Attribute) => {
    setFormData({
      key: attribute.key,
      value: attribute.value,
      type: attribute.type,
      category: attribute.category || '',
      order: attribute.order,
      isPrivate: attribute.isPrivate
    })
    setEditingId(attribute.id)
    setIsAdding(true)
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this attribute?')) return

    try {
      const response = await fetch(`/api/attributes/${id}`, {
        method: 'DELETE'
      })

      if (!response.ok) {
        throw new Error('Failed to delete attribute')
      }

      toast.success('Attribute deleted')
      fetchAttributes()
    } catch (error) {
      console.error('Error deleting attribute:', error)
      toast.error('Failed to delete attribute')
    }
  }

  const handleCancel = () => {
    setFormData({
      key: '',
      value: '',
      type: 'text',
      category: '',
      order: 0,
      isPrivate: false
    })
    setIsAdding(false)
    setEditingId(null)
  }

  if (loading) {
    return <div className="py-4">Loading attributes...</div>
  }

  const groupedAttributes = groupAttributesByCategory(attributes)

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">Attributes</h3>
        {!isAdding && (
          <Button onClick={() => setIsAdding(true)}>Add Attribute</Button>
        )}
      </div>

      {isAdding && (
        <form onSubmit={handleSubmit} className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Key *</label>
              <Input
                value={formData.key}
                onChange={(e) => setFormData({ ...formData, key: e.target.value })}
                placeholder="e.g., HP, Strength, Level"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Value *</label>
              <Input
                value={formData.value}
                onChange={(e) => setFormData({ ...formData, value: e.target.value })}
                placeholder="Enter value"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Type</label>
              <Select
                value={formData.type}
                onChange={(e) => setFormData({ ...formData, type: e.target.value as any })}
              >
                {ATTRIBUTE_TYPES.map(type => (
                  <option key={type.value} value={type.value}>
                    {type.label}
                  </option>
                ))}
              </Select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Category</label>
              <Input
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                placeholder="e.g., Stats, Skills"
                list="category-suggestions"
              />
              <datalist id="category-suggestions">
                {COMMON_ATTRIBUTE_CATEGORIES.map(cat => (
                  <option key={cat} value={cat} />
                ))}
              </datalist>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Order</label>
              <Input
                type="number"
                value={formData.order}
                onChange={(e) => setFormData({ ...formData, order: parseInt(e.target.value) || 0 })}
              />
            </div>
          </div>

          <div className="flex items-center">
            <input
              type="checkbox"
              id="isPrivate"
              checked={formData.isPrivate}
              onChange={(e) => setFormData({ ...formData, isPrivate: e.target.checked })}
              className="h-4 w-4 text-blue-600 border-gray-300 rounded"
            />
            <label htmlFor="isPrivate" className="ml-2 text-sm">
              Private (only visible to campaign owner)
            </label>
          </div>

          <div className="flex gap-2">
            <Button type="submit">
              {editingId ? 'Update' : 'Add'} Attribute
            </Button>
            <Button type="button" onClick={handleCancel} variant="secondary">
              Cancel
            </Button>
          </div>
        </form>
      )}

      {groupedAttributes.length === 0 && !isAdding && (
        <div className="text-center py-8 text-gray-500 dark:text-gray-400">
          No attributes yet. Click "Add Attribute" to get started.
        </div>
      )}

      {groupedAttributes.map(group => (
        <div key={group.category} className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
          <h4 className="font-semibold mb-3 text-sm text-gray-700 dark:text-gray-300 uppercase tracking-wide">
            {group.category}
          </h4>
          <div className="space-y-2">
            {group.attributes.map(attribute => (
              <div
                key={attribute.id}
                className="flex justify-between items-center py-2 border-b border-gray-200 dark:border-gray-700 last:border-0"
              >
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="font-medium">{attribute.key}:</span>
                    {attribute.type === 'url' ? (
                      <a
                        href={attribute.value}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:underline"
                      >
                        {formatAttributeValue(attribute)}
                      </a>
                    ) : (
                      <span>{formatAttributeValue(attribute)}</span>
                    )}
                    {attribute.isPrivate && (
                      <span className="text-xs px-2 py-0.5 bg-gray-200 dark:bg-gray-700 rounded">
                        Private
                      </span>
                    )}
                  </div>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleEdit(attribute)}
                    className="text-sm text-blue-600 hover:text-blue-700"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(attribute.id)}
                    className="text-sm text-red-600 hover:text-red-700"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}
