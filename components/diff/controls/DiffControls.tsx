"use client";

import { Button } from "@/components/ui/button";
import { Check, X } from "lucide-react";

interface DiffControlsProps {
  hasChanges: boolean;
  allChangesDecided: boolean;
  onAcceptAll: () => void;
  onRejectAll: () => void;
  onFinalize: () => void;
}

/**
 * Controls for accepting/rejecting all changes
 */
export function DiffControls({
  hasChanges,
  allChangesDecided,
  onAcceptAll,
  onRejectAll,
  onFinalize,
}: DiffControlsProps) {
  return (
    <div className="mb-4 p-3 bg-blue-50 text-blue-800 rounded-md dark:bg-blue-900/30 dark:text-blue-200 flex justify-between items-center">
      <p className="text-sm">
        Review suggested changes inline. Accept or reject individual changes.
      </p>
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
      {hasChanges && allChangesDecided && (
        <Button size="sm" className="gap-1" onClick={onFinalize}>
          <Check className="h-3 w-3" />
          Finalize Changes
        </Button>
      )}
    </div>
  );
}
