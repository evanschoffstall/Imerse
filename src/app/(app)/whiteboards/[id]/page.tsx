"use client";

import { Button } from "@/components/ui/button";
import { WhiteboardCanvas } from "@/components/whiteboard/WhiteboardCanvas";
import { WhiteboardToolbar } from "@/components/whiteboard/WhiteboardToolbar";
import type { DrawingTool, ToolConfig, WhiteboardContent, WhiteboardWithRelations } from "@/types/whiteboard";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function WhiteboardPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const [whiteboard, setWhiteboard] = useState<WhiteboardWithRelations | null>(null);
  const [content, setContent] = useState<WhiteboardContent>({
    version: "1.0",
    elements: [],
  });
  const [selectedTool, setSelectedTool] = useState<DrawingTool>("select");
  const [toolConfig, setToolConfig] = useState<ToolConfig>({
    tool: "select",
    stroke: "#000000",
    fill: "#e0e0e0",
    strokeWidth: 2,
    fontSize: 16,
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchWhiteboard();
  }, [params.id]);

  const fetchWhiteboard = async () => {
    try {
      const res = await fetch(`/api/whiteboards/${params.id}`);
      if (res.ok) {
        const data = await res.json();
        setWhiteboard(data);
        setContent(data.content as WhiteboardContent);
      } else {
        router.push("/whiteboards");
      }
    } catch (error) {
      console.error("Failed to fetch whiteboard:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!whiteboard) return;

    setSaving(true);
    try {
      const res = await fetch(`/api/whiteboards/${params.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content }),
      });

      if (res.ok) {
        const updated = await res.json();
        setWhiteboard(updated);
      }
    } catch (error) {
      console.error("Failed to save whiteboard:", error);
    } finally {
      setSaving(false);
    }
  };

  const handleContentChange = (newContent: WhiteboardContent) => {
    setContent(newContent);
  };

  const handleToolChange = (tool: DrawingTool) => {
    setSelectedTool(tool);
    setToolConfig({ ...toolConfig, tool });
  };

  const handleConfigChange = (changes: Partial<ToolConfig>) => {
    setToolConfig({ ...toolConfig, ...changes });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <p className="text-muted-foreground">Loading whiteboard...</p>
      </div>
    );
  }

  if (!whiteboard) {
    return (
      <div className="flex items-center justify-center h-screen">
        <p className="text-muted-foreground">Whiteboard not found</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen">
      {/* Header */}
      <div className="border-b p-4 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">{whiteboard.name}</h1>
          {whiteboard.description && (
            <p className="text-sm text-muted-foreground">{whiteboard.description}</p>
          )}
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => router.push("/whiteboards")}>
            Back
          </Button>
          <Button onClick={handleSave} disabled={saving}>
            {saving ? "Saving..." : "Save"}
          </Button>
        </div>
      </div>

      {/* Toolbar */}
      <WhiteboardToolbar
        selectedTool={selectedTool}
        toolConfig={toolConfig}
        onToolChange={handleToolChange}
        onConfigChange={handleConfigChange}
        onSave={handleSave}
      />

      {/* Canvas */}
      <div className="flex-1 overflow-auto p-4 bg-gray-50">
        <WhiteboardCanvas
          content={content}
          selectedTool={selectedTool}
          toolConfig={toolConfig}
          onChange={handleContentChange}
          width={1600}
          height={1200}
        />
      </div>
    </div>
  );
}
