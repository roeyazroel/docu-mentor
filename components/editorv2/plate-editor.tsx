"use client";

import { useEffect, useState } from "react";
import { DndProvider } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";

import { Value } from "@udecode/plate";
import { Plate } from "@udecode/plate/react";

import { useCreateEditor } from "@/components/editorv2/use-create-editor";
import { Editor, EditorContainer } from "@/components/plate-ui/editor";

// Define props interface
interface PlateEditorProps {
  content: string;
  onChange: (value: string) => void;
}

// Default empty value
const defaultInitialValue: Value = [{ type: "p", children: [{ text: "" }] }];

// Update function signature to accept props
export function PlateEditor({ content, onChange }: PlateEditorProps) {
  const editor = useCreateEditor();
  // State for initialization tracking
  const [isInitialized, setIsInitialized] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  // Effect for deserializing content or handling external updates
  useEffect(() => {
    // Cast editor.api to include markdown methods
    const api = editor.api as any; // Use 'any' for simplicity, or define a specific type extension

    if (api?.markdown) {
      try {
        // Only proceed if content is actually different from the current state
        const currentContent = isInitialized ? api.markdown.serialize() : "";

        if (content && content !== currentContent) {
          const deserializedValue = api.markdown.deserialize(content);
          if (!isInitialized) {
            editor.children = deserializedValue;
            editor.history = { undos: [], redos: [] };
            if (editor.selection) editor.selection = null;
            setIsInitialized(true);
          } else {
            // Use setValue for subsequent updates to handle history correctly
            editor.tf.setValue(deserializedValue);
          }
        } else if (!content && (!isInitialized || currentContent !== "")) {
          // Handle resetting to empty state
          if (!isInitialized) {
            editor.children = defaultInitialValue;
            editor.history = { undos: [], redos: [] };
            if (editor.selection) editor.selection = null;
            setIsInitialized(true);
          } else {
            editor.tf.setValue(defaultInitialValue);
          }
        } else if (!isInitialized) {
          // Ensure initialization happens even if initial content is empty or same as default
          setIsInitialized(true);
        }
      } catch (error) {
        console.error("Error deserializing markdown in PlateEditor:", error);
        // Fallback to default value on error
        if (!isInitialized) {
          editor.children = defaultInitialValue;
          editor.history = { undos: [], redos: [] };
          if (editor.selection) editor.selection = null;
          setIsInitialized(true);
        }
      }
    } else if (!isInitialized) {
      // If markdown API is not ready yet, still mark as initialized with default
      // (assuming useCreateEditor provides a basic structure initially)
      setIsInitialized(true);
    }
    // Depend on editor instance readiness and content prop changes
  }, [editor, content, isInitialized]); // Removed onChange from deps as it's stable

  // Handler for Plate's onChange, serializes Value to Markdown
  const handlePlateChange = ({ value: newValue }: { value: Value }) => {
    // Cast editor.api to include markdown methods
    const api = editor.api as any; // Use 'any' for simplicity

    if (api?.markdown && isInitialized) {
      try {
        // Use the editor's current state for serialization
        const markdownString = api.markdown.serialize();
        // Only call onChange if the serialized markdown actually changed
        if (markdownString !== content) {
          onChange(markdownString);
        }
      } catch (error) {
        console.error("Error serializing to markdown in PlateEditor:", error);
      }
    }
  };

  // Loading state
  if (!isInitialized) {
    return (
      <div className="flex items-center justify-center h-64 w-full">
        <div className="flex flex-col items-center space-y-3">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
          <p className="text-sm text-muted-foreground">
            Initializing editor...
          </p>
        </div>
      </div>
    );
  }

  return (
    <DndProvider backend={HTML5Backend}>
      {/* Pass the change handler to Plate */}
      <Plate editor={editor} onChange={handlePlateChange} >
        <EditorContainer>
          {/* Added className and style for basic sizing like in DocumentEditor */}
          <Editor
            onFocus={() => setIsFocused(true)}
            variant="default"
            className="p-4 flex-1 overflow-y-auto"
            style={{ minHeight: "400px" }}
            placeholder={!isFocused ? "Start writing..." : ""}
          />
        </EditorContainer>

        {/* <SettingsDialog /> */}
      </Plate>
    </DndProvider>
  );
}
