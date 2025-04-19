"use client";

import { Button } from "@/components/ui/button";
import { Check, HelpCircle, X } from "lucide-react";
import { SingleChange } from "../components/SingleChange";
import { GroupedChange } from "../types";
import {
  isGroupAccepted,
  isGroupDecided,
  isGroupRejected,
} from "../utils/diffUtils";

interface TooltipModeProps {
  groupedChanges: GroupedChange[];
  onAcceptGroup: (group: GroupedChange) => void;
  onRejectGroup: (group: GroupedChange) => void;
}

/**
 * Renders a group with tooltip controls
 */
export function TooltipMode({
  groupedChanges,
  onAcceptGroup,
  onRejectGroup,
}: TooltipModeProps) {
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

        return (
          <span
            key={`group-${index}`}
            className="relative group cursor-pointer mr-1"
          >
            <span
              className={`bg-red-100 dark:bg-red-950/50 text-red-800 dark:text-red-300 line-through ${
                accepted ? "opacity-50" : ""
              }`}
            >
              {deletion.content}
            </span>

            <span
              className={`bg-green-100 dark:bg-green-950/50 text-green-800 dark:text-green-300 ${
                rejected ? "opacity-50 line-through" : ""
              }`}
            >
              {addition.content}
            </span>

            {!decided && (
              <>
                <HelpCircle className="inline ml-0.5 h-3 w-3 text-gray-400" />
                <span className="absolute -bottom-16 left-1/2 transform -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity bg-white dark:bg-gray-800 border rounded-md py-2 px-3 shadow-lg min-w-[150px] z-10">
                  <div className="text-sm mb-2">Accept this change?</div>
                  <div className="flex justify-between">
                    <Button
                      size="sm"
                      variant="destructive"
                      className="h-7 px-2 mr-2"
                      onClick={() => onRejectGroup(group)}
                    >
                      <X className="h-3 w-3 mr-1" />
                      Reject
                    </Button>
                    <Button
                      size="sm"
                      variant="default"
                      className="h-7 px-2"
                      onClick={() => onAcceptGroup(group)}
                    >
                      <Check className="h-3 w-3 mr-1" />
                      Accept
                    </Button>
                  </div>
                </span>
              </>
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
