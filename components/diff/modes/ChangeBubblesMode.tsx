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

interface ChangeBubblesModeProps {
  groupedChanges: GroupedChange[];
  onAcceptGroup: (group: GroupedChange) => void;
  onRejectGroup: (group: GroupedChange) => void;
}

/**
 * Renders a group with change bubbles
 */
export function ChangeBubblesMode({
  groupedChanges,
  onAcceptGroup,
  onRejectGroup,
}: ChangeBubblesModeProps) {
  return (
    <>
      {groupedChanges.map((group, index) => {
        // For unchanged text, just render it normally
        if (
          group.changes.length === 1 &&
          group.changes[0].type === "unchanged"
        ) {
          return group.changes.map((change) => (
            <SingleChange key={change.id} change={change} />
          ));
        }

        const decided = isGroupDecided(group);
        const accepted = isGroupAccepted(group);
        const rejected = isGroupRejected(group);

        // For change bubbles, we always wrap the content
        return (
          <span
            key={`bubble-${index}`}
            className="bg-gray-100 dark:bg-gray-800 rounded-md px-1 py-0.5 border border-gray-200 dark:border-gray-700 inline-flex items-center mr-1"
          >
            <span>
              {group.changes.map((change, i) => {
                if (change.type === "deletion") {
                  return (
                    <span
                      key={`del-${i}`}
                      className={`bg-red-100 dark:bg-red-950/50 text-red-800 dark:text-red-300 line-through ${
                        accepted ? "opacity-50" : ""
                      }`}
                    >
                      {change.content}
                    </span>
                  );
                } else if (change.type === "addition") {
                  return (
                    <span
                      key={`add-${i}`}
                      className={`bg-green-100 dark:bg-green-950/50 text-green-800 dark:text-green-300 ${
                        rejected ? "opacity-50 line-through" : ""
                      }`}
                    >
                      {change.content}
                    </span>
                  );
                }
                return null;
              })}
            </span>

            {/* Controls or status */}
            {!decided ? (
              <span className="ml-2 flex">
                <Button
                  size="icon"
                  variant="ghost"
                  className="h-4 w-4 rounded-full bg-red-100 hover:bg-red-200"
                  onClick={() => onRejectGroup(group)}
                >
                  <X className="h-2 w-2 text-red-600" />
                </Button>
                <Button
                  size="icon"
                  variant="ghost"
                  className="h-4 w-4 ml-1 rounded-full bg-green-100 hover:bg-green-200"
                  onClick={() => onAcceptGroup(group)}
                >
                  <Check className="h-2 w-2 text-green-600" />
                </Button>
              </span>
            ) : (
              <span
                className={`ml-2 ${
                  accepted ? "text-green-600" : "text-red-600"
                }`}
              >
                {accepted ? (
                  <Check className="h-3 w-3" />
                ) : (
                  <X className="h-3 w-3" />
                )}
              </span>
            )}
          </span>
        );
      })}
    </>
  );
}
