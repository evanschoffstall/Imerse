"use client";

import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select-radix";
import { Separator } from "@/components/ui/separator";
import type { DrawingTool, ToolConfig } from "@/types/whiteboard";

interface WhiteboardToolbarProps {
  selectedTool: DrawingTool;
  toolConfig: ToolConfig;
  onToolChange: (tool: DrawingTool) => void;
  onConfigChange: (config: Partial<ToolConfig>) => void;
  onSave?: () => void;
  onExport?: () => void;
  onUndo?: () => void;
  onRedo?: () => void;
}

const TOOLS: Array<{ value: DrawingTool; label: string; icon: string }> = [
  { value: "select", label: "Select", icon: "↖️" },
  { value: "rectangle", label: "Rectangle", icon: "▭" },
  { value: "circle", label: "Circle", icon: "○" },
  { value: "arrow", label: "Arrow", icon: "→" },
  { value: "line", label: "Line", icon: "—" },
  { value: "draw", label: "Draw", icon: "✏️" },
  { value: "text", label: "Text", icon: "T" },
  { value: "sticky", label: "Sticky Note", icon: "📝" },
  { value: "eraser", label: "Eraser", icon: "🧹" },
  { value: "pan", label: "Pan", icon: "✋" },
];

const COLORS = [
  { value: "#000000", label: "Black" },
  { value: "#ff0000", label: "Red" },
  { value: "#00ff00", label: "Green" },
  { value: "#0000ff", label: "Blue" },
  { value: "#ffff00", label: "Yellow" },
  { value: "#ff00ff", label: "Magenta" },
  { value: "#00ffff", label: "Cyan" },
  { value: "#ffffff", label: "White" },
];

const STROKE_WIDTHS = [1, 2, 3, 4, 5, 8, 10];

export function WhiteboardToolbar({
  selectedTool,
  toolConfig,
  onToolChange,
  onConfigChange,
  onSave,
  onExport,
  onUndo,
  onRedo,
}: WhiteboardToolbarProps) {
  return (
    <div className="bg-background border-b p-4">
      <div className="flex items-center gap-4 flex-wrap">
        {/* Drawing tools */}
        <div className="flex gap-1">
          {TOOLS.map((tool) => (
            <Button
              key={tool.value}
              variant={selectedTool === tool.value ? "default" : "outline"}
              size="sm"
              onClick={() => onToolChange(tool.value)}
              title={tool.label}
            >
              <span className="text-lg">{tool.icon}</span>
            </Button>
          ))}
        </div>

        <Separator orientation="vertical" className="h-8" />

        {/* Stroke color */}
        <div className="flex items-center gap-2">
          <Label className="text-sm">Stroke:</Label>
          <div className="flex gap-1">
            {COLORS.map((color) => (
              <button
                key={color.value}
                className="w-6 h-6 rounded border-2 border-gray-300 hover:border-gray-500"
                style={{ backgroundColor: color.value }}
                onClick={() => onConfigChange({ stroke: color.value })}
                title={color.label}
              />
            ))}
          </div>
        </div>

        {/* Fill color */}
        {["rectangle", "circle"].includes(selectedTool) && (
          <>
            <Separator orientation="vertical" className="h-8" />
            <div className="flex items-center gap-2">
              <Label className="text-sm">Fill:</Label>
              <div className="flex gap-1">
                {COLORS.map((color) => (
                  <button
                    key={color.value}
                    className="w-6 h-6 rounded border-2 border-gray-300 hover:border-gray-500"
                    style={{ backgroundColor: color.value }}
                    onClick={() => onConfigChange({ fill: color.value })}
                    title={color.label}
                  />
                ))}
              </div>
            </div>
          </>
        )}

        {/* Stroke width */}
        <Separator orientation="vertical" className="h-8" />
        <div className="flex items-center gap-2">
          <Label className="text-sm">Width:</Label>
          <Select
            value={String(toolConfig.strokeWidth || 2)}
            onValueChange={(value) =>
              onConfigChange({ strokeWidth: Number(value) })
            }
          >
            <SelectTrigger className="w-20">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {STROKE_WIDTHS.map((width) => (
                <SelectItem key={width} value={String(width)}>
                  {width}px
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Font size for text */}
        {selectedTool === "text" && (
          <>
            <Separator orientation="vertical" className="h-8" />
            <div className="flex items-center gap-2">
              <Label className="text-sm">Font:</Label>
              <Select
                value={String(toolConfig.fontSize || 16)}
                onValueChange={(value) =>
                  onConfigChange({ fontSize: Number(value) })
                }
              >
                <SelectTrigger className="w-20">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {[12, 14, 16, 18, 20, 24, 28, 32, 36, 48].map((size) => (
                    <SelectItem key={size} value={String(size)}>
                      {size}px
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </>
        )}

        <div className="flex-1" />

        {/* Actions */}
        <div className="flex gap-2">
          {onUndo && (
            <Button variant="outline" size="sm" onClick={onUndo}>
              Undo
            </Button>
          )}
          {onRedo && (
            <Button variant="outline" size="sm" onClick={onRedo}>
              Redo
            </Button>
          )}
          {onExport && (
            <Button variant="outline" size="sm" onClick={onExport}>
              Export
            </Button>
          )}
          {onSave && (
            <Button size="sm" onClick={onSave}>
              Save
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
