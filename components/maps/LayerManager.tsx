'use client'

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
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold">Layers</h2>
        <button
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
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          Add Layer
        </button>
      </div>

      {isCreating && (
        <form onSubmit={handleSubmit} className="mb-6 p-4 border rounded-lg bg-gray-50">
          <h3 className="font-semibold mb-3">
            {editingId ? 'Edit Layer' : 'New Layer'}
          </h3>

          <div className="space-y-3">
            <div>
              <label className="block text-sm font-medium mb-1">Name *</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-3 py-2 border rounded"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Image URL</label>
              <input
                type="text"
                value={formData.image || ''}
                onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                className="w-full px-3 py-2 border rounded"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium mb-1">Position</label>
                <input
                  type="number"
                  value={formData.position}
                  onChange={(e) => setFormData({ ...formData, position: parseInt(e.target.value) })}
                  className="w-full px-3 py-2 border rounded"
                />
                <p className="text-xs text-gray-500 mt-1">Higher = on top</p>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Opacity</label>
                <input
                  type="number"
                  min="0"
                  max="1"
                  step="0.1"
                  value={formData.opacity}
                  onChange={(e) => setFormData({ ...formData, opacity: parseFloat(e.target.value) })}
                  className="w-full px-3 py-2 border rounded"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium mb-1">Width</label>
                <input
                  type="number"
                  value={formData.width || ''}
                  onChange={(e) => setFormData({ ...formData, width: parseInt(e.target.value) })}
                  className="w-full px-3 py-2 border rounded"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Height</label>
                <input
                  type="number"
                  value={formData.height || ''}
                  onChange={(e) => setFormData({ ...formData, height: parseInt(e.target.value) })}
                  className="w-full px-3 py-2 border rounded"
                />
              </div>
            </div>

            <div className="flex gap-4">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={formData.isVisible}
                  onChange={(e) => setFormData({ ...formData, isVisible: e.target.checked })}
                  className="mr-2"
                />
                Visible
              </label>

              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={formData.isPrivate}
                  onChange={(e) => setFormData({ ...formData, isPrivate: e.target.checked })}
                  className="mr-2"
                />
                Private
              </label>
            </div>
          </div>

          <div className="flex gap-2 mt-4">
            <button
              type="submit"
              className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
            >
              {editingId ? 'Update' : 'Create'}
            </button>
            <button
              type="button"
              onClick={() => {
                setIsCreating(false)
                setEditingId(null)
              }}
              className="px-4 py-2 bg-gray-300 text-gray-700 rounded hover:bg-gray-400"
            >
              Cancel
            </button>
          </div>
        </form>
      )}

      <div className="space-y-2">
        {sortedLayers.length === 0 ? (
          <p className="text-gray-500 text-sm">No layers yet</p>
        ) : (
          sortedLayers.map(layer => (
            <div
              key={layer.id}
              className="flex items-center justify-between p-3 border rounded hover:bg-gray-50"
            >
              <div className="flex items-center gap-3">
                <button
                  onClick={() => toggleVisibility(layer)}
                  className="text-gray-500 hover:text-gray-700"
                  title={layer.isVisible ? 'Hide layer' : 'Show layer'}
                >
                  {layer.isVisible ? '👁️' : '👁️‍🗨️'}
                </button>
                <div>
                  <p className="font-medium">{layer.name}</p>
                  <p className="text-sm text-gray-500">
                    Position: {layer.position} • Opacity: {layer.opacity * 100}%
                  </p>
                </div>
              </div>

              <div className="flex gap-2">
                <button
                  onClick={() => handleEdit(layer)}
                  className="px-3 py-1 text-sm bg-gray-200 rounded hover:bg-gray-300"
                >
                  Edit
                </button>
                <button
                  onClick={() => handleDelete(layer.id)}
                  className="px-3 py-1 text-sm bg-red-500 text-white rounded hover:bg-red-600"
                >
                  Delete
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
