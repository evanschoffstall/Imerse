'use client'

import { useEffect, useRef, useState } from 'react'
import { Stage, Layer, Image as KonvaImage, Circle, Text, Rect, Line } from 'react-konva'
import useImage from 'use-image'
import { MapLayer, MapMarker } from '@/types/map'

interface InteractiveMapProps {
  mapImage?: string
  layers?: MapLayer[]
  markers?: MapMarker[]
  width: number
  height: number
  editable?: boolean
  onMarkerClick?: (marker: MapMarker) => void
  onMarkerDragEnd?: (markerId: string, x: number, y: number) => void
  onStageClick?: (x: number, y: number) => void
}

// Component for rendering a marker
function MarkerComponent({
  marker,
  onClick,
  onDragEnd,
  editable
}: {
  marker: MapMarker
  onClick: (marker: MapMarker) => void
  onDragEnd: (markerId: string, x: number, y: number) => void
  editable?: boolean
}) {
  const renderMarker = () => {
    const commonProps = {
      x: marker.longitude,
      y: marker.latitude,
      draggable: editable && marker.isDraggable,
      onClick: () => onClick(marker),
      onTap: () => onClick(marker),
      onDragEnd: (e: any) => {
        onDragEnd(marker.id, e.target.x(), e.target.y())
      },
      opacity: marker.opacity
    }

    switch (marker.shape) {
      case 'circle':
        return (
          <Circle
            {...commonProps}
            radius={marker.circleRadius || 20}
            fill={marker.colour}
            stroke="#000000"
            strokeWidth={2}
          />
        )

      case 'label':
        return (
          <Text
            {...commonProps}
            text={marker.name}
            fontSize={marker.size * 5 + 10}
            fill={marker.fontColour}
            fontFamily="Arial"
            align="center"
          />
        )

      case 'polygon':
        // Parse polygon points from customShape
        if (marker.customShape) {
          try {
            const points = JSON.parse(marker.customShape)
            return (
              <Line
                {...commonProps}
                points={points}
                fill={marker.colour}
                stroke={marker.polygonStyle?.strokeColor || '#000000'}
                strokeWidth={marker.polygonStyle?.strokeWidth || 2}
                closed={true}
              />
            )
          } catch (e) {
            // Fall through to default marker
          }
        }
        // Fall through to default if no valid polygon data

      default:
        // Default marker (pin shape)
        const markerSize = marker.size * 10 + 10
        return (
          <>
            <Circle
              {...commonProps}
              y={marker.latitude - markerSize / 2}
              radius={markerSize / 3}
              fill={marker.colour}
              stroke="#000000"
              strokeWidth={2}
            />
            <Line
              {...commonProps}
              points={[0, 0, 0, markerSize]}
              stroke={marker.colour}
              strokeWidth={3}
              lineCap="round"
            />
          </>
        )
    }
  }

  return <>{renderMarker()}</>
}

// Component for rendering a layer
function LayerImageComponent({ layer }: { layer: MapLayer }) {
  const [image] = useImage(layer.image || '')

  if (!layer.isVisible || !image) {
    return null
  }

  return (
    <KonvaImage
      image={image}
      x={0}
      y={0}
      width={layer.width}
      height={layer.height}
      opacity={layer.opacity}
    />
  )
}

export default function InteractiveMap({
  mapImage,
  layers = [],
  markers = [],
  width,
  height,
  editable = false,
  onMarkerClick,
  onMarkerDragEnd,
  onStageClick
}: InteractiveMapProps) {
  const [baseImage] = useImage(mapImage || '')
  const [scale, setScale] = useState(1)
  const [position, setPosition] = useState({ x: 0, y: 0 })
  const stageRef = useRef<any>(null)

  // Handle zoom
  const handleWheel = (e: any) => {
    e.evt.preventDefault()

    const scaleBy = 1.1
    const stage = e.target.getStage()
    const oldScale = stage.scaleX()
    const pointer = stage.getPointerPosition()

    const mousePointTo = {
      x: (pointer.x - stage.x()) / oldScale,
      y: (pointer.y - stage.y()) / oldScale
    }

    const newScale = e.evt.deltaY < 0 ? oldScale * scaleBy : oldScale / scaleBy

    // Limit scale
    const clampedScale = Math.max(0.1, Math.min(newScale, 5))

    setScale(clampedScale)
    setPosition({
      x: pointer.x - mousePointTo.x * clampedScale,
      y: pointer.y - mousePointTo.y * clampedScale
    })
  }

  // Handle stage click (for adding markers in edit mode)
  const handleStageClick = (e: any) => {
    if (e.target === e.target.getStage() && onStageClick) {
      const stage = e.target.getStage()
      const pointer = stage.getPointerPosition()
      const x = (pointer.x - position.x) / scale
      const y = (pointer.y - position.y) / scale
      onStageClick(x, y)
    }
  }

  // Sort layers by position (higher position = on top)
  const sortedLayers = [...layers].sort((a, b) => a.position - b.position)

  // Filter visible markers
  const visibleMarkers = markers.filter(m => !m.isPrivate)

  return (
    <div className="relative border border-gray-300 rounded-lg overflow-hidden">
      <Stage
        ref={stageRef}
        width={width}
        height={height}
        scaleX={scale}
        scaleY={scale}
        x={position.x}
        y={position.y}
        draggable={true}
        onWheel={handleWheel}
        onClick={handleStageClick}
        onTap={handleStageClick}
      >
        {/* Base map image layer */}
        {baseImage && (
          <Layer>
            <KonvaImage
              image={baseImage}
              x={0}
              y={0}
              width={width}
              height={height}
            />
          </Layer>
        )}

        {/* Additional layers */}
        {sortedLayers.map(layer => (
          <Layer key={layer.id}>
            <LayerImageComponent layer={layer} />
          </Layer>
        ))}

        {/* Markers layer */}
        <Layer>
          {visibleMarkers.map(marker => (
            <MarkerComponent
              key={marker.id}
              marker={marker}
              onClick={onMarkerClick || (() => {})}
              onDragEnd={onMarkerDragEnd || (() => {})}
              editable={editable}
            />
          ))}
        </Layer>
      </Stage>

      {/* Zoom controls */}
      <div className="absolute bottom-4 right-4 flex flex-col gap-2 bg-white rounded-lg shadow-md p-2">
        <button
          onClick={() => setScale(s => Math.min(s * 1.2, 5))}
          className="px-3 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          title="Zoom in"
        >
          +
        </button>
        <button
          onClick={() => setScale(1)}
          className="px-3 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
          title="Reset zoom"
        >
          100%
        </button>
        <button
          onClick={() => setScale(s => Math.max(s / 1.2, 0.1))}
          className="px-3 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          title="Zoom out"
        >
          −
        </button>
      </div>

      {/* Pan hint */}
      <div className="absolute top-4 left-4 bg-white/90 rounded-lg shadow-md px-3 py-2 text-sm text-gray-700">
        <p><strong>Pan:</strong> Click and drag</p>
        <p><strong>Zoom:</strong> Mouse wheel or buttons</p>
        {editable && <p><strong>Add Marker:</strong> Click on map</p>}
      </div>
    </div>
  )
}
