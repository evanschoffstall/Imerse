"use client";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { DEFAULT_TEMPLATES, type WhiteboardTemplate } from "@/types/whiteboard";

interface WhiteboardShapeLibraryProps {
  onSelectTemplate: (template: WhiteboardTemplate) => void;
}

export function WhiteboardShapeLibrary({
  onSelectTemplate,
}: WhiteboardShapeLibraryProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Templates</CardTitle>
        <CardDescription>
          Start with a pre-built template
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {DEFAULT_TEMPLATES.map((template) => (
            <Card
              key={template.id}
              className="cursor-pointer hover:border-primary transition-colors"
              onClick={() => onSelectTemplate(template)}
            >
              <CardHeader>
                <CardTitle className="text-base">{template.name}</CardTitle>
                {template.description && (
                  <CardDescription className="text-sm">
                    {template.description}
                  </CardDescription>
                )}
              </CardHeader>
              {template.thumbnail && (
                <CardContent>
                  <img
                    src={template.thumbnail}
                    alt={template.name}
                    className="w-full h-32 object-cover rounded"
                  />
                </CardContent>
              )}
            </Card>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

// Common shape presets
const SHAPES = [
  {
    id: "rect",
    name: "Rectangle",
    icon: "▭",
    create: () => ({
      type: "rectangle" as const,
      width: 100,
      height: 60,
      fill: "#e0e0e0",
      stroke: "#000000",
      strokeWidth: 2,
    }),
  },
  {
    id: "circle",
    name: "Circle",
    icon: "○",
    create: () => ({
      type: "circle" as const,
      radius: 50,
      fill: "#e0e0e0",
      stroke: "#000000",
      strokeWidth: 2,
    }),
  },
  {
    id: "arrow",
    name: "Arrow",
    icon: "→",
    create: () => ({
      type: "arrow" as const,
      points: [
        { x: 0, y: 0 },
        { x: 100, y: 0 },
      ],
      stroke: "#000000",
      strokeWidth: 2,
    }),
  },
];

interface ShapePaletteProps {
  onAddShape: (shape: any) => void;
}

export function ShapePalette({ onAddShape }: ShapePaletteProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Shapes</CardTitle>
        <CardDescription>
          Click to add a shape to the canvas
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-3 gap-2">
          {SHAPES.map((shape) => (
            <Button
              key={shape.id}
              variant="outline"
              className="h-20 flex flex-col items-center justify-center"
              onClick={() => {
                const newShape = shape.create();
                const width = newShape.type === "circle" && 'radius' in newShape
                  ? newShape.radius * 2
                  : 'width' in newShape ? newShape.width : 100;
                const height = newShape.type === "circle" && 'radius' in newShape
                  ? newShape.radius * 2
                  : 'height' in newShape ? newShape.height || 60 : 60;
                onAddShape({
                  ...newShape,
                  id: `element-${Date.now()}`,
                  x: 100,
                  y: 100,
                  width,
                  height,
                });
              }}
            >
              <span className="text-3xl mb-1">{shape.icon}</span>
              <span className="text-xs">{shape.name}</span>
            </Button>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
