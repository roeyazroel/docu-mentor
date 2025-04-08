"use client"

import { useState, useCallback } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Textarea } from "@/components/ui/textarea"
import ReactMarkdown from "react-markdown"
import EditorToolbar from "./editor-toolbar"

interface DocumentEditorProps {
  content: string
  onChange: (value: string) => void
}

export default function DocumentEditor({ content, onChange }: DocumentEditorProps) {
  const [activeTab, setActiveTab] = useState<string>("preview")

  // Handle formatting actions from the toolbar
  const handleFormatText = useCallback(
    (format: string, value?: any) => {
      // In a real implementation, this would apply the formatting to the selected text
      // For now, we'll just log the action and insert some example markdown
      console.log(`Format: ${format}`, value ? `Value: ${value}` : "")

      // Example implementation for some basic markdown formatting
      if (activeTab === "edit") {
        let formattedText = ""

        switch (format) {
          case "bold":
            formattedText = `**Bold Text**`
            break
          case "italic":
            formattedText = `*Italic Text*`
            break
          case "heading":
            if (value === "h1") formattedText = `# Heading 1`
            else if (value === "h2") formattedText = `## Heading 2`
            else if (value === "h3") formattedText = `### Heading 3`
            break
          case "bulletList":
            formattedText = `\n- List item 1\n- List item 2\n- List item 3`
            break
          case "numberedList":
            formattedText = `\n1. List item 1\n2. List item 2\n3. List item 3`
            break
          case "link":
            formattedText = `[Link Text](${value || "https://example.com"})`
            break
          case "image":
            if (typeof value === "object" && value.url) {
              formattedText = `![${value.alt || "Image"}](${value.url})`
            } else {
              formattedText = `![Image](https://example.com/image.jpg)`
            }
            break
          case "horizontalRule":
            formattedText = `\n---\n`
            break
          case "code":
            formattedText = "```\ncode block\n```"
            break
          case "blockquote":
            formattedText = `\n> Blockquote text\n`
            break
          case "table":
            formattedText = `\n| Header 1 | Header 2 | Header 3 |\n| --- | --- | --- |\n| Cell 1 | Cell 2 | Cell 3 |\n| Cell 4 | Cell 5 | Cell 6 |\n`
            break
          default:
            // For other formats, we would need a more sophisticated editor
            // that can handle cursor position and selection
            return
        }

        // Insert the formatted text at cursor position or replace selection
        // This is a simplified implementation - a real one would need to track cursor position
        onChange(content + formattedText)
      } else {
        // If we're in preview mode, switch to edit mode first
        setActiveTab("edit")
      }
    },
    [activeTab, content, onChange],
  )

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      <EditorToolbar onFormatText={handleFormatText} />

      <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col overflow-hidden">
        <div className="border-b px-4">
          <TabsList className="h-10">
            <TabsTrigger value="preview">Preview</TabsTrigger>
            <TabsTrigger value="edit">Edit</TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="edit" className="flex-1 overflow-auto p-0 m-0">
          <Textarea
            value={content}
            onChange={(e) => onChange(e.target.value)}
            placeholder="Start typing your document here... (Markdown supported)"
            className="min-h-full w-full resize-none border-0 p-4 focus-visible:ring-0 focus-visible:ring-offset-0 font-mono text-sm"
          />
        </TabsContent>

        <TabsContent value="preview" className="flex-1 overflow-auto p-4 m-0 prose dark:prose-invert max-w-none">
          {content ? (
            <ReactMarkdown>{content}</ReactMarkdown>
          ) : (
            <div className="text-muted-foreground italic">Your rendered document will appear here...</div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}
