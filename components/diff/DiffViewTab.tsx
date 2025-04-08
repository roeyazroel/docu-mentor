import { type UseAiDiffReturn } from "@/hooks/useAiDiff";
import { DiffGroupRenderer } from "./DiffGroupRenderer";

interface DiffViewTabProps {
  groupedDiffLines: UseAiDiffReturn["groupedDiffLines"];
  acceptedGroups: Set<number>;
  rejectedGroups: Set<number>;
  handleAcceptGroup: (index: number) => void;
  handleRejectGroup: (index: number) => void;
  hasChanges: boolean;
}

/**
 * Renders the main diff visualization tab,
 * iterating through grouped diff lines and using DiffGroupRenderer.
 */
export function DiffViewTab({
  groupedDiffLines,
  acceptedGroups,
  rejectedGroups,
  handleAcceptGroup,
  handleRejectGroup,
  hasChanges,
}: DiffViewTabProps) {
  // Helper to check if a group/hunk is decided
  const isHunkDecided = (hunkIndex: number): boolean => {
    return acceptedGroups.has(hunkIndex) || rejectedGroups.has(hunkIndex);
  };

  // Helper to check if a group/hunk is accepted
  const isHunkAccepted = (hunkIndex: number): boolean => {
    return acceptedGroups.has(hunkIndex);
  };

  // Helper to check if a group/hunk is rejected
  const isHunkRejected = (hunkIndex: number): boolean => {
    return rejectedGroups.has(hunkIndex);
  };

  return (
    <div className="space-y-1">
      {" "}
      {/* Reduce spacing between groups */}
      {!hasChanges && (
        <div className="text-center text-muted-foreground py-4">
          No changes detected. The suggested text is identical to the original.
        </div>
      )}
      {groupedDiffLines.map((group) => (
        <DiffGroupRenderer
          key={group.groupIndex} // Use the unique group index (assumed to be hunk index)
          group={group}
          groupIndex={group.groupIndex}
          isDecided={isHunkDecided(group.groupIndex)}
          isAccepted={isHunkAccepted(group.groupIndex)}
          isRejected={isHunkRejected(group.groupIndex)}
          onAccept={handleAcceptGroup} // Pass down the handler
          onReject={handleRejectGroup} // Pass down the handler
        />
      ))}
    </div>
  );
}
