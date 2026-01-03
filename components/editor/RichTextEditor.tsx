'use client'

import { $generateHtmlFromNodes, $generateNodesFromDOM } from '@lexical/html'
import {
  InitialConfigType,
  LexicalComposer,
} from '@lexical/react/LexicalComposer'
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext'
import { $getRoot, $insertNodes } from 'lexical'
import { useEffect, useState } from 'react'

import { nodes } from '@/components/blocks/editor-md/nodes'
import { Plugins } from '@/components/blocks/editor-md/plugins'
import { editorTheme } from '@/components/editor/themes/editor-theme'
import { TooltipProvider } from '@/components/ui/tooltip'

interface RichTextEditorProps {
  content?: string
  onChange?: (content: string) => void
  placeholder?: string
  disabled?: boolean
}

const editorConfig: InitialConfigType = {
  namespace: 'Editor',
  theme: editorTheme,
  nodes,
  onError: (error: Error) => {
    console.error(error)
  },
}

// Component to handle HTML conversion
function HtmlStateManager({
  content,
  onChange
}: {
  content?: string
  onChange?: (content: string) => void
}) {
  const [editor] = useLexicalComposerContext()
  const [initialized, setInitialized] = useState(false)

  // Set initial content from HTML
  useEffect(() => {
    if (!initialized && content && content !== '<p></p>' && content !== '') {
      editor.update(() => {
        const parser = new DOMParser()
        const dom = parser.parseFromString(content, 'text/html')
        const nodes = $generateNodesFromDOM(editor, dom)
        $getRoot().clear()
        $insertNodes(nodes)
      })
      setInitialized(true)
    }
  }, [editor, content, initialized])

  // Handle changes and convert to HTML
  useEffect(() => {
    if (!onChange) return

    return editor.registerUpdateListener(({ editorState }) => {
      editorState.read(() => {
        const htmlString = $generateHtmlFromNodes(editor)
        onChange(htmlString)
      })
    })
  }, [editor, onChange])

  return null
}

export default function RichTextEditor({
  content = '',
  onChange,
  placeholder = 'Start writing...',
  disabled = false
}: RichTextEditorProps) {
  return (
    <div className={disabled ? 'pointer-events-none opacity-50' : ''}>
      <div className="bg-background overflow-hidden rounded-lg border shadow">
        <LexicalComposer initialConfig={editorConfig}>
          <TooltipProvider>
            <Plugins />
            <HtmlStateManager content={content} onChange={onChange} />
          </TooltipProvider>
        </LexicalComposer>
      </div>
    </div>
  )
}
