import { Button } from "@/components/ui/button";
import { type UseAiDiffReturn } from "@/hooks/useAiDiff";
import { type Change } from "diff";
import { Check, X } from "lucide-react";

interface DiffGroupRendererProps {
  group: UseAiDiffReturn["groupedDiffLines"][0];
  groupIndex: number;
  isDecided: boolean;
  isAccepted: boolean;
  isRejected: boolean;
  onAccept: (groupIndex: number) => void;
  onReject: (groupIndex: number) => void;
}

/**
 * Renders a single group of diff lines (added, removed, unchanged, or annotation).
 * Handles display logic for different change types and accept/reject buttons.
 */
export function DiffGroupRenderer({
  group,
  groupIndex,
  isDecided,
  isAccepted,
  isRejected,
  onAccept,
  onReject,
}: DiffGroupRendererProps) {
  // Function to render line content with word/char highlighting
  const renderLineContent = (content: string, changes?: Change[]) => {
    if (!changes || group.type === "unchanged" || group.type === "annotation") {
      // For unchanged lines or annotations, just render the content
      // Also fallback if changes aren't provided for added/removed (shouldn't happen with word diff)
      return <>{content || "\n"}</>; // Render newline if content is empty
    }

    // Render with word-level highlighting
    return changes.map((change, index) => {
      let className = "";
      if (change.added) className = "bg-green-100 dark:bg-green-900/50";
      if (change.removed)
        className = "bg-red-100 dark:bg-red-900/50 line-through";
      return (
        <span key={index} className={className}>
          {change.value}
        </span>
      );
    });
  };

  // Determine base styling based on group type
  let baseClasses = "relative py-1 font-mono text-sm whitespace-pre-wrap";
  let indicatorText = "";
  let indicatorClass = "text-xs flex items-center";

  if (group.type === "added") {
    baseClasses += ` bg-green-50 text-green-800 border-l-2 border-green-500 pl-2 dark:bg-green-950 dark:text-green-300`;
    if (isRejected) baseClasses += " opacity-50 line-through"; // Style rejected additions
    if (isAccepted) {
      indicatorText = "Added";
      indicatorClass += " text-green-600 dark:text-green-400";
    }
    if (isRejected) {
      indicatorText = "Rejected";
      indicatorClass += " text-red-600 dark:text-red-400";
    }
  } else if (group.type === "removed") {
    baseClasses += ` bg-red-50 text-red-800 border-l-2 border-red-500 pl-2 dark:bg-red-950 dark:text-red-300`;
    if (isAccepted) baseClasses += " opacity-50 line-through"; // Style accepted removals (text is visually struck)
    if (isAccepted) {
      indicatorText = "Removed";
      indicatorClass += " text-green-600 dark:text-green-400";
    }
    if (isRejected) {
      indicatorText = "Kept";
      indicatorClass += " text-red-600 dark:text-red-400";
    } // Rejected removal means kept
  } else if (group.type === "annotation") {
    baseClasses += ` bg-blue-50 text-blue-800 border-l-2 border-blue-500 pl-2 dark:bg-blue-950 dark:text-blue-300 opacity-70`;
  } else {
    // Unchanged lines - less prominent border maybe?
    baseClasses += " border-l-2 border-transparent pl-2";
  }

  return (
    <div className={baseClasses}>
      {/* Render accept/reject buttons only for undecided changes */}
      {group.type !== "unchanged" &&
        group.type !== "annotation" &&
        !isDecided && (
          <div className="absolute right-2 top-1/2 -translate-y-1/2 flex gap-1 z-10">
            {/* Reject Button (X) */}
            <Button
              size="icon"
              variant="ghost"
              className="h-6 w-6 rounded-full bg-red-100 hover:bg-red-200 dark:bg-red-900 dark:hover:bg-red-800"
              onClick={() => onReject(group.groupIndex)}
              title={
                group.type === "added"
                  ? "Reject this addition"
                  : "Keep this text (reject removal)"
              }
            >
              <X className="h-3 w-3 text-red-600 dark:text-red-400" />
            </Button>
            {/* Accept Button (Check) */}
            <Button
              size="icon"
              variant="ghost"
              className="h-6 w-6 rounded-full bg-green-100 hover:bg-green-200 dark:bg-green-900 dark:hover:bg-green-800"
              onClick={() => onAccept(group.groupIndex)}
              title={
                group.type === "added"
                  ? "Accept this addition"
                  : "Remove this text (approve removal)"
              }
            >
              <Check className="h-3 w-3 text-green-600 dark:text-green-400" />
            </Button>
          </div>
        )}

      {/* Show status indicators if the group has been decided */}
      {isDecided && group.type !== "annotation" && (
        <div className="absolute right-2 top-1/2 -translate-y-1/2 z-10">
          <span className={indicatorClass}>
            {isAccepted ? (
              <Check className="h-3 w-3 mr-1" />
            ) : (
              <X className="h-3 w-3 mr-1" />
            )}
            {indicatorText}
          </span>
        </div>
      )}

      {/* Render each line within the group */}
      {group.content.map((line, lineIndex) => (
        <div key={lineIndex}>
          {/* Potential prefix based on primary line type? Or rely on highlighting? */}
          {/* {group.type === 'added' && "+"} */}
          {/* {group.type === 'removed' && "-"} */}
          {group.type === "annotation" && "@ "}
          {renderLineContent(line, group.changes)}
        </div>
      ))}
    </div>
  );
}
