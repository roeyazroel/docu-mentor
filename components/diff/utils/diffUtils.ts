import { DiffChange, GroupedChange } from "../types";

/**
 * Groups related changes (like deletion-addition pairs) together
 */
export const groupDiffChanges = (
  diffChanges: DiffChange[]
): GroupedChange[] => {
  const groups: GroupedChange[] = [];
  let i = 0;

  while (i < diffChanges.length) {
    const current = diffChanges[i];

    // If this is an unchanged section, add it as a standalone group
    if (current.type === "unchanged") {
      groups.push({
        ids: [current.id],
        changes: [current],
        isReplacement: false,
      });
      i++;
      continue;
    }

    // Check if we have a deletion followed by addition (word replacement)
    if (
      i + 1 < diffChanges.length &&
      current.type === "deletion" &&
      diffChanges[i + 1].type === "addition"
    ) {
      // Group them as a replacement pair
      groups.push({
        ids: [current.id, diffChanges[i + 1].id],
        changes: [current, diffChanges[i + 1]],
        isReplacement: true,
      });
      i += 2;
    } else {
      // Just a standalone addition or deletion
      groups.push({
        ids: [current.id],
        changes: [current],
        isReplacement: false,
      });
      i++;
    }
  }

  return groups;
};

/**
 * Checks if all changes in a group are decided (accepted or rejected)
 */
export const isGroupDecided = (group: GroupedChange): boolean => {
  return group.changes.every(
    (change) =>
      change.type === "unchanged" ||
      change.status === "accepted" ||
      change.status === "rejected"
  );
};

/**
 * Checks if all changes in a group are accepted
 */
export const isGroupAccepted = (group: GroupedChange): boolean => {
  return group.changes.every(
    (change) => change.type === "unchanged" || change.status === "accepted"
  );
};

/**
 * Checks if all changes in a group are rejected
 */
export const isGroupRejected = (group: GroupedChange): boolean => {
  return group.changes.every(
    (change) => change.type === "unchanged" || change.status === "rejected"
  );
};

/**
 * Get a human-readable name for the control mode
 */
export const getModeLabel = (mode: string): string => {
  switch (mode) {
    case "highlightFloating":
      return "Highlight + Floating";
    case "wordBoundary":
      return "Word Boundary";
    case "sideAnnotations":
      return "Side Annotations";
    case "tooltip":
      return "Tooltip Controls";
    case "changeBubbles":
      return "Change Bubbles";
    default:
      return mode;
  }
};
