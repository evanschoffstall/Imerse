'use client'

import { Button } from '@/components/ui/button'
import { ATTITUDE_LABELS, type RelationWithEntities } from '@/types/relation'
import { useEffect, useState } from 'react'
import { toast } from 'sonner'

interface RelationsListProps {
  entityId: string
  entityType: string
  entityName?: string
  campaignId: string
  onAddRelation?: () => void
}

export default function RelationsList({
  entityId,
  entityType,
  entityName,
  campaignId,
  onAddRelation,
}: RelationsListProps) {
  const [relations, setRelations] = useState<RelationWithEntities[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchRelations()
  }, [entityId, entityType])

  const fetchRelations = async () => {
    try {
      const response = await fetch(
        `/api/relations?ownerId=${entityId}&ownerType=${entityType}`
      )
      if (!response.ok) throw new Error('Failed to fetch relations')
      const data = await response.json()
      setRelations(data)
    } catch (error) {
      console.error('Error fetching relations:', error)
      toast.error('Failed to load relations')
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (relationId: string) => {
    if (!confirm('Are you sure you want to delete this relation?')) return

    try {
      const response = await fetch(`/api/relations/${relationId}`, {
        method: 'DELETE',
      })

      if (!response.ok) throw new Error('Failed to delete relation')

      toast.success('Relation deleted successfully')
      fetchRelations()
    } catch (error) {
      console.error('Error deleting relation:', error)
      toast.error('Failed to delete relation')
    }
  }

  const handleTogglePin = async (relation: RelationWithEntities) => {
    try {
      const response = await fetch(`/api/relations/${relation.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          isPinned: !relation.isPinned,
        }),
      })

      if (!response.ok) throw new Error('Failed to update relation')

      toast.success(relation.isPinned ? 'Unpinned relation' : 'Pinned relation')
      fetchRelations()
    } catch (error) {
      console.error('Error updating relation:', error)
      toast.error('Failed to update relation')
    }
  }

  if (loading) {
    return (
      <div className="animate-pulse space-y-3">
        <div className="h-20 bg-gray-200 rounded-lg"></div>
        <div className="h-20 bg-gray-200 rounded-lg"></div>
        <div className="h-20 bg-gray-200 rounded-lg"></div>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Relations</h3>
        {onAddRelation && (
          <Button onClick={onAddRelation} size="sm">
            Add Relation
          </Button>
        )}
      </div>

      {relations.length === 0 ? (
        <div className="text-center py-8 bg-gray-50 rounded-lg border-2 border-dashed border-gray-200">
          <p className="text-gray-500">No relations yet</p>
          {onAddRelation && (
            <Button onClick={onAddRelation} variant="secondary" size="sm" className="mt-3">
              Create First Relation
            </Button>
          )}
        </div>
      ) : (
        <div className="space-y-3">
          {relations.map((relation) => (
            <div
              key={relation.id}
              className="flex items-center justify-between p-4 bg-white border rounded-lg hover:shadow-md transition-shadow"
              style={{
                borderLeftWidth: '4px',
                borderLeftColor: relation.colour || '#cbd5e1',
              }}
            >
              <div className="flex-1">
                <div className="flex items-center gap-3">
                  <span className="text-sm font-medium text-gray-500 uppercase tracking-wide">
                    {relation.relation}
                  </span>
                  {relation.isPinned && (
                    <span className="text-yellow-500" title="Pinned">
                      📌
                    </span>
                  )}
                </div>

                <p className="text-lg font-semibold mt-1">
                  {relation.targetId}
                  <span className="text-sm text-gray-500 font-normal ml-2">
                    ({relation.targetType})
                  </span>
                </p>

                {relation.attitude !== 0 && (
                  <div className="flex items-center gap-2 mt-2">
                    <span className="text-xs font-medium text-gray-500">Attitude:</span>
                    <span
                      className={`text-xs px-2 py-1 rounded-full ${relation.attitude > 0
                        ? 'bg-green-100 text-green-700'
                        : 'bg-red-100 text-red-700'
                        }`}
                    >
                      {ATTITUDE_LABELS[relation.attitude]} ({relation.attitude > 0 ? '+' : ''}
                      {relation.attitude})
                    </span>
                  </div>
                )}

                {relation.mirror && (
                  <p className="text-xs text-gray-500 mt-2">
                    ↔️ Reciprocal relation exists
                  </p>
                )}
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleTogglePin(relation)}
                  className="p-2 text-gray-400 hover:text-yellow-500 transition-colors"
                  title={relation.isPinned ? 'Unpin' : 'Pin'}
                >
                  {relation.isPinned ? '📌' : '📍'}
                </button>
                <button
                  onClick={() => handleDelete(relation.id)}
                  className="p-2 text-gray-400 hover:text-red-600 transition-colors"
                  title="Delete"
                >
                  🗑️
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
