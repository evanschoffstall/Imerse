"use client";

import type {
  DrawingTool,
  WhiteboardContent,
  WhiteboardElement
} from "@/types/whiteboard";
import Konva from "konva";
import { useEffect, useRef, useState } from "react";
import { Circle, Layer, Line, Rect, Stage, Text } from "react-konva";

interface WhiteboardCanvasProps {
  content: WhiteboardContent;
  selectedTool: DrawingTool;
  toolConfig: {
    stroke?: string;
    fill?: string;
    strokeWidth?: number;
    fontSize?: number;
  };
  onChange: (content: WhiteboardContent) => void;
  width?: number;
  height?: number;
  readOnly?: boolean;
}

export function WhiteboardCanvas({
  content,
  selectedTool,
  toolConfig,
  onChange,
  width = 1200,
  height = 800,
  readOnly = false,
}: WhiteboardCanvasProps) {
  const [elements, setElements] = useState<WhiteboardElement[]>(content.elements);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [currentShape, setCurrentShape] = useState<Partial<WhiteboardElement> | null>(null);
  const stageRef = useRef<Konva.Stage>(null);

  useEffect(() => {
    setElements(content.elements);
  }, [content]);

  const handleMouseDown = (e: Konva.KonvaEventObject<MouseEvent>) => {
    if (readOnly) return;

    const pos = e.target.getStage()?.getPointerPosition();
    if (!pos) return;

    if (selectedTool === "select") {
      // Handle selection
      const clickedOnEmpty = e.target === e.target.getStage();
      if (clickedOnEmpty) {
        setSelectedId(null);
      }
      return;
    }

    // Start drawing new shape
    setIsDrawing(true);
    const id = `element-${Date.now()}`;

    let newShape: Partial<WhiteboardElement>;

    switch (selectedTool) {
      case "rectangle":
        newShape = {
          id,
          type: "rectangle",
          x: pos.x,
          y: pos.y,
          width: 0,
          height: 0,
          fill: toolConfig.fill || "#e0e0e0",
          stroke: toolConfig.stroke || "#000000",
          strokeWidth: toolConfig.strokeWidth || 2,
        };
        break;

      case "circle":
        newShape = {
          id,
          type: "circle",
          x: pos.x,
          y: pos.y,
          width: 0,
          height: 0,
          radius: 0,
          fill: toolConfig.fill || "#e0e0e0",
          stroke: toolConfig.stroke || "#000000",
          strokeWidth: toolConfig.strokeWidth || 2,
        };
        break;

      case "arrow":
        newShape = {
          id,
          type: "arrow",
          x: pos.x,
          y: pos.y,
          width: 0,
          height: 0,
          points: [
            { x: pos.x, y: pos.y },
            { x: pos.x, y: pos.y },
          ],
          stroke: toolConfig.stroke || "#000000",
          strokeWidth: toolConfig.strokeWidth || 2,
        };
        break;

      case "line":
      case "draw":
        newShape = {
          id,
          type: "line",
          x: pos.x,
          y: pos.y,
          width: 0,
          height: 0,
          points: [{ x: pos.x, y: pos.y }],
          stroke: toolConfig.stroke || "#000000",
          strokeWidth: toolConfig.strokeWidth || 2,
        };
        break;

      case "text":
        newShape = {
          id,
          type: "text",
          x: pos.x,
          y: pos.y,
          width: 200,
          height: 50,
          text: "Double-click to edit",
          fontSize: toolConfig.fontSize || 16,
          fill: toolConfig.stroke || "#000000",
        };
        break;

      case "sticky":
        newShape = {
          id,
          type: "sticky",
          x: pos.x,
          y: pos.y,
          width: 200,
          height: 200,
          text: "New note",
          color: "#fef68a",
          fontSize: 14,
        };
        break;

      default:
        return;
    }

    setCurrentShape(newShape);
  };

  const handleMouseMove = (e: Konva.KonvaEventObject<MouseEvent>) => {
    if (!isDrawing || !currentShape || readOnly) return;

    const pos = e.target.getStage()?.getPointerPosition();
    if (!pos) return;

    let updatedShape = { ...currentShape };

    switch (currentShape.type) {
      case "rectangle":
        updatedShape.width = pos.x - (currentShape.x || 0);
        updatedShape.height = pos.y - (currentShape.y || 0);
        break;

      case "circle":
        const radius = Math.sqrt(
          Math.pow(pos.x - (currentShape.x || 0), 2) +
          Math.pow(pos.y - (currentShape.y || 0), 2)
        );
        if ('radius' in currentShape) {
          (updatedShape as any).radius = radius;
        }
        updatedShape.width = radius * 2;
        updatedShape.height = radius * 2;
        break;

      case "arrow":
        if ('points' in currentShape && currentShape.points) {
          (updatedShape as any).points = [
            currentShape.points[0],
            { x: pos.x, y: pos.y },
          ];
        }
        break;

      case "line":
        if ('points' in currentShape && currentShape.points) {
          (updatedShape as any).points = [...currentShape.points, { x: pos.x, y: pos.y }];
        }
        break;
    }

    setCurrentShape(updatedShape);
  };

  const handleMouseUp = () => {
    if (!isDrawing || !currentShape || readOnly) return;

    // Add completed shape to elements
    const newElements = [...elements, currentShape as WhiteboardElement];
    setElements(newElements);
    onChange({
      ...content,
      elements: newElements,
    });

    setIsDrawing(false);
    setCurrentShape(null);
  };

  const handleElementChange = (id: string, changes: Partial<WhiteboardElement>) => {
    const newElements = elements.map((el) =>
      el.id === id ? { ...el, ...changes } as WhiteboardElement : el
    );
    setElements(newElements);
    onChange({
      ...content,
      elements: newElements,
    });
  };

  const handleDelete = () => {
    if (!selectedId) return;
    const newElements = elements.filter((el) => el.id !== selectedId);
    setElements(newElements);
    onChange({
      ...content,
      elements: newElements,
    });
    setSelectedId(null);
  };

  return (
    <div className="border rounded-lg overflow-hidden bg-white">
      <Stage
        ref={stageRef}
        width={width}
        height={height}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        style={{ cursor: selectedTool === "select" ? "default" : "crosshair" }}
      >
        <Layer>
          {/* Background */}
          <Rect
            x={0}
            y={0}
            width={width}
            height={height}
            fill={content.background || "#ffffff"}
          />

          {/* Grid */}
          {content.grid?.enabled && (
            <>
              {Array.from({ length: Math.ceil(width / (content.grid.size || 20)) }).map((_, i) => (
                <Line
                  key={`v-${i}`}
                  points={[i * (content.grid!.size || 20), 0, i * (content.grid!.size || 20), height]}
                  stroke={content.grid!.color || "#e0e0e0"}
                  strokeWidth={1}
                />
              ))}
              {Array.from({ length: Math.ceil(height / (content.grid.size || 20)) }).map((_, i) => (
                <Line
                  key={`h-${i}`}
                  points={[0, i * (content.grid!.size || 20), width, i * (content.grid!.size || 20)]}
                  stroke={content.grid!.color || "#e0e0e0"}
                  strokeWidth={1}
                />
              ))}
            </>
          )}

          {/* Render elements */}
          {elements.map((element) => {
            switch (element.type) {
              case "rectangle":
                return (
                  <Rect
                    key={element.id}
                    {...element}
                    draggable={selectedTool === "select" && !readOnly}
                    onClick={() => setSelectedId(element.id)}
                    onDragEnd={(e) => {
                      handleElementChange(element.id, {
                        x: e.target.x(),
                        y: e.target.y(),
                      });
                    }}
                  />
                );

              case "circle":
                return (
                  <Circle
                    key={element.id}
                    {...element}
                    draggable={selectedTool === "select" && !readOnly}
                    onClick={() => setSelectedId(element.id)}
                    onDragEnd={(e) => {
                      handleElementChange(element.id, {
                        x: e.target.x(),
                        y: e.target.y(),
                      });
                    }}
                  />
                );

              case "text":
                return (
                  <Text
                    key={element.id}
                    {...element}
                    draggable={selectedTool === "select" && !readOnly}
                    onClick={() => setSelectedId(element.id)}
                    onDragEnd={(e) => {
                      handleElementChange(element.id, {
                        x: e.target.x(),
                        y: e.target.y(),
                      });
                    }}
                  />
                );

              default:
                return null;
            }
          })}

          {/* Render current shape being drawn */}
          {currentShape && (
            <>
              {currentShape.type === "rectangle" && (
                <Rect {...(currentShape as any)} />
              )}
              {currentShape.type === "circle" && (
                <Circle {...(currentShape as any)} />
              )}
              {currentShape.type === "text" && (
                <Text {...(currentShape as any)} />
              )}
            </>
          )}
        </Layer>
      </Stage>
    </div>
  );
}
