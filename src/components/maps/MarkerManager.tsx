'use client'

import { DEFAULT_MARKER_COLORS, MapGroup, MapGroupFormData, MapMarker, MapMarkerFormData, MARKER_SHAPES } from '@/types/map'
import { useState } from 'react'
import { toast } from 'sonner'

interface MarkerManagerProps {
  mapId: string
  markers: MapMarker[]
  groups: MapGroup[]
  onUpdate: () => void
}

export default function MarkerManager({ mapId, markers, groups, onUpdate }: MarkerManagerProps) {
  const [activeTab, setActiveTab] = useState<'markers' | 'groups'>('markers')
  const [isCreatingMarker, setIsCreatingMarker] = useState(false)
  const [isCreatingGroup, setIsCreatingGroup] = useState(false)
  const [editingMarkerId, setEditingMarkerId] = useState<string | null>(null)
  const [editingGroupId, setEditingGroupId] = useState<string | null>(null)

  const [markerForm, setMarkerForm] = useState<MapMarkerFormData>({
    name: '',
    longitude: 0,
    latitude: 0,
    shape: 'marker',
    size: 1,
    colour: '#ff0000',
    fontColour: '#ffffff',
    opacity: 1.0,
    isDraggable: false,
    isPopupless: false,
    isPrivate: false
  })

  const [groupForm, setGroupForm] = useState<MapGroupFormData>({
    name: '',
    position: 0,
    isShown: true,
    isPrivate: false
  })

  // Marker handlers
  const handleMarkerSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    try {
      const url = editingMarkerId
        ? `/api/maps/${mapId}/markers/${editingMarkerId}`
        : `/api/maps/${mapId}/markers`

      const method = editingMarkerId ? 'PATCH' : 'POST'

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(markerForm)
      })

      if (!res.ok) throw new Error('Failed to save marker')

      toast.success(editingMarkerId ? 'Marker updated' : 'Marker created')
      setIsCreatingMarker(false)
      setEditingMarkerId(null)
      resetMarkerForm()
      onUpdate()
    } catch (error) {
      toast.error('Failed to save marker')
      console.error(error)
    }
  }

  const handleMarkerEdit = (marker: MapMarker) => {
    setMarkerForm({
      name: marker.name,
      entry: marker.entry,
      longitude: marker.longitude,
      latitude: marker.latitude,
      shape: marker.shape,
      size: marker.size,
      colour: marker.colour,
      fontColour: marker.fontColour,
      icon: marker.icon,
      customIcon: marker.customIcon,
      customShape: marker.customShape,
      opacity: marker.opacity,
      circleRadius: marker.circleRadius,
      polygonStyle: marker.polygonStyle,
      isDraggable: marker.isDraggable,
      isPopupless: marker.isPopupless,
      pinSize: marker.pinSize,
      css: marker.css,
      entityId: marker.entityId,
      entityType: marker.entityType,
      isPrivate: marker.isPrivate,
      groupId: marker.groupId
    })
    setEditingMarkerId(marker.id)
    setIsCreatingMarker(true)
  }

  const handleMarkerDelete = async (markerId: string) => {
    if (!confirm('Are you sure you want to delete this marker?')) return

    try {
      const res = await fetch(`/api/maps/${mapId}/markers/${markerId}`, {
        method: 'DELETE'
      })

      if (!res.ok) throw new Error('Failed to delete marker')

      toast.success('Marker deleted')
      onUpdate()
    } catch (error) {
      toast.error('Failed to delete marker')
      console.error(error)
    }
  }

  const resetMarkerForm = () => {
    setMarkerForm({
      name: '',
      longitude: 0,
      latitude: 0,
      shape: 'marker',
      size: 1,
      colour: '#ff0000',
      fontColour: '#ffffff',
      opacity: 1.0,
      isDraggable: false,
      isPopupless: false,
      isPrivate: false
    })
  }

  // Group handlers
  const handleGroupSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    try {
      const url = editingGroupId
        ? `/api/maps/${mapId}/groups/${editingGroupId}`
        : `/api/maps/${mapId}/groups`

      const method = editingGroupId ? 'PATCH' : 'POST'

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(groupForm)
      })

      if (!res.ok) throw new Error('Failed to save group')

      toast.success(editingGroupId ? 'Group updated' : 'Group created')
      setIsCreatingGroup(false)
      setEditingGroupId(null)
      resetGroupForm()
      onUpdate()
    } catch (error) {
      toast.error('Failed to save group')
      console.error(error)
    }
  }

  const handleGroupEdit = (group: MapGroup) => {
    setGroupForm({
      name: group.name,
      position: group.position,
      isShown: group.isShown,
      isPrivate: group.isPrivate,
      parentId: group.parentId
    })
    setEditingGroupId(group.id)
    setIsCreatingGroup(true)
  }

  const handleGroupDelete = async (groupId: string) => {
    if (!confirm('Are you sure you want to delete this group?')) return

    try {
      const res = await fetch(`/api/maps/${mapId}/groups/${groupId}`, {
        method: 'DELETE'
      })

      if (!res.ok) throw new Error('Failed to delete group')

      toast.success('Group deleted')
      onUpdate()
    } catch (error) {
      toast.error('Failed to delete group')
      console.error(error)
    }
  }

  const resetGroupForm = () => {
    setGroupForm({
      name: '',
      position: 0,
      isShown: true,
      isPrivate: false
    })
  }

  return (
    <div className="bg-white rounded-lg shadow p-6">
      {/* Tabs */}
      <div className="flex gap-4 border-b mb-4">
        <button
          onClick={() => setActiveTab('markers')}
          className={`px-4 py-2 font-medium border-b-2 -mb-px ${activeTab === 'markers'
              ? 'border-blue-500 text-blue-600'
              : 'border-transparent text-gray-600 hover:text-gray-800'
            }`}
        >
          Markers ({markers.length})
        </button>
        <button
          onClick={() => setActiveTab('groups')}
          className={`px-4 py-2 font-medium border-b-2 -mb-px ${activeTab === 'groups'
              ? 'border-blue-500 text-blue-600'
              : 'border-transparent text-gray-600 hover:text-gray-800'
            }`}
        >
          Groups ({groups.length})
        </button>
      </div>

      {/* Markers Tab */}
      {activeTab === 'markers' && (
        <>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold">Markers</h2>
            <button
              onClick={() => {
                setIsCreatingMarker(true)
                setEditingMarkerId(null)
                resetMarkerForm()
              }}
              className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
            >
              Add Marker
            </button>
          </div>

          {isCreatingMarker && (
            <form onSubmit={handleMarkerSubmit} className="mb-6 p-4 border rounded-lg bg-gray-50">
              <h3 className="font-semibold mb-3">
                {editingMarkerId ? 'Edit Marker' : 'New Marker'}
              </h3>

              <div className="space-y-3">
                <div>
                  <label className="block text-sm font-medium mb-1">Name *</label>
                  <input
                    type="text"
                    value={markerForm.name}
                    onChange={(e) => setMarkerForm({ ...markerForm, name: e.target.value })}
                    className="w-full px-3 py-2 border rounded"
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-medium mb-1">Longitude (X) *</label>
                    <input
                      type="number"
                      step="0.1"
                      value={markerForm.longitude}
                      onChange={(e) => setMarkerForm({ ...markerForm, longitude: parseFloat(e.target.value) })}
                      className="w-full px-3 py-2 border rounded"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-1">Latitude (Y) *</label>
                    <input
                      type="number"
                      step="0.1"
                      value={markerForm.latitude}
                      onChange={(e) => setMarkerForm({ ...markerForm, latitude: parseFloat(e.target.value) })}
                      className="w-full px-3 py-2 border rounded"
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className="block text-sm font-medium mb-1">Shape</label>
                    <select
                      value={markerForm.shape}
                      onChange={(e) => setMarkerForm({ ...markerForm, shape: e.target.value as any })}
                      className="w-full px-3 py-2 border rounded"
                    >
                      {MARKER_SHAPES.map(shape => (
                        <option key={shape} value={shape}>{shape}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-1">Size</label>
                    <input
                      type="number"
                      min="1"
                      max="5"
                      value={markerForm.size}
                      onChange={(e) => setMarkerForm({ ...markerForm, size: parseInt(e.target.value) })}
                      className="w-full px-3 py-2 border rounded"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-1">Opacity</label>
                    <input
                      type="number"
                      min="0"
                      max="1"
                      step="0.1"
                      value={markerForm.opacity}
                      onChange={(e) => setMarkerForm({ ...markerForm, opacity: parseFloat(e.target.value) })}
                      className="w-full px-3 py-2 border rounded"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-medium mb-1">Color</label>
                    <div className="flex gap-2">
                      <input
                        type="color"
                        value={markerForm.colour}
                        onChange={(e) => setMarkerForm({ ...markerForm, colour: e.target.value })}
                        className="w-16 h-10 border rounded"
                      />
                      <div className="flex flex-wrap gap-1">
                        {DEFAULT_MARKER_COLORS.slice(0, 5).map(color => (
                          <button
                            key={color}
                            type="button"
                            onClick={() => setMarkerForm({ ...markerForm, colour: color })}
                            className="w-6 h-6 rounded border-2 border-gray-300 hover:border-gray-500"
                            style={{ backgroundColor: color }}
                            title={color}
                          />
                        ))}
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-1">Font Color</label>
                    <input
                      type="color"
                      value={markerForm.fontColour}
                      onChange={(e) => setMarkerForm({ ...markerForm, fontColour: e.target.value })}
                      className="w-16 h-10 border rounded"
                    />
                  </div>
                </div>

                {markerForm.shape === 'circle' && (
                  <div>
                    <label className="block text-sm font-medium mb-1">Circle Radius</label>
                    <input
                      type="number"
                      value={markerForm.circleRadius || 20}
                      onChange={(e) => setMarkerForm({ ...markerForm, circleRadius: parseInt(e.target.value) })}
                      className="w-full px-3 py-2 border rounded"
                    />
                  </div>
                )}

                <div>
                  <label className="block text-sm font-medium mb-1">Group</label>
                  <select
                    value={markerForm.groupId || ''}
                    onChange={(e) => setMarkerForm({ ...markerForm, groupId: e.target.value || undefined })}
                    className="w-full px-3 py-2 border rounded"
                  >
                    <option value="">No group</option>
                    {groups.map(group => (
                      <option key={group.id} value={group.id}>{group.name}</option>
                    ))}
                  </select>
                </div>

                <div className="flex gap-4">
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={markerForm.isDraggable}
                      onChange={(e) => setMarkerForm({ ...markerForm, isDraggable: e.target.checked })}
                      className="mr-2"
                    />
                    Draggable
                  </label>

                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={markerForm.isPrivate}
                      onChange={(e) => setMarkerForm({ ...markerForm, isPrivate: e.target.checked })}
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
                  {editingMarkerId ? 'Update' : 'Create'}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setIsCreatingMarker(false)
                    setEditingMarkerId(null)
                  }}
                  className="px-4 py-2 bg-gray-300 text-gray-700 rounded hover:bg-gray-400"
                >
                  Cancel
                </button>
              </div>
            </form>
          )}

          <div className="space-y-2">
            {markers.length === 0 ? (
              <p className="text-gray-500 text-sm">No markers yet</p>
            ) : (
              markers.map(marker => (
                <div
                  key={marker.id}
                  className="flex items-center justify-between p-3 border rounded hover:bg-gray-50"
                >
                  <div className="flex items-center gap-3">
                    <div
                      className="w-8 h-8 rounded flex items-center justify-center text-white font-bold"
                      style={{ backgroundColor: marker.colour }}
                    >
                      {marker.shape === 'marker' && '📍'}
                      {marker.shape === 'circle' && '⭕'}
                      {marker.shape === 'label' && 'T'}
                      {marker.shape === 'polygon' && '▲'}
                    </div>
                    <div>
                      <p className="font-medium">{marker.name}</p>
                      <p className="text-sm text-gray-500">
                        ({marker.longitude.toFixed(1)}, {marker.latitude.toFixed(1)})
                        {marker.group && ` • Group: ${marker.group.name}`}
                      </p>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <button
                      onClick={() => handleMarkerEdit(marker)}
                      className="px-3 py-1 text-sm bg-gray-200 rounded hover:bg-gray-300"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleMarkerDelete(marker.id)}
                      className="px-3 py-1 text-sm bg-red-500 text-white rounded hover:bg-red-600"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </>
      )}

      {/* Groups Tab */}
      {activeTab === 'groups' && (
        <>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold">Groups</h2>
            <button
              onClick={() => {
                setIsCreatingGroup(true)
                setEditingGroupId(null)
                resetGroupForm()
              }}
              className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
            >
              Add Group
            </button>
          </div>

          {isCreatingGroup && (
            <form onSubmit={handleGroupSubmit} className="mb-6 p-4 border rounded-lg bg-gray-50">
              <h3 className="font-semibold mb-3">
                {editingGroupId ? 'Edit Group' : 'New Group'}
              </h3>

              <div className="space-y-3">
                <div>
                  <label className="block text-sm font-medium mb-1">Name *</label>
                  <input
                    type="text"
                    value={groupForm.name}
                    onChange={(e) => setGroupForm({ ...groupForm, name: e.target.value })}
                    className="w-full px-3 py-2 border rounded"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Position</label>
                  <input
                    type="number"
                    value={groupForm.position}
                    onChange={(e) => setGroupForm({ ...groupForm, position: parseInt(e.target.value) })}
                    className="w-full px-3 py-2 border rounded"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Parent Group</label>
                  <select
                    value={groupForm.parentId || ''}
                    onChange={(e) => setGroupForm({ ...groupForm, parentId: e.target.value || undefined })}
                    className="w-full px-3 py-2 border rounded"
                  >
                    <option value="">No parent</option>
                    {groups.filter(g => g.id !== editingGroupId).map(group => (
                      <option key={group.id} value={group.id}>{group.name}</option>
                    ))}
                  </select>
                </div>

                <div className="flex gap-4">
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={groupForm.isShown}
                      onChange={(e) => setGroupForm({ ...groupForm, isShown: e.target.checked })}
                      className="mr-2"
                    />
                    Shown
                  </label>

                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={groupForm.isPrivate}
                      onChange={(e) => setGroupForm({ ...groupForm, isPrivate: e.target.checked })}
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
                  {editingGroupId ? 'Update' : 'Create'}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setIsCreatingGroup(false)
                    setEditingGroupId(null)
                  }}
                  className="px-4 py-2 bg-gray-300 text-gray-700 rounded hover:bg-gray-400"
                >
                  Cancel
                </button>
              </div>
            </form>
          )}

          <div className="space-y-2">
            {groups.length === 0 ? (
              <p className="text-gray-500 text-sm">No groups yet</p>
            ) : (
              groups.map(group => (
                <div
                  key={group.id}
                  className="flex items-center justify-between p-3 border rounded hover:bg-gray-50"
                >
                  <div>
                    <p className="font-medium">{group.name}</p>
                    <p className="text-sm text-gray-500">
                      {group.markers?.length || 0} markers
                      {group.parent && ` • Parent: ${group.parent.name}`}
                    </p>
                  </div>

                  <div className="flex gap-2">
                    <button
                      onClick={() => handleGroupEdit(group)}
                      className="px-3 py-1 text-sm bg-gray-200 rounded hover:bg-gray-300"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleGroupDelete(group.id)}
                      className="px-3 py-1 text-sm bg-red-500 text-white rounded hover:bg-red-600"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </>
      )}
    </div>
  )
}
