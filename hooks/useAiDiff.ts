import { diffChars, diffWords, type Change } from "diff";
import { useCallback, useEffect, useState } from "react";

// Define types for the hook's state and return value
export interface DiffLine {
  type: "added" | "removed" | "unchanged" | "annotation";
  content: string;
  lineNumber?: number; // Original line number for context
  // Add properties for word/char diff if needed
  changes?: Change[];
}

export interface UseAiDiffProps {
  originalText: string;
  suggestedText: string;
  diffStrategy?: "lines" | "words" | "chars";
}

export interface UseAiDiffReturn {
  diffLines: DiffLine[];
  groupedDiffLines: Array<{
    type: DiffLine["type"];
    content: string[];
    lineNumbers?: number[];
    changes?: Change[];
    groupIndex: number;
  }>;
  previewText: string;
  allChangesDecided: boolean;
  acceptedGroups: Set<number>;
  rejectedGroups: Set<number>;
  handleAcceptGroup: (groupIndex: number) => void;
  handleRejectGroup: (groupIndex: number) => void;
  applyPartialChanges: (accepted: Set<number>, rejected: Set<number>) => string; // Returns the new text
  hasChanges: boolean;
}

/**
 * Custom hook to manage AI suggestion diffing logic.
 * Computes diffs, handles state for accepted/rejected changes,
 * and generates preview text.
 */
export function useAiDiff({
  originalText,
  suggestedText,
  diffStrategy = "lines", // Default to line diff
}: UseAiDiffProps): UseAiDiffReturn {
  const [diffLines, setDiffLines] = useState<DiffLine[]>([]);
  const [groupedDiffLines, setGroupedDiffLines] = useState<
    UseAiDiffReturn["groupedDiffLines"]
  >([]);
  const [acceptedGroups, setAcceptedGroups] = useState<Set<number>>(new Set());
  const [rejectedGroups, setRejectedGroups] = useState<Set<number>>(new Set());
  const [previewText, setPreviewText] = useState(suggestedText);
  const [allChangesDecided, setAllChangesDecided] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);

  // Placeholder for diff computation logic (Checklist item 5)
  const computeDiff = useCallback(() => {
    // TODO: Implement diff computation based on diffStrategy
    // For now, return empty array
    console.log("Computing diff with strategy:", diffStrategy);
    if (!originalText && suggestedText) {
      return [
        {
          type: "added",
          content: suggestedText,
          changes: diffChars(" ", suggestedText),
        },
      ] as DiffLine[]; // Use diffChars for pure add
    }
    if (!originalText && !suggestedText) {
      return [];
    }
    if (originalText && !suggestedText) {
      return [{ type: "removed", content: originalText }] as DiffLine[];
    }
    if (originalText === suggestedText) {
      return [{ type: "unchanged", content: originalText }] as DiffLine[];
    }

    // --- Word Diff Implementation ---
    const changes: Change[] = diffWords(originalText, suggestedText);
    const resultLines: DiffLine[] = [];
    let currentLineContent = "";

    changes.forEach((part) => {
      const lines = part.value.split("\n");
      lines.forEach((line, index) => {
        if (index > 0) {
          // Newline encountered, finalize the previous line
          resultLines.push({
            type: getLineTypeFromChanges(
              currentLineContent,
              changes.filter((c) => c.value.includes(currentLineContent))
            ), // Helper needed
            content: currentLineContent,
            changes: changes.filter((c) =>
              c.value.includes(currentLineContent)
            ), // Pass relevant changes
          });
          currentLineContent = line; // Start new line
        } else {
          currentLineContent += line; // Append to current line
        }
      });
    });

    // Add the last line if it has content
    if (currentLineContent) {
      resultLines.push({
        type: getLineTypeFromChanges(
          currentLineContent,
          changes.filter((c) => c.value.includes(currentLineContent))
        ), // Helper needed
        content: currentLineContent,
        changes: changes.filter((c) => c.value.includes(currentLineContent)),
      });
    }

    // Helper function to determine line type based on word changes within it
    function getLineTypeFromChanges(
      lineContent: string,
      lineChanges: Change[]
    ): DiffLine["type"] {
      // Prioritize annotation type if line starts with known annotation prefixes
      if (lineContent.startsWith("@@") || lineContent.startsWith("\\")) {
        return "annotation";
      }
      const hasAdded = lineChanges.some((c) => c.added);
      const hasRemoved = lineChanges.some((c) => c.removed);
      if (hasAdded && !hasRemoved) return "added";
      if (!hasAdded && hasRemoved) return "removed";
      if (hasAdded && hasRemoved) return "unchanged"; // Treat lines with mixed changes as unchanged for now, highlighting will show diffs
      return "unchanged";
    }

    return resultLines;
    // --- End Word Diff Implementation ---

    /* --- Old Line Diff Implementation (Commented Out) ---
    const diffResult = createPatch("document", originalText, suggestedText, "", "", { context: 3 });
    const parsedDiff = parsePatch(diffResult)[0];
    const resultLines: DiffLine[] = [];

    if (!parsedDiff) {
      // Handle cases where parsePatch might fail or return undefined
      // Maybe the texts are identical? Add an unchanged block.
      if (originalText === suggestedText) {
        return [{ type: "unchanged", content: originalText }] as DiffLine[];
      }
      // Fallback or error handling needed
      console.error("Failed to parse diff");
      return [];
    }

    parsedDiff.hunks.forEach((hunk: Hunk) => {
      resultLines.push({
        type: "annotation",
        content: `@@ -${hunk.oldStart},${hunk.oldLines} +${hunk.newStart},${hunk.newLines} @@`,
      });

      let currentOldLine = hunk.oldStart;
      hunk.lines.forEach((line: string) => {
        if (line.startsWith("+")) {
          resultLines.push({ type: "added", content: line.substring(1) });
        } else if (line.startsWith("-")) {
          resultLines.push({
            type: "removed",
            content: line.substring(1),
            lineNumber: currentOldLine,
          });
          currentOldLine++;
        } else if (line.startsWith(" ")) {
          resultLines.push({
            type: "unchanged",
            content: line.substring(1),
            lineNumber: currentOldLine,
          });
          currentOldLine++;
        } else if (line.startsWith("\\")) {
          // Handle 'No newline at end of file'
          resultLines.push({ type: "annotation", content: line });
        } else {
          // Fallback for unexpected line formats
          resultLines.push({ type: "annotation", content: line });
        }
      });
    });
    return resultLines;
    // --- End Placeholder ---
    */
  }, [originalText, suggestedText, diffStrategy]);

  // Effect to compute diff when inputs change
  useEffect(() => {
    const computedLines = computeDiff();
    setDiffLines(computedLines);
    setHasChanges(
      computedLines.some(
        (line) => line.type === "added" || line.type === "removed"
      )
    );

    // Reset decisions when source texts change
    setAcceptedGroups(new Set());
    setRejectedGroups(new Set());
    setPreviewText(suggestedText); // Reset preview to suggested initially
    setAllChangesDecided(false);
  }, [computeDiff, originalText, suggestedText]);

  // Effect to group diff lines for rendering
  useEffect(() => {
    const groups = diffLines.reduce((acc, line, index) => {
      const currentGroupIndex =
        acc.length > 0 ? acc[acc.length - 1].groupIndex : -1;
      const isChangeType = line.type === "added" || line.type === "removed";
      const previousGroup = acc[acc.length - 1];

      // Start new group if:
      // - It's the first line
      // - Type changes from previous line
      // - It's an annotation
      // - It's a change type (added/removed) - we want separate groups for accept/reject
      if (
        index === 0 ||
        line.type === "annotation" ||
        isChangeType ||
        (previousGroup && previousGroup.type !== line.type)
      ) {
        acc.push({
          type: line.type,
          content: [line.content],
          lineNumbers:
            line.lineNumber !== undefined ? [line.lineNumber] : undefined,
          changes: line.changes,
          groupIndex: currentGroupIndex + 1, // Assign a unique index to each group
        });
      } else {
        // Otherwise, add to the last group
        previousGroup.content.push(line.content);
        if (line.lineNumber !== undefined) {
          if (!previousGroup.lineNumbers) {
            previousGroup.lineNumbers = [];
          }
          previousGroup.lineNumbers.push(line.lineNumber);
        }
        if (line.changes) {
          if (!previousGroup.changes) {
            previousGroup.changes = [];
          }
          previousGroup.changes.push(...line.changes);
        }
      }
      return acc;
    }, [] as UseAiDiffReturn["groupedDiffLines"]);
    setGroupedDiffLines(groups);
  }, [diffLines]);

  // Placeholder for applying partial changes (Checklist item 7)
  const applyPartialChanges = useCallback(
    (accepted: Set<number>, rejected: Set<number>): string => {
      console.log(
        "Applying partial changes based on word diff",
        accepted,
        rejected
      );

      let resultText = "";
      // Keep track of the conceptual group index as we iterate through word changes
      let currentGroupIndex = -1;
      let previousType: DiffLine["type"] | null = null;

      // Get the original word diff changes again
      const wordChanges = diffWords(originalText, suggestedText);

      wordChanges.forEach((change) => {
        // Determine which group this change belongs to based on how groupedDiffLines was constructed
        // This is complex because groups aggregate lines, but changes are word-based.
        // We need a reliable way to map a word change back to its group index.
        // Let's refine the grouping logic first or find a simpler way.

        // --- Simplified Placeholder Logic for Word Diff Apply ---
        // This won't correctly handle multi-line groups yet.
        // It assumes each change corresponds roughly to a group decision.

        // Rough group index estimation (needs improvement)
        const isChange = change.added || change.removed;
        if (
          isChange &&
          (previousType === null || previousType === "unchanged")
        ) {
          currentGroupIndex++;
        }
        if (!isChange && previousType !== "unchanged") {
          // Transitioning out of a change block potentially ends the group conceptually
        }

        if (change.added) {
          if (!rejected.has(currentGroupIndex)) {
            resultText += change.value;
          }
        } else if (change.removed) {
          if (rejected.has(currentGroupIndex)) {
            // Rejected removal means keep original
            resultText += change.value;
          }
          // Accepted removal means add nothing
        } else {
          // Unchanged part
          resultText += change.value;
        }
        previousType = change.added
          ? "added"
          : change.removed
          ? "removed"
          : "unchanged";
      });

      return resultText;
      // --- End Simplified Placeholder ---

      /* --- Old Line Diff Apply Logic (Commented Out) ---
     let resultText = "";
     let hunkIndex = -1; // Track which group we are in
    */
    },
    [originalText, suggestedText]
  );

  // Handlers for accepting/rejecting groups
  const handleAcceptGroup = useCallback((groupIndex: number) => {
    setAcceptedGroups((prev) => new Set(prev).add(groupIndex));
    setRejectedGroups((prev) => {
      const next = new Set(prev);
      next.delete(groupIndex);
      return next;
    });
  }, []);

  const handleRejectGroup = useCallback((groupIndex: number) => {
    setRejectedGroups((prev) => new Set(prev).add(groupIndex));
    setAcceptedGroups((prev) => {
      const next = new Set(prev);
      next.delete(groupIndex);
      return next;
    });
  }, []);

  // Effect to update preview text when decisions change
  useEffect(() => {
    // Prevent update if diffLines are not yet computed
    if (diffLines.length === 0 && originalText !== suggestedText) return;

    const newText = applyPartialChanges(acceptedGroups, rejectedGroups);
    setPreviewText(newText);
  }, [
    acceptedGroups,
    rejectedGroups,
    applyPartialChanges,
    diffLines,
    originalText,
    suggestedText,
  ]);

  // Effect to check if all changes have been decided
  useEffect(() => {
    const changeGroupIndices = new Set(
      groupedDiffLines
        .filter((g) => g.type === "added" || g.type === "removed")
        .map((g) => g.groupIndex)
    );
    const decidedGroups = new Set([...acceptedGroups, ...rejectedGroups]);
    const allDecided = Array.from(changeGroupIndices).every((index) =>
      decidedGroups.has(index)
    );
    // Only set to true if there are actual changes to decide on
    setAllChangesDecided(changeGroupIndices.size > 0 && allDecided);
  }, [acceptedGroups, rejectedGroups, groupedDiffLines]);

  return {
    diffLines,
    groupedDiffLines,
    previewText,
    allChangesDecided,
    acceptedGroups,
    rejectedGroups,
    handleAcceptGroup,
    handleRejectGroup,
    applyPartialChanges,
    hasChanges,
  };
}
