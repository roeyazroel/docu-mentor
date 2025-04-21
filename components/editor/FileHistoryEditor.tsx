import { useToast } from "@/components/ui/use-toast";
import React, { useState } from "react";
import { EditorContentArea } from "./EditorContentArea";
import FileHistoryPanel from "./FileHistoryPanel";

interface FileHistoryEditorProps {
  activeFileId: string | null;
  documentContent: string;
  onDocumentContentChange: (content: string) => void;
  organizationId: string;
  sessionId: string;
  fileVersions: any[]; // Use the fileVersions from useFileSystem
  currentVersion?: number;
  revertToVersion: (fileId: string, version: number) => Promise<void>; // Use the revertToVersion from useFileSystem
  showDiff: boolean;
  aiSuggestion: string;
  onAcceptAll: () => void;
  onRejectAll: () => void;
  onFinalizeChanges: () => void;
  showHistory: boolean; // Pass the history toggle state as a prop
}

export const FileHistoryEditor: React.FC<FileHistoryEditorProps> = ({
  activeFileId,
  documentContent,
  onDocumentContentChange,
  fileVersions,
  currentVersion,
  revertToVersion,
  showDiff,
  aiSuggestion,
  onAcceptAll,
  onRejectAll,
  onFinalizeChanges,
  showHistory,
}) => {
  const [isReverting, setIsReverting] = useState(false);
  const { toast } = useToast();

  // Handle revert
  const handleRevert = async (version: number) => {
    if (!activeFileId) return;

    try {
      setIsReverting(true);
      await revertToVersion(activeFileId, version);

      // Show success toast
      toast({
        title: "Version restored",
        description: `Successfully reverted to version ${version}`,
        duration: 3000,
      });
    } catch (error) {
      // Show error toast
      toast({
        title: "Failed to revert",
        description: error instanceof Error ? error.message : "Unknown error",
        variant: "destructive",
        duration: 5000,
      });
      console.error("Revert error:", error);
    } finally {
      setIsReverting(false);
    }
  };

  return (
    <div className="flex flex-1 overflow-hidden">
      {/* Main content area */}
      <div className={`flex-1 ${showHistory ? "w-2/3" : "w-full"}`}>
        <EditorContentArea
          showDiff={showDiff}
          documentContent={documentContent}
          onDocumentContentChange={onDocumentContentChange}
          aiSuggestion={aiSuggestion}
          onAcceptAll={onAcceptAll}
          onRejectAll={onRejectAll}
          onFinalizeChanges={onFinalizeChanges}
          activeFileId={activeFileId}
        />
      </div>

      {/* File history panel */}
      {showHistory && activeFileId && (
        <div className="border-l w-1/3 overflow-auto">
          {isReverting ? (
            <div className="flex items-center justify-center h-20">
              <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent" />
            </div>
          ) : (
            <FileHistoryPanel
              fileId={activeFileId}
              versions={fileVersions}
              onRevert={handleRevert}
              currentVersion={currentVersion}
            />
          )}
        </div>
      )}
    </div>
  );
};
