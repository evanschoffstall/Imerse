"use client"

import { Editor } from "@/components/blocks/editor-x/editor"
import { SerializedEditorState } from "lexical"
import { useState } from "react"

interface RichTextEditorProps {
  content: string
  onChange: (content: string) => void
  placeholder?: string
  disabled?: boolean
  className?: string
}

/**
 * RichTextEditor - React Hook Form compatible wrapper for editor-x
 * 
 * This component adapts the Lexical-based editor to work with React Hook Form
 * by converting between string content (HTML/JSON) and Lexical EditorState.
 * 
 * Usage:
 * ```tsx
 * <RichTextEditor 
 *   content={field.value || ''} 
 *   onChange={field.onChange}
 *   placeholder="Enter description..."
 * />
 * ```
 */
export default function RichTextEditor({
  content,
  onChange,
  disabled,
  className
}: RichTextEditorProps) {
  const [editorState, setEditorState] = useState<SerializedEditorState>(() => {
    // Initialize with content if provided
    if (content) {
      try {
        // Try to parse as JSON (serialized Lexical state)
        return JSON.parse(content)
      } catch {
        // If not JSON, create empty state - Lexical will handle text initialization
        return createEmptyEditorState()
      }
    }

    // Empty state with placeholder-ready structure
    return createEmptyEditorState()
  })

  const handleChange = (newState: SerializedEditorState) => {
    setEditorState(newState)
    // Convert to JSON string for storage
    onChange(JSON.stringify(newState))
  }

  return (
    <Editor
      editorSerializedState={editorState}
      onSerializedChange={handleChange}
      className={className}
    />
  )
}

// Helper function to create empty editor state
// Lexical requires at least one paragraph node in root
function createEmptyEditorState(): SerializedEditorState {
  return {
    root: {
      children: [
        {
          children: [],
          direction: "ltr",
          format: "",
          indent: 0,
          type: "paragraph",
          version: 1,
        },
      ],
      direction: "ltr",
      format: "",
      indent: 0,
      type: "root",
      version: 1,
    },
  } as unknown as SerializedEditorState
}
