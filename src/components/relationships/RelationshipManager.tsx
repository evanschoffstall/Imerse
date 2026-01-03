'use client'

import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import {
  EntityType,
  RELATIONSHIP_TYPE_LABELS,
  RelationshipType,
  RelationshipWithEntities,
  SUGGESTED_RELATIONSHIPS,
  getEntityPath,
} from '@/types/relationship'
import Link from 'next/link'
import * as React from 'react'
import { toast } from 'sonner'

export interface RelationshipManagerProps {
  entityType: EntityType
  entityId: string
  campaignId: string
}

interface SearchResult {
  id: string
  name: string
  type: EntityType
  image?: string | null
}

export function RelationshipManager({
  entityType,
  entityId,
  campaignId,
}: RelationshipManagerProps) {
  const [relationships, setRelationships] = React.useState<RelationshipWithEntities[]>([])
  const [loading, setLoading] = React.useState(true)
  const [showForm, setShowForm] = React.useState(false)
  const [editingId, setEditingId] = React.useState<string | null>(null)

  // Form state
  const [targetSearch, setTargetSearch] = React.useState('')
  const [searchResults, setSearchResults] = React.useState<SearchResult[]>([])
  const [selectedTarget, setSelectedTarget] = React.useState<SearchResult | null>(null)
  const [relationshipType, setRelationshipType] = React.useState<RelationshipType>('related_to')
  const [description, setDescription] = React.useState('')
  const [bidirectional, setBidirectional] = React.useState(false)
  const [isPrivate, setIsPrivate] = React.useState(false)
  const [submitting, setSubmitting] = React.useState(false)

  React.useEffect(() => {
    fetchRelationships()
  }, [entityType, entityId])

  const fetchRelationships = async () => {
    setLoading(true)
    try {
      const response = await fetch(
        `/api/relationships?entityType=${entityType}&entityId=${entityId}&campaignId=${campaignId}`
      )
      if (!response.ok) throw new Error('Failed to fetch relationships')
      const data = await response.json()
      setRelationships(data.relationships)
    } catch (error) {
      console.error('Error fetching relationships:', error)
      toast.error('Failed to load relationships')
    } finally {
      setLoading(false)
    }
  }

  const searchEntities = async (query: string) => {
    if (!query.trim()) {
      setSearchResults([])
      return
    }

    try {
      const response = await fetch(
        `/api/search?query=${encodeURIComponent(query)}&campaignId=${campaignId}&limit=20`
      )
      if (!response.ok) throw new Error('Search failed')
      const data = await response.json()

      // Filter out current entity
      const filtered = data.results.filter(
        (r: SearchResult) => !(r.type === entityType && r.id === entityId)
      )
      setSearchResults(filtered)
    } catch (error) {
      console.error('Error searching:', error)
      toast.error('Search failed')
    }
  }

  React.useEffect(() => {
    const debounce = setTimeout(() => {
      searchEntities(targetSearch)
    }, 300)
    return () => clearTimeout(debounce)
  }, [targetSearch])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedTarget) {
      toast.error('Please select a target entity')
      return
    }

    setSubmitting(true)
    try {
      const payload = {
        sourceEntityType: entityType,
        sourceEntityId: entityId,
        targetEntityType: selectedTarget.type,
        targetEntityId: selectedTarget.id,
        relationshipType,
        description: description || undefined,
        bidirectional,
        isPrivate,
      }

      const response = editingId
        ? await fetch(`/api/relationships/${editingId}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        })
        : await fetch('/api/relationships', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        })

      if (!response.ok) throw new Error('Failed to save relationship')

      toast.success(editingId ? 'Relationship updated' : 'Relationship created')
      resetForm()
      fetchRelationships()
    } catch (error) {
      console.error('Error saving relationship:', error)
      toast.error('Failed to save relationship')
    } finally {
      setSubmitting(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this relationship?')) return

    try {
      const response = await fetch(`/api/relationships/${id}`, {
        method: 'DELETE',
      })

      if (!response.ok) throw new Error('Failed to delete relationship')

      toast.success('Relationship deleted')
      fetchRelationships()
    } catch (error) {
      console.error('Error deleting relationship:', error)
      toast.error('Failed to delete relationship')
    }
  }

  const resetForm = () => {
    setShowForm(false)
    setEditingId(null)
    setTargetSearch('')
    setSearchResults([])
    setSelectedTarget(null)
    setRelationshipType('related_to')
    setDescription('')
    setBidirectional(false)
    setIsPrivate(false)
  }

  const getRelationshipLabel = (rel: RelationshipWithEntities, isSource: boolean) => {
    const target = isSource ? rel.targetEntity : rel.sourceEntity
    const label = RELATIONSHIP_TYPE_LABELS[rel.relationshipType as RelationshipType]
    const arrow = rel.bidirectional ? '↔' : isSource ? '→' : '←'
    return { target, label, arrow }
  }

  // Group relationships by whether this entity is source or target
  const outgoingRels = relationships.filter(
    (r) => r.sourceEntityType === entityType && r.sourceEntityId === entityId
  )
  const incomingRels = relationships.filter(
    (r) => r.targetEntityType === entityType && r.targetEntityId === entityId
  )

  if (loading) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-1/3"></div>
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-full"></div>
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-5/6"></div>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-xl font-semibold">Relationships</h3>
        <Button onClick={() => setShowForm(!showForm)} size="sm">
          {showForm ? 'Cancel' : '+ Add Relationship'}
        </Button>
      </div>

      {/* Add/Edit Form */}
      {showForm && (
        <form onSubmit={handleSubmit} className="mb-6 p-4 bg-muted/50 rounded-lg">
          <h4 className="font-medium mb-4">{editingId ? 'Edit' : 'New'} Relationship</h4>

          {/* Target Entity Search */}
          <div className="mb-4">
            <Label htmlFor="target-search">Target Entity</Label>
            {selectedTarget ? (
              <div className="flex items-center gap-2 p-2 bg-white dark:bg-gray-800 border border-border rounded">
                <span className="grow">{selectedTarget.name}</span>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={() => setSelectedTarget(null)}
                >
                  ✕
                </Button>
              </div>
            ) : (
              <div>
                <Input
                  id="target-search"
                  type="text"
                  value={targetSearch}
                  onChange={(e) => setTargetSearch(e.target.value)}
                  placeholder="Search for an entity..."
                />
                {searchResults.length > 0 && (
                  <div className="mt-2 max-h-48 overflow-y-auto border border-border rounded-lg">
                    {searchResults.map((result) => (
                      <Button
                        key={`${result.type}-${result.id}`}
                        type="button"
                        variant="ghost"
                        className="w-full justify-start"
                        onClick={() => {
                          setSelectedTarget(result)
                          setTargetSearch('')
                          setSearchResults([])
                        }}
                      >
                        <span className="font-medium">{result.name}</span>
                        <span className="text-xs text-muted-foreground ml-2">({result.type})</span>
                      </Button>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Relationship Type */}
          <div className="mb-4">
            <Label htmlFor="relationship-type">Relationship Type</Label>
            <Select
              value={relationshipType}
              onValueChange={(value) => setRelationshipType(value as RelationshipType)}
            >
              <SelectTrigger id="relationship-type">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {SUGGESTED_RELATIONSHIPS[entityType]?.map((type) => (
                  <SelectItem key={type} value={type}>
                    {RELATIONSHIP_TYPE_LABELS[type]}
                  </SelectItem>
                ))}
                {!SUGGESTED_RELATIONSHIPS[entityType]?.includes(relationshipType) && (
                  <SelectItem value={relationshipType}>
                    {RELATIONSHIP_TYPE_LABELS[relationshipType]}
                  </SelectItem>
                )}
              </SelectContent>
            </Select>
          </div>

          {/* Description */}
          <div className="mb-4">
            <Label htmlFor="relationship-description">Description (Optional)</Label>
            <Textarea
              id="relationship-description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Additional details about this relationship..."
              rows={3}
            />
          </div>

          {/* Options */}
          <div className="flex gap-4 mb-4">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="bidirectional"
                checked={bidirectional}
                onCheckedChange={(checked) => setBidirectional(checked as boolean)}
              />
              <Label htmlFor="bidirectional">Bidirectional</Label>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox
                id="private"
                checked={isPrivate}
                onCheckedChange={(checked) => setIsPrivate(checked as boolean)}
              />
              <Label htmlFor="private">Private</Label>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-2">
            <Button type="submit" disabled={!selectedTarget || submitting}>
              {submitting ? 'Saving...' : editingId ? 'Update' : 'Create'}
            </Button>
            <Button type="button" variant="secondary" onClick={resetForm}>
              Cancel
            </Button>
          </div>
        </form>
      )}

      {/* Relationships List */}
      {relationships.length === 0 ? (
        <p className="text-muted-foreground text-center py-8">No relationships yet</p>
      ) : (
        <div className="space-y-4">
          {/* Outgoing Relationships */}
          {outgoingRels.length > 0 && (
            <div>
              <h4 className="text-sm font-medium text-muted-foreground mb-2">Outgoing</h4>
              <div className="space-y-2">
                {outgoingRels.map((rel) => {
                  const { target, label, arrow } = getRelationshipLabel(rel, true)
                  return (
                    <div
                      key={rel.id}
                      className="flex items-start gap-3 p-3 bg-muted/50 rounded-lg"
                    >
                      <div className="grow">
                        <div className="flex items-center gap-2">
                          <span className="text-sm text-muted-foreground">{label}</span>
                          <span>{arrow}</span>
                          <Link
                            href={getEntityPath(target)}
                            className="font-medium text-blue-600 hover:text-blue-700"
                          >
                            {target.name}
                          </Link>
                          {rel.bidirectional && (
                            <span className="text-xs bg-blue-100 dark:bg-blue-900 px-2 py-0.5 rounded">
                              Bidirectional
                            </span>
                          )}
                          {rel.isPrivate && (
                            <span className="text-xs bg-gray-200 dark:bg-gray-700 px-2 py-0.5 rounded">
                              Private
                            </span>
                          )}
                        </div>
                        {rel.description && (
                          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                            {rel.description}
                          </p>
                        )}
                      </div>
                      <button
                        onClick={() => handleDelete(rel.id)}
                        className="text-red-600 hover:text-red-700 text-sm"
                      >
                        Delete
                      </button>
                    </div>
                  )
                })}
              </div>
            </div>
          )}

          {/* Incoming Relationships */}
          {incomingRels.length > 0 && (
            <div>
              <h4 className="text-sm font-medium text-muted-foreground mb-2">Incoming</h4>
              <div className="space-y-2">
                {incomingRels.map((rel) => {
                  const { target, label, arrow } = getRelationshipLabel(rel, false)
                  return (
                    <div
                      key={rel.id}
                      className="flex items-start gap-3 p-3 bg-muted/50 rounded-lg"
                    >
                      <div className="grow">
                        <div className="flex items-center gap-2">
                          <Link
                            href={getEntityPath(target)}
                            className="font-medium text-blue-600 hover:text-blue-700"
                          >
                            {target.name}
                          </Link>
                          <span>{arrow}</span>
                          <span className="text-sm text-muted-foreground">{label}</span>
                          {rel.bidirectional && (
                            <span className="text-xs bg-blue-100 dark:bg-blue-900 px-2 py-0.5 rounded">
                              Bidirectional
                            </span>
                          )}
                          {rel.isPrivate && (
                            <span className="text-xs bg-gray-200 dark:bg-gray-700 px-2 py-0.5 rounded">
                              Private
                            </span>
                          )}
                        </div>
                        {rel.description && (
                          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                            {rel.description}
                          </p>
                        )}
                      </div>
                      <button
                        onClick={() => handleDelete(rel.id)}
                        className="text-red-600 hover:text-red-700 text-sm"
                      >
                        Delete
                      </button>
                    </div>
                  )
                })}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
