import DocumentEditor from "@/components/document-editor";
import { Button } from "@/components/ui/button";
import { Sparkles } from "lucide-react";
import React from "react";
import SideBySideEditor from "./SideBySideEditor";

interface EditorContentAreaProps {
  /** Whether to show the AI suggestion diff view */
  showDiff: boolean;
  /** The current content of the document */
  documentContent: string;
  /** Callback function when the document content changes */
  onDocumentContentChange: (content: string) => void;
  /** The AI-suggested text */
  aiSuggestion: string;
  /** The merge conflict representation for the diff view */
  mergeConflictText: string;
  /** Callback function to accept all AI suggestions */
  onAcceptAll: () => void;
  /** Callback function to reject all AI suggestions */
  onRejectAll: () => void;
  /** Callback function to finalize partially accepted changes and exit diff view */
  onFinalizeChanges: () => void;
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
  mergeConflictText,
  onAcceptAll,
  onRejectAll,
  onFinalizeChanges,
}) => {
  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      {showDiff ? (
        <div className="flex-1 overflow-auto p-4">
          <div className="mb-4 flex items-center justify-between">
            <div className="flex items-center">
              <Sparkles className="h-5 w-5 text-primary mr-2" />
              <span className="font-medium">AI Suggestion</span>
            </div>
            {/* Note: finalizeChanges applies the partially accepted text */}
            <Button size="sm" className="gap-1" onClick={onFinalizeChanges}>
              Apply & Continue Editing
            </Button>
          </div>

          <SideBySideEditor
            originalText={documentContent}
            suggestedText={aiSuggestion}
            onAcceptAll={onAcceptAll}
            onRejectAll={onRejectAll}
            onFinalizeChanges={(newText) => {
              onDocumentContentChange(newText);
              onFinalizeChanges();
            }}
          />
        </div>
      ) : (
        <DocumentEditor
          content={documentContent}
          onChange={onDocumentContentChange}
        />
      )}
    </div>
  );
};
