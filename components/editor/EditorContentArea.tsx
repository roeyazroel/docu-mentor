import AiSuggestionDiff from "@/components/ai-suggestion-diff";
import { Button } from "@/components/ui/button";
import { Sparkles } from "lucide-react";
import React from "react";
import { PlateEditor } from "../editorv2/plate-editor";

interface EditorContentAreaProps {
  /** Whether to show the AI suggestion diff view */
  showDiff: boolean;
  /** The current content of the document */
  documentContent: string;
  /** Callback function when the document content changes */
  onDocumentContentChange: (content: string) => void;
  /** The AI-suggested text */
  aiSuggestion: string;
  /** Callback function to accept all AI suggestions */
  onAcceptAll: () => void;
  /** Callback function to reject all AI suggestions */
  onRejectAll: () => void;
  /** Callback function to finalize partially accepted changes and exit diff view */
  onFinalizeChanges: () => void;
  /** The currently active file ID */
  activeFileId: string | null;
}

/**
 * Renders the main content area of the editor, switching between the
 * standard document editor and the AI suggestion diff view.
 */
export const EditorContentArea: React.FC<EditorContentAreaProps> = ({
  showDiff,
  documentContent,
  onDocumentContentChange,
  aiSuggestion,
  onAcceptAll,
  onRejectAll,
  onFinalizeChanges,
  activeFileId,
}) => {
  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      {!activeFileId ? (
        <div className="flex-1 flex items-center justify-center">
          <div className="text-muted-foreground text-center p-4">
            <h3 className="font-medium mb-2">No Document Selected</h3>
            <p>Select a file from the sidebar to start editing</p>
          </div>
        </div>
      ) : showDiff ? (
        <div className="flex-1 overflow-auto p-4">
          <div className="mb-4 flex items-center justify-between">
            <div className="flex items-center">
              <Sparkles className="h-5 w-5 text-primary mr-2" />
              <span className="font-medium">AI Suggestion</span>
            </div>
            <Button size="sm" className="gap-1" onClick={onFinalizeChanges}>
              Apply & Continue Editing
            </Button>
          </div>

          <AiSuggestionDiff
            originalText={documentContent}
            suggestedText={aiSuggestion}
            onAcceptAll={onAcceptAll}
            onRejectAll={onRejectAll}
            onFinalizeChanges={(finalText) => {
              onDocumentContentChange(finalText);
              onFinalizeChanges();
            }}
          />
        </div>
      ) : (
        <div className="flex-1 overflow-hidden">
          <PlateEditor
            content={documentContent}
            onChange={onDocumentContentChange}
          />
        </div>
      )}
    </div>
  );
};
