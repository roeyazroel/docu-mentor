"use client";

import { Button } from "@/components/ui/button";
import documentSchema from "@/lib/prosemirror/schema";
import {
  applyChanges,
  htmlToProseMirror,
  proseMirrorToText,
  textToProseMirror,
} from "@/lib/prosemirror/utils";
import { ArrowDown, ArrowUp, Check, X } from "lucide-react";
import { EditorState } from "prosemirror-state";
import { EditorView } from "prosemirror-view";
import { useEffect, useRef, useState } from "react";
import ProseMirrorEditor from "./ProseMirrorEditor";

interface SideBySideEditorProps {
  originalText: string;
  suggestedText: string;
  onAcceptAll: () => void;
  onRejectAll: () => void;
  onFinalizeChanges: (newText: string) => void;
}

/**
 * Side-by-side editor component for comparing original and suggested text
 * with synchronized scrolling and interactive change controls
 */
export default function SideBySideEditor({
  originalText,
  suggestedText,
  onAcceptAll,
  onRejectAll,
  onFinalizeChanges,
}: SideBySideEditorProps) {
  const leftEditorRef = useRef<EditorView | null>(null);
  const rightEditorRef = useRef<EditorView | null>(null);
  const [acceptedChanges, setAcceptedChanges] = useState<Set<string>>(
    new Set()
  );
  const [rejectedChanges, setRejectedChanges] = useState<Set<string>>(
    new Set()
  );
  const [changesCount, setChangesCount] = useState<number>(0);
  const [currentChangeIndex, setCurrentChangeIndex] = useState<number>(-1);
  const scrollSyncInProgress = useRef(false);

  // Sync scrolling between the two editors
  const setupScrollSync = () => {
    const leftEditor = leftEditorRef.current?.dom;
    const rightEditor = rightEditorRef.current?.dom;

    if (!leftEditor || !rightEditor) return;

    const handleScroll = (event: Event) => {
      if (scrollSyncInProgress.current) return;
      scrollSyncInProgress.current = true;

      const source = event.target as HTMLElement;
      const target = source === leftEditor ? rightEditor : leftEditor;

      const sourceScrollTop = source.scrollTop;
      const sourceHeight = source.scrollHeight;
      const targetHeight = target.scrollHeight;

      // Calculate proportional scroll position
      const scrollRatio = sourceScrollTop / sourceHeight;
      const targetScrollTop = scrollRatio * targetHeight;

      target.scrollTop = targetScrollTop;

      setTimeout(() => {
        scrollSyncInProgress.current = false;
      }, 50);
    };

    leftEditor.addEventListener("scroll", handleScroll);
    rightEditor.addEventListener("scroll", handleScroll);

    return () => {
      leftEditor.removeEventListener("scroll", handleScroll);
      rightEditor.removeEventListener("scroll", handleScroll);
    };
  };

  // Setup scroll synchronization when the editors are created
  useEffect(() => {
    const cleanupScrollSync = setupScrollSync();
    return cleanupScrollSync;
  }, []);

  // Demo function to create sample text with visible changes
  const createDemoText = () => {
    // For the original document, create plain text
    const original = textToProseMirror(`
      Document Editing Features

      This document demonstrates the change tracking features.

      The following list shows the main features:

      • Real-time collaborative editing
      • Track changes functionality
      • Version history
      • Comment threads
    `);

    // For the changed document, create content with marks
    // We'll do this by recreating the document with marked fragments
    const schema = documentSchema;

    // Create paragraphs with marked content
    const heading = schema.node("paragraph", {}, [
      schema.text("Enhanced Document Editing")
    ]);

    const para1 = schema.node("paragraph", {}, [
      schema.text("This document demonstrates the "),
      // Apply addition mark
      schema.text("powerful", [
        schema.mark("addition", { id: "add-1" })
      ]),
      schema.text(" change tracking features.")
    ]);

    const para2 = schema.node("paragraph", {}, [
      schema.text("The following list shows the main features:")
    ]);

    // Create the list with changes
    const item1 = schema.node("paragraph", {}, [
      schema.text("• Real-time collaborative editing")
    ]);

    const item2 = schema.node("paragraph", {}, [
      schema.text("• "),
      // Apply deletion mark
      schema.text("Track changes functionality", [
        schema.mark("deletion", { id: "del-1" })
      ]),
      // Apply addition mark for replacement
      schema.text("Advanced change tracking with side-by-side view", [
        schema.mark("addition", { id: "add-2" })
      ])
    ]);

    const item3 = schema.node("paragraph", {}, [
      schema.text("• Version history")
    ]);

    const item4 = schema.node("paragraph", {}, [
      schema.text("• "),
      // Apply deletion mark
      schema.text("Comment threads", [
        schema.mark("deletion", { id: "del-2" })
      ])
    ]);

    const item5 = schema.node("paragraph", {}, [
      schema.text("• "),
      // Apply addition mark
      schema.text("AI-powered suggestions", [
        schema.mark("addition", { id: "add-3" })
      ])
    ]);

    // Create the changed document
    const changed = schema.node("doc", {}, [
      heading, para1, para2, item1, item2, item3, item4, item5
    ]);

    return { original, changed };
  };

  // Calculate changes and initialize change tracking state
  useEffect(() => {
    try {
      // Use our demo function to create test content with visible changes
      const { original, changed } = createDemoText();

      if (leftEditorRef.current) {
        const newState = EditorState.create({
          schema: documentSchema,
          doc: original,
          plugins: leftEditorRef.current.state.plugins,
        });
        leftEditorRef.current.updateState(newState);
      }

      if (rightEditorRef.current) {
        const newState = EditorState.create({
          schema: documentSchema,
          doc: changed,
          plugins: rightEditorRef.current.state.plugins,
        });
        rightEditorRef.current.updateState(newState);
      }

      // Set fake change count
      setChangesCount(4);
    } catch (error) {
      console.error("Error setting up demo:", error);
    }
  }, []);

  // Handle accepting a change
  const handleAcceptChange = (changeId: string) => {
    const newAccepted = new Set(acceptedChanges);
    newAccepted.add(changeId);
    setAcceptedChanges(newAccepted);

    // Also remove from rejected if it was there
    if (rejectedChanges.has(changeId)) {
      const newRejected = new Set(rejectedChanges);
      newRejected.delete(changeId);
      setRejectedChanges(newRejected);
    }
  };

  // Handle rejecting a change
  const handleRejectChange = (changeId: string) => {
    const newRejected = new Set(rejectedChanges);
    newRejected.add(changeId);
    setRejectedChanges(newRejected);

    // Also remove from accepted if it was there
    if (acceptedChanges.has(changeId)) {
      const newAccepted = new Set(acceptedChanges);
      newAccepted.delete(changeId);
      setAcceptedChanges(newAccepted);
    }
  };

  // Handle accepting all changes
  const handleAcceptAll = () => {
    onAcceptAll();
  };

  // Handle rejecting all changes
  const handleRejectAll = () => {
    onRejectAll();
  };

  // Handle finalizing changes
  const handleFinalizeChanges = () => {
    try {
      const originalDoc = textToProseMirror(originalText);

      // Apply accepted changes to original document
      const acceptedChangesArray = Array.from(acceptedChanges);
      const docWithChanges = applyChanges(
        originalDoc,
        acceptedChangesArray,
        true
      );

      // Convert back to text
      const finalText = proseMirrorToText(docWithChanges);

      // Pass the final text back to the parent component
      onFinalizeChanges(finalText);
    } catch (error) {
      console.error("Error finalizing changes:", error);
    }
  };

  // Navigate to the next change
  const goToNextChange = () => {
    if (currentChangeIndex < changesCount - 1) {
      setCurrentChangeIndex(currentChangeIndex + 1);
      // In a real implementation, this would scroll to the change in the editor
    }
  };

  // Navigate to the previous change
  const goToPreviousChange = () => {
    if (currentChangeIndex > 0) {
      setCurrentChangeIndex(currentChangeIndex - 1);
      // In a real implementation, this would scroll to the change in the editor
    }
  };

  // Change navigation progress indicator
  const changeProgress =
    changesCount > 0
      ? `${currentChangeIndex + 1}/${changesCount}`
      : "No changes";

  // Calculate if all changes have been reviewed
  const allChangesReviewed =
    acceptedChanges.size + rejectedChanges.size === changesCount;

  return (
    <div className="flex flex-col h-full">
      {/* Toolbar */}
      <div className="flex justify-between items-center p-2 bg-muted mb-2">
        <div className="flex items-center space-x-2">
          <Button
            size="sm"
            variant="outline"
            onClick={goToPreviousChange}
            disabled={currentChangeIndex <= 0}
          >
            <ArrowUp className="h-4 w-4" />
          </Button>
          <span className="text-sm">{changeProgress}</span>
          <Button
            size="sm"
            variant="outline"
            onClick={goToNextChange}
            disabled={currentChangeIndex >= changesCount - 1}
          >
            <ArrowDown className="h-4 w-4" />
          </Button>
        </div>

        <div className="flex items-center space-x-2">
          <Button
            size="sm"
            variant="outline"
            className="gap-1"
            onClick={handleRejectAll}
          >
            <X className="h-4 w-4" />
            Reject All
          </Button>
          <Button size="sm" className="gap-1" onClick={handleAcceptAll}>
            <Check className="h-4 w-4" />
            Accept All
          </Button>
          {allChangesReviewed && (
            <Button
              size="sm"
              variant="default"
              className="gap-1"
              onClick={handleFinalizeChanges}
            >
              <Check className="h-4 w-4" />
              Finalize Changes
            </Button>
          )}
        </div>
      </div>

      {/* Editors Container */}
      <div className="flex-1 flex overflow-hidden">
        {/* Original Document */}
        <div className="w-1/2 pr-2 flex flex-col">
          <div className="p-1 bg-muted text-center text-sm font-medium">
            Original
          </div>
          <div className="flex-1 border rounded overflow-hidden">
            <ProseMirrorEditor
              content={originalText}
              readOnly
              className="h-full overflow-auto p-4"
              editorRef={leftEditorRef}
            />
          </div>
        </div>

        {/* Suggested Document */}
        <div className="w-1/2 pl-2 flex flex-col">
          <div className="p-1 bg-muted text-center text-sm font-medium">
            Suggested
          </div>
          <div className="flex-1 border rounded overflow-hidden">
            <ProseMirrorEditor
              content={suggestedText}
              readOnly
              className="h-full overflow-auto p-4"
              editorRef={rightEditorRef}
              decorationClasses={{
                ".addition": "bg-green-200 dark:bg-green-800 font-bold",
                ".deletion":
                  "bg-red-200 dark:bg-red-800 line-through opacity-75",
                ".modification": "bg-yellow-200 dark:bg-yellow-800",
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
