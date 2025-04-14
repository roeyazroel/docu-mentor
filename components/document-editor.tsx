"use client";

import { Value } from "@udecode/plate";
import {
  BaseBoldPlugin,
  BaseCodePlugin,
  BaseItalicPlugin,
  BaseStrikethroughPlugin,
  BaseUnderlinePlugin,
} from "@udecode/plate-basic-marks";
import { MarkdownPlugin } from "@udecode/plate-markdown";
import { createPlateEditor, Plate, PlateContent } from "@udecode/plate/react";
import { useEffect, useMemo, useState } from "react";
import { blockSelectionPlugins } from "./editorv2/plugins/block-selection-plugins";
import { commentsPlugin } from "./editorv2/plugins/comments-plugin";
import { suggestionPlugin } from "./editorv2/plugins/suggestion-plugin";
interface DocumentEditorProps {
  content: string;
  onChange: (value: string) => void;
}

// Default empty value for Plate
const defaultInitialValue: Value = [{ type: "p", children: [{ text: "" }] }];

// Define the plugins for the Plate editor
const plugins = [
  // createParagraphPlugin(),
  BaseBoldPlugin,
  BaseItalicPlugin,
  BaseUnderlinePlugin,
  BaseStrikethroughPlugin,
  BaseCodePlugin,
  MarkdownPlugin,
  suggestionPlugin,
  commentsPlugin,
  ...blockSelectionPlugins,
];

export default function DocumentEditor({
  content,
  onChange,
}: DocumentEditorProps) {
  // Memoize the editor creation
  const editor = useMemo(
    () =>
      createPlateEditor({
        plugins: plugins,
        // Initial value is set here, but we'll update it based on content prop
        // We need *some* initial value, even if empty, before deserialization runs.
        value: defaultInitialValue,
      }),
    []
  );

  // State to track if the initial content prop has been applied
  const [isInitialized, setIsInitialized] = useState(false);

  // Effect to deserialize and set initial content or update from external changes
  useEffect(() => {
    if (editor?.api?.markdown && content) {
      try {
        const deserializedValue = editor.api.markdown.deserialize(content);

        if (!isInitialized) {
          editor.children = deserializedValue;
          editor.history = { undos: [], redos: [] };
          if (editor.selection) editor.selection = null;
          setIsInitialized(true);
        } else {
          // Call serialize() with no arguments to get current content
          const currentContent = editor.api.markdown.serialize();
          if (content !== currentContent) {
            editor.tf.setValue(deserializedValue);
          }
        }
      } catch (error) {
        console.error("Error deserializing markdown:", error);
        editor.children = defaultInitialValue;
        if (!isInitialized) setIsInitialized(true);
      }
    } else if (!content && !isInitialized) {
      editor.children = defaultInitialValue;
      setIsInitialized(true);
    } else if (!content && isInitialized) {
      // Call serialize() with no arguments to get current content
      const currentContent = editor.api.markdown.serialize();
      if (currentContent !== "") {
        editor.tf.setValue(defaultInitialValue);
      }
    }
  }, [content, editor, isInitialized]);

  // Handler for Plate's onChange, serializes Value to Markdown
  const handlePlateChange = ({ value: newValue }: { value: Value }) => {
    if (editor?.api?.markdown) {
      try {
        // Call serialize() with no arguments to serialize the latest value (newValue)
        // Note: The editor state (editor.children) is already updated
        // by Plate before this handler is called, so newValue reflects the current state.
        const markdownString = editor.api.markdown.serialize();
        if (markdownString !== content) {
          onChange(markdownString);
        }
      } catch (error) {
        console.error("Error serializing to markdown:", error);
      }
    }
  };

  // Guard until the editor is initialized with content/default
  if (!isInitialized) {
    <div className="flex items-center justify-center h-64 w-full">
      <div className="flex flex-col items-center space-y-3">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
        <p className="text-sm text-muted-foreground">Initializing editor...</p>
      </div>
    </div>;
  }

  return (
    <div className="flex-1 flex flex-col overflow-hidden w-full h-full border rounded-md">
      <Plate editor={editor} onChange={handlePlateChange}>
        <PlateContent
          placeholder="Write your markdown here..."
          className="p-4 flex-1 overflow-y-auto"
          style={{ minHeight: "400px" }}
        />
      </Plate>
    </div>
  );
}
