'use client'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Checkbox } from '@/components/ui/checkbox'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { MapLayer, MapLayerFormData } from '@/types/map'
import { useState } from 'react'
import { toast } from 'sonner'

interface LayerManagerProps {
  mapId: string
  layers: MapLayer[]
  onUpdate: () => void
}

export default function LayerManager({ mapId, layers, onUpdate }: LayerManagerProps) {
  const [isCreating, setIsCreating] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [formData, setFormData] = useState<MapLayerFormData>({
    name: '',
    position: 0,
    opacity: 1.0,
    isVisible: true,
    isPrivate: false
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    try {
      const url = editingId
        ? `/api/maps/${mapId}/layers/${editingId}`
        : `/api/maps/${mapId}/layers`

      const method = editingId ? 'PATCH' : 'POST'

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      })

      if (!res.ok) throw new Error('Failed to save layer')

      toast.success(editingId ? 'Layer updated' : 'Layer created')
      setIsCreating(false)
      setEditingId(null)
      setFormData({
        name: '',
        position: 0,
        opacity: 1.0,
        isVisible: true,
        isPrivate: false
      })
      onUpdate()
    } catch (error) {
      toast.error('Failed to save layer')
      console.error(error)
    }
  }

  const handleEdit = (layer: MapLayer) => {
    setFormData({
      name: layer.name,
      image: layer.image,
      entry: layer.entry,
      position: layer.position,
      width: layer.width,
      height: layer.height,
      opacity: layer.opacity,
      isVisible: layer.isVisible,
      isPrivate: layer.isPrivate
    })
    setEditingId(layer.id)
    setIsCreating(true)
  }

  const handleDelete = async (layerId: string) => {
    if (!confirm('Are you sure you want to delete this layer?')) return

    try {
      const res = await fetch(`/api/maps/${mapId}/layers/${layerId}`, {
        method: 'DELETE'
      })

      if (!res.ok) throw new Error('Failed to delete layer')

      toast.success('Layer deleted')
      onUpdate()
    } catch (error) {
      toast.error('Failed to delete layer')
      console.error(error)
    }
  }

  const toggleVisibility = async (layer: MapLayer) => {
    try {
      const res = await fetch(`/api/maps/${mapId}/layers/${layer.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...layer, isVisible: !layer.isVisible })
      })

      if (!res.ok) throw new Error('Failed to toggle visibility')

      toast.success('Layer visibility updated')
      onUpdate()
    } catch (error) {
      toast.error('Failed to update layer')
      console.error(error)
    }
  }

  const sortedLayers = [...layers].sort((a, b) => b.position - a.position)

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Layers</CardTitle>
          <Button
            onClick={() => {
              setIsCreating(true)
              setEditingId(null)
              setFormData({
                name: '',
                position: layers.length,
                opacity: 1.0,
                isVisible: true,
                isPrivate: false
              })
            }}
          >
            Add Layer
          </Button>
        </div>
      </CardHeader>
      <CardContent>

        {isCreating && (
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>
                {editingId ? 'Edit Layer' : 'New Layer'}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit}>
                <div className="space-y-3">
                  <div>
                    <Label htmlFor="layer-name">Name *</Label>
                    <Input
                      id="layer-name"
                      type="text"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="layer-image">Image URL</Label>
                    <Input
                      id="layer-image"
                      type="text"
                      value={formData.image || ''}
                      onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <Label htmlFor="layer-position">Position</Label>
                      <Input
                        id="layer-position"
                        type="number"
                        value={formData.position}
                        onChange={(e) => setFormData({ ...formData, position: parseInt(e.target.value) })}
                      />
                      <p className="text-xs text-muted-foreground mt-1">Higher = on top</p>
                    </div>
                    <div>
                      <Label htmlFor="layer-opacity">Opacity</Label>
                      <Input
                        id="layer-opacity"
                        type="number"
                        min="0"
                        max="1"
                        step="0.1"
                        value={formData.opacity}
                        onChange={(e) => setFormData({ ...formData, opacity: parseFloat(e.target.value) })}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <Label htmlFor="layer-width">Width</Label>
                      <Input
                        id="layer-width"
                        type="number"
                        value={formData.width || ''}
                        onChange={(e) => setFormData({ ...formData, width: parseInt(e.target.value) })}
                      />
                    </div>
                    <div>
                      <Label htmlFor="layer-height">Height</Label>
                      <Input
                        id="layer-height"
                        type="number"
                        value={formData.height || ''}
                        onChange={(e) => setFormData({ ...formData, height: parseInt(e.target.value) })}
                      />
                    </div>
                  </div>

                  <div className="flex gap-4">
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="layer-visible"
                        checked={formData.isVisible}
                        onCheckedChange={(checked) => setFormData({ ...formData, isVisible: checked as boolean })}
                      />
                      <Label htmlFor="layer-visible">Visible</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="layer-private"
                        checked={formData.isPrivate}
                        onCheckedChange={(checked) => setFormData({ ...formData, isPrivate: checked as boolean })}
                      />
                      <Label htmlFor="layer-private">Private</Label>
                    </div>
                  </div>
                </div>

                <div className="flex gap-2 mt-4">
                  <Button type="submit">
                    {editingId ? 'Update' : 'Create'}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      setIsCreating(false)
                      setEditingId(null)
                    }}
                  >
                    Cancel
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        )}

        <div className="space-y-2">
          {sortedLayers.length === 0 ? (
            <p className="text-muted-foreground text-sm">No layers yet</p>
          ) : (
            sortedLayers.map(layer => (
              <div
                key={layer.id}
                className="flex items-center justify-between p-3 border rounded hover:bg-gray-50"
              >
                <div className="flex items-center gap-3">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => toggleVisibility(layer)}
                    title={layer.isVisible ? 'Hide layer' : 'Show layer'}
                  >
                    {layer.isVisible ? '👁️' : '👁️‍🗨️'}
                  </Button>
                  <div>
                    <p className="font-medium">{layer.name}</p>
                    <p className="text-sm text-muted-foreground">
                      Position: {layer.position} • Opacity: {layer.opacity * 100}%
                    </p>
                  </div>
                </div>

                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleEdit(layer)}
                  >
                    Edit
                  </Button>
                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={() => handleDelete(layer.id)}
                  >
                    Delete
                  </Button>
                </div>
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  )
}
