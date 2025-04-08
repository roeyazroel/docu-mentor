import { useMemo } from "react";

interface MergeConflictTabProps {
  mergeConflictText?: string;
}

/**
 * Renders the Merge Conflict tab view.
 */
export function MergeConflictTab({ mergeConflictText }: MergeConflictTabProps) {
  // Format merge conflict for better display with syntax highlighting
  const formattedMergeConflict = useMemo(() => {
    if (!mergeConflictText)
      return "No merge conflict representation available.";

    // Escape HTML characters to prevent XSS if content might be user-generated
    // const escapedText = mergeConflictText
    //     .replace(/&/g, "&amp;")
    //     .replace(/</g, "&lt;")
    //     .replace(/>/g, "&gt;");
    // For now, assuming controlled input, directly apply spans for highlighting

    return mergeConflictText
      .replace(
        /<<<<<<< ORIGINAL/g,
        '<span class="text-red-500 font-semibold"><<<<<<< ORIGINAL</span>'
      )
      .replace(
        /=======/g,
        '<span class="text-blue-500 font-semibold">=======</span>'
      )
      .replace(
        />>>>>>> SUGGESTION/g,
        '<span class="text-green-500 font-semibold">>>>>>> SUGGESTION</span>'
      );
  }, [mergeConflictText]);

  return (
    <div>
      <div className="mb-4 p-3 bg-blue-50 text-blue-800 rounded-md dark:bg-blue-900/30 dark:text-blue-200">
        <p className="text-sm">
          This view shows the changes in a Git-like merge conflict format with
          context around each change.
        </p>
      </div>
      <div className="prose dark:prose-invert max-w-none">
        <pre className="font-mono text-sm whitespace-pre-wrap bg-muted p-4 rounded-md overflow-auto">
          <div
            dangerouslySetInnerHTML={{
              __html: formattedMergeConflict,
            }}
          />
        </pre>
      </div>
    </div>
  );
}
