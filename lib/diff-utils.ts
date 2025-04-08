import { applyPatch, createPatch, parsePatch, type ParsedDiff } from "diff";

/**
 * Creates a Git-like diff between two texts
 */
export function createGitDiff(originalText: string, newText: string): string {
  return createPatch("document", originalText, newText, "", "", { context: 3 });
}

/**
 * Parses a Git-like diff into a structured format
 */
export function parseGitDiff(diff: string): ParsedDiff[] {
  return parsePatch(diff);
}

/**
 * Applies a Git-like diff to the original text
 */
export function applyGitDiff(originalText: string, diff: string): string {
  try {
    const result = applyPatch(originalText, diff);
    if (result === false) {
      throw new Error("Failed to apply patch");
    }
    return result;
  } catch (error) {
    console.error("Failed to apply patch:", error);
    return originalText;
  }
}

/**
 * Generates a Git-like merge conflict representation for a single conflicting block.
 * It only includes the actual conflicting lines between the markers.
 * Context lines surrounding the conflict are NOT included in this output.
 */
export function generateMergeConflict(
  originalText: string,
  suggestedText: string
): string {
  const origLines = originalText.split("\n");
  const suggestedLines = suggestedText.split("\n");

  // Create a patch
  const diff = createPatch("document", originalText, suggestedText, "", "", {
    context: 3,
  });
  const parsedDiff = parsePatch(diff)[0];

  let result = "";
  let currentLine = 0; // This variable seems unused now, can be removed later if confirmed

  // Process each hunk - assumes only one hunk for simplicity in basic conflict view
  // For multiple hunks, a real merge tool is needed. This focuses on displaying ONE difference.
  if (parsedDiff.hunks.length > 0) {
    const hunk = parsedDiff.hunks[0]; // Focus on the first hunk

    // Start conflict marker
    result += "<<<<<<< ORIGINAL\n";

    // Add removed lines (original)
    const removedLines: string[] = [];
    const addedLines: string[] = [];

    hunk.lines.forEach((line: string) => {
      if (line.startsWith("-")) {
        removedLines.push(line.substring(1));
      } else if (line.startsWith("+")) {
        addedLines.push(line.substring(1));
      }
      // Ignore context lines within the hunk for conflict block
    });

    if (removedLines.length > 0) {
      result += removedLines.join("\n") + "\n";
    }

    // Separator
    result += "=======\n";

    // Add added lines (suggestion)
    if (addedLines.length > 0) {
      result += addedLines.join("\n") + "\n";
    }

    // End conflict marker
    result += ">>>>>>> SUGGESTION\n";

    // Removed context line addition logic
    // currentLine = hunk.oldStart + hunk.oldLines - 1; // Update based on the first hunk processed
  }

  return result.trim(); // Trim potential leading/trailing whitespace
}

/**
 * Parses a Git-like merge conflict representation
 */
export function parseMergeConflict(text: string): {
  original: string;
  suggestion: string;
} {
  const lines = text.split("\n");
  let original = "";
  let suggestion = "";
  let currentSection: "none" | "original" | "suggestion" = "none";
  let contextLines: string[] = [];

  for (const line of lines) {
    if (line.startsWith("<<<<<<< ORIGINAL")) {
      // Add context lines to both original and suggestion
      if (contextLines.length > 0) {
        original += contextLines.join("\n") + "\n";
        suggestion += contextLines.join("\n") + "\n";
        contextLines = [];
      }
      currentSection = "original";
    } else if (line === "=======") {
      currentSection = "suggestion";
    } else if (line.startsWith(">>>>>>> SUGGESTION")) {
      currentSection = "none";
    } else {
      if (currentSection === "original") {
        original += line + "\n";
      } else if (currentSection === "suggestion") {
        suggestion += line + "\n";
      } else {
        // Unchanged lines (context/offset) go to both
        contextLines.push(line);
      }
    }
  }

  // Add any remaining context lines
  if (contextLines.length > 0) {
    original += contextLines.join("\n") + "\n";
    suggestion += contextLines.join("\n") + "\n";
  }

  return {
    original: original.trim(),
    suggestion: suggestion.trim(),
  };
}

/**
 * Applies only the accepted hunks from a parsed diff patch.
 *
 * @param originalText The original text content.
 * @param parsedDiffs The full parsed diff (array, usually only one element for file diffs).
 * @param acceptedHunkIndices A Set containing the 0-based indices of the hunks to apply.
 * @returns The text content after applying only the accepted hunks.
 * @throws {Error} If the partial patch application fails.
 */
export function applyPartialPatch(
  originalText: string,
  parsedDiffs: ParsedDiff[],
  acceptedHunkIndices: Set<number>
): string {
  if (parsedDiffs.length === 0) {
    return originalText; // No diffs to apply
  }

  // We usually deal with a single file diff, so take the first element.
  const originalDiff = parsedDiffs[0];

  // Create a new ParsedDiff structure containing only the accepted hunks.
  const partialDiff: ParsedDiff = {
    ...originalDiff, // Copy metadata like headers
    hunks: originalDiff.hunks.filter((_, index) =>
      acceptedHunkIndices.has(index)
    ),
  };

  // Apply the constructed partial patch.
  try {
    // applyPatch expects a single ParsedDiff or an array, we use the single object.
    const result = applyPatch(originalText, partialDiff);
    if (result === false) {
      // The diff library returns false for rejection or failure
      throw new Error(
        "Partial patch application failed (applyPatch returned false)."
      );
    }
    return result;
  } catch (error) {
    console.error("Error applying partial patch:", error);
    // Re-throw or handle as appropriate for the application context
    throw new Error(
      `Failed to apply partial patch: ${
        error instanceof Error ? error.message : String(error)
      }`
    );
  }
}
