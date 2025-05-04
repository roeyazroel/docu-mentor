"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { DiffControls } from "./controls/DiffControls";
import { ModeSelector } from "./controls/ModeSelector";
import { ChangeBubblesMode } from "./modes/ChangeBubblesMode";
import { HighlightFloatingMode } from "./modes/HighlightFloatingMode";
import { SideAnnotationsMode } from "./modes/SideAnnotationsMode";
import { TooltipMode } from "./modes/TooltipMode";
import { WordBoundaryMode } from "./modes/WordBoundaryMode";
import {
  DEFAULT_CONTROL_MODE,
  DiffControlMode,
  GroupedChange,
  InlineDiffRendererProps,
  STORAGE_KEY,
} from "./types";
import { groupDiffChanges } from "./utils/diffUtils";

/**
 * Renders a GitHub-like inline diff view for comparing text changes
 * with accept/reject controls for each change.
 */
export function InlineDiffRenderer({
  diffChanges,
  onAccept,
  onReject,
  onAcceptAll,
  onRejectAll,
  onFinalize,
  hasChanges,
  allChangesDecided,
  controlMode,
}: InlineDiffRendererProps) {
  // Get the stored mode from local storage or use default
  const [localMode, setLocalMode] = useState<DiffControlMode>(() => {
    // Default to sideAnnotations or the provided prop
    if (typeof window !== "undefined") {
      const storedMode = localStorage.getItem(
        STORAGE_KEY
      ) as DiffControlMode | null;
      return storedMode || controlMode || DEFAULT_CONTROL_MODE;
    }
    return controlMode || DEFAULT_CONTROL_MODE;
  });

  // Use either the prop-provided mode or the local state
  const activeMode = controlMode || localMode;

  // Update local storage when mode changes
  useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem(STORAGE_KEY, localMode);
    }
  }, [localMode]);

  // Handle changing the display mode
  const handleModeChange = useCallback((newMode: DiffControlMode) => {
    setLocalMode(newMode);
  }, []);

  // Group related changes (like deletion-addition pairs) together
  const groupedChanges = useMemo(() => {
    return groupDiffChanges(diffChanges);
  }, [diffChanges]);

  // Handle accepting a group of changes
  const handleAcceptGroup = useCallback(
    (group: GroupedChange) => {
      group.ids.forEach((id) => onAccept(id));
    },
    [onAccept]
  );

  // Handle rejecting a group of changes
  const handleRejectGroup = useCallback(
    (group: GroupedChange) => {
      group.ids.forEach((id) => onReject(id));
    },
    [onReject]
  );

  // If no changes, show a message
  if (!hasChanges) {
    return (
      <div className="p-4 text-center text-muted-foreground">
        No changes detected. The suggested text is identical to the original.
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Controls for accepting/rejecting all changes */}
      <DiffControls
        hasChanges={hasChanges}
        allChangesDecided={allChangesDecided}
        onAcceptAll={onAcceptAll}
        onRejectAll={onRejectAll}
        onFinalize={onFinalize}
      />
      <ModeSelector activeMode={activeMode} onModeChange={handleModeChange} />
      {/* Render the content based on the selected control mode */}
      <div className="font-mono text-sm whitespace-pre-wrap p-4 border rounded-md bg-background">
        {/* Highlight Floating Mode */}
        {activeMode === "highlightFloating" && (
          <HighlightFloatingMode
            groupedChanges={groupedChanges}
            onAcceptGroup={handleAcceptGroup}
            onRejectGroup={handleRejectGroup}
          />
        )}

        {/* Word Boundary Mode */}
        {activeMode === "wordBoundary" && (
          <WordBoundaryMode
            groupedChanges={groupedChanges}
            onAcceptGroup={handleAcceptGroup}
            onRejectGroup={handleRejectGroup}
            onAccept={onAccept}
            onReject={onReject}
          />
        )}

        {/* Side Annotations Mode */}
        {activeMode === "sideAnnotations" && (
          <SideAnnotationsMode
            groupedChanges={groupedChanges}
            onAcceptGroup={handleAcceptGroup}
            onRejectGroup={handleRejectGroup}
          />
        )}

        {/* Tooltip Mode */}
        {activeMode === "tooltip" && (
          <TooltipMode
            groupedChanges={groupedChanges}
            onAcceptGroup={handleAcceptGroup}
            onRejectGroup={handleRejectGroup}
          />
        )}

        {/* Change Bubbles Mode */}
        {activeMode === "changeBubbles" && (
          <ChangeBubblesMode
            groupedChanges={groupedChanges}
            onAcceptGroup={handleAcceptGroup}
            onRejectGroup={handleRejectGroup}
          />
        )}
      </div>

      {/* Mode Selector below text area */}
    </div>
  );
}
