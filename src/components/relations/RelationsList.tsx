'use client'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { ATTITUDE_LABELS, type RelationWithEntities } from '@/types/relation'
import { Pin, Trash2 } from 'lucide-react'
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
      <div className="space-y-3">
        <Skeleton className="h-20" />
        <Skeleton className="h-20" />
        <Skeleton className="h-20" />
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
        <Card className="text-center py-8 border-2 border-dashed">
          <p className="text-muted-foreground">No relations yet</p>
          {onAddRelation && (
            <Button onClick={onAddRelation} variant="secondary" size="sm" className="mt-3">
              Create First Relation
            </Button>
          )}
        </Card>
      ) : (
        <div className="space-y-3">
          {relations.map((relation) => (
            <Card
              key={relation.id}
              className="flex items-center justify-between p-4 hover:shadow-md transition-shadow"
              style={{
                borderLeftWidth: '4px',
                borderLeftColor: relation.colour || '#cbd5e1',
              }}
            >
              <div className="flex-1">
                <div className="flex items-center gap-3">
                  <Badge variant="secondary" className="uppercase">
                    {relation.relation}
                  </Badge>
                  {relation.isPinned && (
                    <span className="text-yellow-500" title="Pinned">
                      📌
                    </span>
                  )}
                </div>

                <p className="text-lg font-semibold mt-1">
                  {relation.targetId}
                  <span className="text-sm text-muted-foreground font-normal ml-2">
                    ({relation.targetType})
                  </span>
                </p>

                {relation.attitude !== 0 && (
                  <div className="flex items-center gap-2 mt-2">
                    <span className="text-xs font-medium text-muted-foreground">Attitude:</span>
                    <Badge
                      variant={relation.attitude > 0 ? 'default' : 'destructive'}
                      className="text-xs"
                    >
                      {ATTITUDE_LABELS[relation.attitude]} ({relation.attitude > 0 ? '+' : ''}
                      {relation.attitude})
                    </Badge>
                  </div>
                )}

                {relation.mirror && (
                  <p className="text-xs text-muted-foreground mt-2">
                    ↔️ Reciprocal relation exists
                  </p>
                )}
              </div>

              <div className="flex items-center gap-2">
                <Button
                  onClick={() => handleTogglePin(relation)}
                  variant="ghost"
                  size="sm"
                  title={relation.isPinned ? 'Unpin' : 'Pin'}
                >
                  <Pin className={`h-4 w-4 ${relation.isPinned ? 'fill-yellow-500 text-yellow-500' : ''}`} />
                </Button>
                <Button
                  onClick={() => handleDelete(relation.id)}
                  variant="ghost"
                  size="sm"
                  title="Delete"
                >
                  <Trash2 className="h-4 w-4 text-destructive" />
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
