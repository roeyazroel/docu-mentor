"use client";

import { Button } from "@/components/ui/button";
import { Check, X } from "lucide-react";
import { SingleChange } from "../components/SingleChange";
import { GroupedChange } from "../types";
import {
  isGroupAccepted,
  isGroupDecided,
  isGroupRejected,
} from "../utils/diffUtils";

interface SideAnnotationsModeProps {
  groupedChanges: GroupedChange[];
  onAcceptGroup: (group: GroupedChange) => void;
  onRejectGroup: (group: GroupedChange) => void;
}

/**
 * Renders a group with controls in the side margin
 */
export function SideAnnotationsMode({
  groupedChanges,
  onAcceptGroup,
  onRejectGroup,
}: SideAnnotationsModeProps) {
  // Render controls for a change group in the side margin
  const renderSideControls = (group: GroupedChange) => {
    const decided = isGroupDecided(group);
    const accepted = isGroupAccepted(group);
    const rejected = isGroupRejected(group);

    // Don't render controls for unchanged text
    if (group.changes.length === 1 && group.changes[0].type === "unchanged") {
      return null;
    }

    // If already decided, show status indicator
    if (decided) {
      return (
        <div
          className={`flex items-center ${
            accepted
              ? "text-green-600 dark:text-green-400"
              : "text-red-600 dark:text-red-400"
          }`}
        >
          {accepted ? <Check className="h-4 w-4" /> : <X className="h-4 w-4" />}
        </div>
      );
    }

    // Otherwise, show accept/reject controls
    return (
      <div className="flex items-center space-x-1">
        <Button
          size="icon"
          variant="ghost"
          className="h-6 w-6 rounded-full bg-red-100 hover:bg-red-200 dark:bg-red-900/50 dark:hover:bg-red-800/50"
          onClick={() => onRejectGroup(group)}
          title="Reject this change"
        >
          <X className="h-3 w-3 text-red-600 dark:text-red-400" />
        </Button>
        <Button
          size="icon"
          variant="ghost"
          className="h-6 w-6 rounded-full bg-green-100 hover:bg-green-200 dark:bg-green-900/50 dark:hover:bg-green-800/50"
          onClick={() => onAcceptGroup(group)}
          title="Accept this change"
        >
          <Check className="h-3 w-3 text-green-600 dark:text-green-400" />
        </Button>
      </div>
    );
  };

  return (
    <>
      {groupedChanges.map((group, index) => {
        // Skip rendering control indicators for unchanged text
        const showControls = !(
          group.changes.length === 1 && group.changes[0].type === "unchanged"
        );

        return (
          <div
            key={`group-row-${index}`}
            className={`flex ${showControls ? "mb-1" : ""}`}
          >
            {/* Main content column */}
            <div className="flex-grow">
              {group.changes.map((change) => (
                <SingleChange key={change.id} change={change} />
              ))}
            </div>

            {/* Side annotation column - only render for changes */}
            {showControls && (
              <div className="flex-shrink-0 ml-4 border-l pl-2 min-w-[60px]">
                {renderSideControls(group)}
              </div>
            )}
          </div>
        );
      })}
    </>
  );
}
