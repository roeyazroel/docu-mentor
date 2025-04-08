"use client";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAiDiff, type UseAiDiffProps } from "@/hooks/useAiDiff";
import { Check, X } from "lucide-react";
import { useState } from "react";
import { DiffViewTab } from "./diff/DiffViewTab";
import { MergeConflictTab } from "./diff/MergeConflictTab";

interface AiSuggestionDiffProps {
  originalText: string;
  suggestedText: string;
  mergeConflictText?: string;
  onAcceptAll: () => void;
  onRejectAll: () => void;
  onFinalizeChanges: () => void;
  diffStrategy?: UseAiDiffProps["diffStrategy"];

  // TODO: Add prop to receive the Set of accepted hunk indices from useAiDiff
  // This will be needed by the parent page to call applyPartialPatch.
  // Example: onAcceptedHunksChange?: (acceptedHunks: Set<number>) => void;
}

/**
 * Main component to display AI suggestions using different views (Diff, Merge Conflict).
 * Uses the useAiDiff hook for state management and diff logic.
 */
export default function AiSuggestionDiff({
  originalText,
  suggestedText,
  mergeConflictText,
  onAcceptAll,
  onRejectAll,
  onFinalizeChanges,
  diffStrategy = "words", // Default to word diff
}: AiSuggestionDiffProps) {
  const [activeTab, setActiveTab] = useState<string>("diff");

  const {
    groupedDiffLines,
    allChangesDecided,
    acceptedGroups: acceptedHunks,
    rejectedGroups: rejectedHunks,
    handleAcceptGroup: handleAcceptHunk,
    handleRejectGroup: handleRejectHunk,
    hasChanges,
  } = useAiDiff({ originalText, suggestedText, diffStrategy });

  return (
    <Card className="p-4 shadow-md border border-border">
      <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-4">
        <TabsList>
          <TabsTrigger value="diff">Diff View</TabsTrigger>
          <TabsTrigger value="merge">Merge Conflict</TabsTrigger>
        </TabsList>

        <TabsContent value="diff" className="mt-4">
          {/* Informational Header */}
          <div className="mb-4 p-3 bg-blue-50 text-blue-800 rounded-md dark:bg-blue-900/30 dark:text-blue-200 flex justify-between items-center">
            <p className="text-sm">
              Review the suggested changes. Accept or reject individual blocks.
            </p>
            {/* Show Accept/Reject All only if changes exist and not all are decided */}
            {hasChanges && !allChangesDecided && (
              <div className="flex gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  className="gap-1"
                  onClick={onRejectAll}
                >
                  <X className="h-3 w-3" />
                  Reject All
                </Button>
                <Button size="sm" className="gap-1" onClick={onAcceptAll}>
                  <Check className="h-3 w-3" />
                  Accept All
                </Button>
              </div>
            )}
            {/* Show Finalize button only if changes exist and all *are* decided */}
            {hasChanges && allChangesDecided && (
              <Button size="sm" className="gap-1" onClick={onFinalizeChanges}>
                <Check className="h-3 w-3" />
                Finalize Changes
              </Button>
            )}
          </div>

          {/* Diff View Content */}
          <DiffViewTab
            groupedDiffLines={groupedDiffLines}
            acceptedGroups={acceptedHunks}
            rejectedGroups={rejectedHunks}
            handleAcceptGroup={handleAcceptHunk}
            handleRejectGroup={handleRejectHunk}
            hasChanges={hasChanges}
          />
        </TabsContent>

        <TabsContent value="merge" className="mt-4">
          <MergeConflictTab mergeConflictText={mergeConflictText} />
        </TabsContent>
      </Tabs>
    </Card>
  );
}
