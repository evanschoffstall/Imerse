"use client"

import {
  InitialConfigType,
  LexicalComposer,
} from "@lexical/react/LexicalComposer"
import { ContentEditable } from "@lexical/react/LexicalContentEditable"
import { EditorRefPlugin } from "@lexical/react/LexicalEditorRefPlugin"
import { LexicalErrorBoundary } from "@lexical/react/LexicalErrorBoundary"
import { RichTextPlugin } from "@lexical/react/LexicalRichTextPlugin"
import { SerializedEditorState } from "lexical"

import { nodes } from "@/components/blocks/editor-x/nodes"
import { editorTheme } from "@/components/editor/themes/editor-theme"

interface RichTextViewerProps {
  content: string
  className?: string
}

/**
 * RichTextViewer - Read-only display component for Lexical editor content
 * 
 * This component renders serialized Lexical JSON content in read-only mode.
 * It's used for displaying rich text content without editing capabilities.
 * 
 * Usage:
 * ```tsx
 * <RichTextViewer 
 *   content={campaign.description}
 *   className="prose prose-sm max-w-none dark:prose-invert"
 * />
 * ```
 */
export default function RichTextViewer({
  content,
  className = "prose prose-sm max-w-none dark:prose-invert",
}: RichTextViewerProps) {
  let editorState: SerializedEditorState | undefined

  try {
    // Try to parse as JSON (serialized Lexical state)
    editorState = JSON.parse(content)
  } catch {
    // If not valid JSON or empty, don't render anything
    return null
  }

  const editorConfig: InitialConfigType = {
    namespace: "Viewer",
    theme: editorTheme,
    nodes,
    editable: false,
    editorState: JSON.stringify(editorState),
    onError: (error: Error) => {
      console.error("RichTextViewer error:", error)
    },
  }

  return (
    <LexicalComposer initialConfig={editorConfig}>
      <div className={className}>
        <RichTextPlugin
          contentEditable={
            <ContentEditable className="outline-none" />
          }
          placeholder={null}
          ErrorBoundary={LexicalErrorBoundary}
        />
        <EditorRefPlugin />
      </div>
    </LexicalComposer>
  )
}
