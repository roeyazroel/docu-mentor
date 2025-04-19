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

interface WordBoundaryModeProps {
  groupedChanges: GroupedChange[];
  onAcceptGroup: (group: GroupedChange) => void;
  onRejectGroup: (group: GroupedChange) => void;
  onAccept: (id: number) => void;
  onReject: (id: number) => void;
}

/**
 * Renders a group with controls at the word boundaries
 */
export function WordBoundaryMode({
  groupedChanges,
  onAcceptGroup,
  onRejectGroup,
  onAccept,
  onReject,
}: WordBoundaryModeProps) {
  return (
    <>
      {groupedChanges.map((group, index) => {
        // For single changes or unchanged text
        if (!group.isReplacement || group.changes.length === 1) {
          if (group.changes[0].type === "unchanged") {
            return group.changes.map((change) => (
              <SingleChange key={change.id} change={change} />
            ));
          }

          // Handle single addition or deletion
          const change = group.changes[0];
          const decided =
            change.status === "accepted" || change.status === "rejected";
          const accepted = change.status === "accepted";

          return (
            <span
              key={`single-${index}`}
              className="relative inline-flex items-baseline"
            >
              {/* For deletion */}
              {change.type === "deletion" && (
                <>
                  <span
                    className={`bg-red-100 dark:bg-red-950/50 text-red-800 dark:text-red-300 line-through ${
                      accepted ? "opacity-50" : ""
                    }`}
                  >
                    {change.content}
                  </span>

                  {!decided && (
                    <Button
                      size="icon"
                      variant="ghost"
                      className="absolute -top-1 -left-2 h-4 w-4 rounded-full bg-red-100 hover:bg-red-200"
                      onClick={() => onReject(change.id)}
                    >
                      <X className="h-2 w-2 text-red-600" />
                    </Button>
                  )}
                </>
              )}

              {/* For addition */}
              {change.type === "addition" && (
                <>
                  <span
                    className={`bg-green-100 dark:bg-green-950/50 text-green-800 dark:text-green-300 ${
                      !accepted ? "opacity-50 line-through" : ""
                    }`}
                  >
                    {change.content}
                  </span>

                  {!decided && (
                    <Button
                      size="icon"
                      variant="ghost"
                      className="absolute -top-1 -right-2 h-4 w-4 rounded-full bg-green-100 hover:bg-green-200"
                      onClick={() => onAccept(change.id)}
                    >
                      <Check className="h-2 w-2 text-green-600" />
                    </Button>
                  )}
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
                  {change.type === "addition" ? (
                    accepted ? (
                      <>
                        <Check className="h-2 w-2 mr-0.5" />
                        Added
                      </>
                    ) : (
                      <>
                        <X className="h-2 w-2 mr-0.5" />
                        Rejected
                      </>
                    )
                  ) : accepted ? (
                    <>
                      <Check className="h-2 w-2 mr-0.5" />
                      Removed
                    </>
                  ) : (
                    <>
                      <X className="h-2 w-2 mr-0.5" />
                      Kept
                    </>
                  )}
                </span>
              )}
            </span>
          );
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
            className="relative inline-flex items-baseline mr-1"
          >
            <span className="relative">
              <span
                className={`bg-red-100 dark:bg-red-950/50 text-red-800 dark:text-red-300 line-through ${
                  accepted ? "opacity-50" : ""
                }`}
              >
                {deletion.content}
              </span>

              {!decided && (
                <Button
                  size="icon"
                  variant="ghost"
                  className="absolute -top-1 -left-2 h-4 w-4 rounded-full bg-red-100 hover:bg-red-200"
                  onClick={() => onRejectGroup(group)}
                >
                  <X className="h-2 w-2 text-red-600" />
                </Button>
              )}
            </span>

            <span className="relative ml-1">
              <span
                className={`bg-green-100 dark:bg-green-950/50 text-green-800 dark:text-green-300 ${
                  rejected ? "opacity-50 line-through" : ""
                }`}
              >
                {addition.content}
              </span>

              {!decided && (
                <Button
                  size="icon"
                  variant="ghost"
                  className="absolute -top-1 -right-2 h-4 w-4 rounded-full bg-green-100 hover:bg-green-200"
                  onClick={() => onAcceptGroup(group)}
                >
                  <Check className="h-2 w-2 text-green-600" />
                </Button>
              )}
            </span>

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
