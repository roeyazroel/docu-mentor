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

interface HighlightFloatingModeProps {
  groupedChanges: GroupedChange[];
  onAcceptGroup: (group: GroupedChange) => void;
  onRejectGroup: (group: GroupedChange) => void;
}

/**
 * Renders groups with floating controls that appear on hover
 */
export function HighlightFloatingMode({
  groupedChanges,
  onAcceptGroup,
  onRejectGroup,
}: HighlightFloatingModeProps) {
  return (
    <>
      {groupedChanges.map((group, index) => {
        // For single changes or unchanged text
        if (!group.isReplacement || group.changes.length === 1) {
          return group.changes.map((change) => (
            <SingleChange key={change.id} change={change} />
          ));
        }

        // Handle replacement pairs (deletion + addition)
        const deletion = group.changes.find((c) => c.type === "deletion");
        const addition = group.changes.find((c) => c.type === "addition");

        if (!deletion || !addition) {
          return group.changes.map((change) => (
            <SingleChange key={change.id} change={change} />
          ));
        }

        const decided = isGroupDecided(group);
        const accepted = isGroupAccepted(group);
        const rejected = isGroupRejected(group);

        // Container for the replacement with hover functionality
        let containerClass = "relative group inline-flex items-baseline mr-1";

        return (
          <span key={`group-${index}`} className={containerClass}>
            {/* Deletion part */}
            <span
              className={`bg-red-100 dark:bg-red-950/50 text-red-800 dark:text-red-300 line-through ${
                accepted ? "opacity-50" : ""
              }`}
            >
              {deletion.content}
            </span>

            {/* Addition part */}
            <span
              className={`bg-green-100 dark:bg-green-950/50 text-green-800 dark:text-green-300 ${
                rejected ? "opacity-50 line-through" : ""
              }`}
            >
              {addition.content}
            </span>

            {/* Floating controls that appear on hover */}
            {!decided && (
              <span className="absolute -bottom-7 left-1/2 transform -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity bg-white dark:bg-gray-800 border rounded-md py-1 px-2 shadow-md inline-flex gap-1 z-10">
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
              </span>
            )}

            {/* Status indicators */}
            {decided && (
              <span
                className={`inline-flex items-center ml-1 text-xs ${
                  accepted
                    ? "text-green-600 dark:text-green-400"
                    : "text-red-600 dark:text-red-400"
                }`}
              >
                {accepted ? (
                  <>
                    <Check className="h-2 w-2 mr-0.5" />
                    Changed
                  </>
                ) : (
                  <>
                    <X className="h-2 w-2 mr-0.5" />
                    Kept Original
                  </>
                )}
              </span>
            )}
          </span>
        );
      })}
    </>
  );
}
