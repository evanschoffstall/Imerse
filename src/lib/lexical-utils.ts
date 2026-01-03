import { SerializedEditorState, SerializedLexicalNode } from "lexical";

/**
 * Extract plain text from serialized Lexical editor state
 * Used for previews, search indexing, and metadata
 */
export function extractTextFromLexical(content: string): string {
  if (!content) return "";

  try {
    const state: SerializedEditorState = JSON.parse(content);
    return extractTextFromNode(state.root);
  } catch {
    // If not valid JSON, return empty string
    return "";
  }
}

function extractTextFromNode(node: SerializedLexicalNode): string {
  let text = "";

  // @ts-expect-error - accessing text property
  if (node.text) {
    // @ts-expect-error - accessing text property
    text += node.text;
  }

  // @ts-expect-error - accessing children property
  if (node.children && Array.isArray(node.children)) {
    // @ts-expect-error - accessing children property
    for (const child of node.children) {
      text += extractTextFromNode(child);
    }
  }

  return text;
}

/**
 * Truncate text to a maximum length with ellipsis
 */
export function truncateText(text: string, maxLength: number = 150): string {
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength).trim() + "...";
}
