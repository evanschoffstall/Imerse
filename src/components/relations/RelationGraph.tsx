'use client'

import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { type RelationWithEntities } from '@/types/relation'
import cytoscape, { type Core, type EdgeDefinition, type NodeDefinition } from 'cytoscape'
// @ts-ignore - no types available for cytoscape-cola
import cola from 'cytoscape-cola'
import { useEffect, useRef, useState } from 'react'
import { toast } from 'sonner'

// Register the cola layout
if (typeof cytoscape !== 'undefined') {
  cytoscape.use(cola)
}

interface RelationGraphProps {
  campaignId: string
  focusEntityId?: string
  focusEntityType?: string
  height?: string
}

type LayoutType = 'cola' | 'cose' | 'circle' | 'grid' | 'breadthfirst'

export default function RelationGraph({
  campaignId,
  focusEntityId,
  focusEntityType,
  height = '600px',
}: RelationGraphProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const cyRef = useRef<Core | null>(null)
  const [relations, setRelations] = useState<RelationWithEntities[]>([])
  const [loading, setLoading] = useState(true)
  const [layout, setLayout] = useState<LayoutType>('cola')
  const [selectedNode, setSelectedNode] = useState<string | null>(null)

  useEffect(() => {
    fetchRelations()
  }, [campaignId])

  useEffect(() => {
    if (relations.length > 0 && containerRef.current) {
      initializeGraph()
    }
    return () => {
      if (cyRef.current) {
        cyRef.current.destroy()
      }
    }
  }, [relations, layout])

  const fetchRelations = async () => {
    try {
      const params = new URLSearchParams({ campaignId })
      if (focusEntityId && focusEntityType) {
        params.append('ownerId', focusEntityId)
        params.append('ownerType', focusEntityType)
      }

      const response = await fetch(`/api/relations?${params}`)
      if (!response.ok) throw new Error('Failed to fetch relations')

      const data = await response.json()
      setRelations(data)
    } catch (error) {
      console.error('Error fetching relations:', error)
      toast.error('Failed to load relationship graph')
    } finally {
      setLoading(false)
    }
  }

  const initializeGraph = () => {
    if (!containerRef.current) return

    // Build nodes and edges from relations
    const nodesMap = new Map<string, NodeDefinition>()
    const edges: EdgeDefinition[] = []

    relations.forEach((relation) => {
      // Add owner node
      const ownerKey = `${relation.ownerType}-${relation.ownerId}`
      if (!nodesMap.has(ownerKey)) {
        nodesMap.set(ownerKey, {
          data: {
            id: ownerKey,
            label: relation.ownerId,
            type: relation.ownerType,
            entityId: relation.ownerId,
          },
        })
      }

      // Add target node
      const targetKey = `${relation.targetType}-${relation.targetId}`
      if (!nodesMap.has(targetKey)) {
        nodesMap.set(targetKey, {
          data: {
            id: targetKey,
            label: relation.targetId,
            type: relation.targetType,
            entityId: relation.targetId,
          },
        })
      }

      // Add edge
      edges.push({
        data: {
          id: relation.id,
          source: ownerKey,
          target: targetKey,
          label: relation.relation,
          attitude: relation.attitude,
          colour: relation.colour || '#94a3b8',
          relationId: relation.id,
        },
      })
    })

    const nodes = Array.from(nodesMap.values())

    // Initialize Cytoscape
    const cy = cytoscape({
      container: containerRef.current,
      elements: {
        nodes,
        edges,
      },
      style: [
        {
          selector: 'node',
          style: {
            'background-color': (ele) => {
              const type = ele.data('type')
              const colors: Record<string, string> = {
                character: '#3b82f6',
                location: '#10b981',
                item: '#f59e0b',
                quest: '#8b5cf6',
                event: '#ef4444',
                journal: '#6366f1',
                note: '#84cc16',
                family: '#ec4899',
                race: '#14b8a6',
                organisation: '#f97316',
                timeline: '#06b6d4',
                map: '#a855f7',
              }
              return colors[type] || '#64748b'
            },
            'label': 'data(label)',
            'width': '60px',
            'height': '60px',
            'font-size': '12px',
            'color': '#1f2937',
            'text-valign': 'bottom',
            'text-halign': 'center',
            'text-margin-y': 5,
            'text-wrap': 'wrap',
            'text-max-width': '80px',
            'border-width': 2,
            'border-color': '#e5e7eb',
          },
        },
        {
          selector: 'node:selected',
          style: {
            'border-width': 4,
            'border-color': '#1f2937',
          },
        },
        {
          selector: 'edge',
          style: {
            'width': 3,
            'line-color': 'data(colour)',
            'target-arrow-color': 'data(colour)',
            'target-arrow-shape': 'triangle',
            'curve-style': 'bezier',
            'label': 'data(label)',
            'font-size': '10px',
            'color': '#4b5563',
            'text-background-color': '#ffffff',
            'text-background-opacity': 0.8,
            'text-background-padding': '3px',
            'text-rotation': 'autorotate',
          },
        },
        {
          selector: 'edge:selected',
          style: {
            'width': 5,
            'line-color': '#1f2937',
            'target-arrow-color': '#1f2937',
          },
        },
      ],
      layout: {
        name: layout,
        ...(layout === 'cola' && {
          animate: true,
          randomize: false,
          maxSimulationTime: 2000,
          nodeSpacing: 80,
          edgeLength: 150,
        }),
      },
      userZoomingEnabled: true,
      userPanningEnabled: true,
      boxSelectionEnabled: false,
    })

    // Event handlers
    cy.on('tap', 'node', (event) => {
      const node = event.target
      setSelectedNode(node.id())
    })

    cy.on('tap', 'edge', (event) => {
      const edge = event.target
      const relationId = edge.data('relationId')
      console.log('Edge clicked:', relationId)
    })

    cy.on('tap', (event) => {
      if (event.target === cy) {
        setSelectedNode(null)
      }
    })

    cyRef.current = cy

    // Focus on specific entity if provided
    if (focusEntityId && focusEntityType) {
      const nodeId = `${focusEntityType}-${focusEntityId}`
      const node = cy.getElementById(nodeId)
      if (node.length > 0) {
        cy.animate({
          center: { eles: node },
          zoom: 1.5,
          duration: 500,
        })
        node.select()
        setSelectedNode(nodeId)
      }
    }
  }

  const handleLayoutChange = (newLayout: LayoutType) => {
    setLayout(newLayout)
    if (cyRef.current) {
      cyRef.current.layout({ name: newLayout } as any).run()
    }
  }

  const handleFit = () => {
    if (cyRef.current) {
      cyRef.current.fit(undefined, 50)
    }
  }

  const handleCenter = () => {
    if (cyRef.current) {
      cyRef.current.center()
    }
  }

  const handleZoomIn = () => {
    if (cyRef.current) {
      cyRef.current.zoom(cyRef.current.zoom() * 1.2)
    }
  }

  const handleZoomOut = () => {
    if (cyRef.current) {
      cyRef.current.zoom(cyRef.current.zoom() * 0.8)
    }
  }

  const getSelectedNodeInfo = () => {
    if (!selectedNode || !cyRef.current) return null
    const node = cyRef.current.getElementById(selectedNode)
    if (!node.length) return null
    return {
      id: node.id(),
      label: node.data('label'),
      type: node.data('type'),
      entityId: node.data('entityId'),
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center bg-gray-50 rounded-lg border" style={{ height }}>
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading relationship graph...</p>
        </div>
      </div>
    )
  }

  if (relations.length === 0) {
    return (
      <div className="flex items-center justify-center bg-gray-50 rounded-lg border" style={{ height }}>
        <div className="text-center">
          <p className="text-muted-foreground">No relations to display</p>
          <p className="text-sm text-gray-400 mt-2">Create some entity relations to see the graph</p>
        </div>
      </div>
    )
  }

  const selectedNodeInfo = getSelectedNodeInfo()

  return (
    <div className="space-y-4">
      {/* Controls */}
      <Card>
        <CardContent className="flex items-center justify-between p-4">
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium">Layout:</span>
            <select
              value={layout}
              onChange={(e) => handleLayoutChange(e.target.value as LayoutType)}
              className="px-3 py-1.5 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="cola">Force-Directed (Cola)</option>
              <option value="cose">Force-Directed (Cose)</option>
              <option value="circle">Circle</option>
              <option value="grid">Grid</option>
              <option value="breadthfirst">Hierarchy</option>
            </select>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleZoomIn}
              title="Zoom In"
            >
              🔍+
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handleZoomOut}
              title="Zoom Out"
            >
              🔍−
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handleCenter}
              title="Center"
            >
              ⊙
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handleFit}
              title="Fit to Screen"
            >
              ⛶
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Selected Node Info */}
      {selectedNodeInfo && (
        <Card className="border-blue-200 bg-blue-50">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-blue-900">Selected: {selectedNodeInfo.label}</p>
                <p className="text-xs text-blue-700 mt-1">
                  Type: {selectedNodeInfo.type} • ID: {selectedNodeInfo.entityId}
                </p>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSelectedNode(null)}
              >
                ✕
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Graph Container */}
      <div
        ref={containerRef}
        className="bg-gray-50 rounded-lg border"
        style={{ height }}
      />

      {/* Legend */}
      <Card>
        <CardContent className="p-4">
          <h4 className="text-sm font-semibold mb-3">Entity Types</h4>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
            {[
              { type: 'character', color: '#3b82f6', label: 'Character' },
              { type: 'location', color: '#10b981', label: 'Location' },
              { type: 'item', color: '#f59e0b', label: 'Item' },
              { type: 'quest', color: '#8b5cf6', label: 'Quest' },
              { type: 'event', color: '#ef4444', label: 'Event' },
              { type: 'journal', color: '#6366f1', label: 'Journal' },
              { type: 'note', color: '#84cc16', label: 'Note' },
              { type: 'family', color: '#ec4899', label: 'Family' },
              { type: 'race', color: '#14b8a6', label: 'Race' },
              { type: 'organisation', color: '#f97316', label: 'Organisation' },
              { type: 'timeline', color: '#06b6d4', label: 'Timeline' },
              { type: 'map', color: '#a855f7', label: 'Map' },
            ].map(({ type, color, label }) => (
              <div key={type} className="flex items-center gap-2">
                <div
                  className="w-4 h-4 rounded-full border-2 border-gray-300"
                  style={{ backgroundColor: color }}
                />
                <span className="text-xs text-gray-600">{label}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
