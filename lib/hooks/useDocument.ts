import { useCallback, useEffect, useRef, useState } from "react";

export type SaveStatus = "saved" | "saving" | "unsaved";

/**
 * Hook for managing document state and auto-save functionality
 * Extracted from app/editor/page.tsx to separate concerns
 */
export function useDocument(
  activeFileId: string | null,
  documentContent: string,
  documentTitle: string,
  saveDocument: () => boolean,
  hasUnsavedChanges: () => boolean
) {
  // Document save state
  const [saveStatus, setSaveStatus] = useState<SaveStatus>("saved");
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Auto-save functionality
  useEffect(() => {
    if (!activeFileId) return;

    // Clear any existing timeout
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }

    // Set status to unsaved only if there are actual changes
    if (saveStatus === "saved" && hasUnsavedChanges()) {
      setSaveStatus("unsaved");
    }

    // Set a timeout to save after 1 second of inactivity
    saveTimeoutRef.current = setTimeout(() => {
      // Only trigger save if there are changes
      if (hasUnsavedChanges()) {
        setSaveStatus("saving");

        // Simulate a short delay for the save operation
        setTimeout(() => {
          const changesMade = saveDocument();
          setSaveStatus("saved");
          console.log(changesMade ? "Changes saved" : "No changes to save");
        }, 300);
      }
    }, 1000);

    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
    };
  }, [
    documentContent,
    documentTitle,
    activeFileId,
    saveDocument,
    hasUnsavedChanges,
    saveStatus,
  ]);

  // Handle manual save request
  const handleSave = useCallback(() => {
    if (!activeFileId) return;

    if (hasUnsavedChanges()) {
      setSaveStatus("saving");

      // Simulate a short delay for the save operation
      setTimeout(() => {
        const changesMade = saveDocument();
        setSaveStatus("saved");
        return changesMade;
      }, 300);
    }
    return false;
  }, [activeFileId, hasUnsavedChanges, saveDocument]);

  // Warn user about unsaved changes when leaving the page
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (saveStatus !== "saved") {
        // Standard way to show a confirmation dialog when closing the page
        e.preventDefault();
        e.returnValue = "";
        return "";
      }
    };

    window.addEventListener("beforeunload", handleBeforeUnload);

    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, [saveStatus]);

  return {
    saveStatus,
    setSaveStatus,
    handleSave,
  };
}
