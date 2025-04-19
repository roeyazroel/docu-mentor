"use client";

import { Card } from "@/components/ui/card";
import { useInlineDiff } from "@/hooks/useInlineDiff";
import { InlineDiffRenderer } from "./diff/InlineDiffRenderer";

interface AiSuggestionDiffProps {
  originalText: string;
  suggestedText: string;
  onAcceptAll: () => void;
  onRejectAll: () => void;
  onFinalizeChanges: (finalText: string) => void;
}

/**
 * Main component to display GitHub-like inline diff for AI suggestions.
 * Uses the useInlineDiff hook for state management and diff logic.
 */
export default function AiSuggestionDiff({
  originalText,
  suggestedText,
  onAcceptAll,
  onRejectAll,
  onFinalizeChanges,
}: AiSuggestionDiffProps) {
  const {
    diffChanges,
    hasChanges,
    allChangesDecided,
    acceptChange,
    rejectChange,
    acceptAllChanges,
    rejectAllChanges,
    generateFinalText,
  } = useInlineDiff({ originalText, suggestedText });

  // Handle accepting all changes
  const handleAcceptAll = () => {
    acceptAllChanges();
    onAcceptAll();
  };

  // Handle rejecting all changes
  const handleRejectAll = () => {
    rejectAllChanges();
    onRejectAll();
  };

  // Handle finalizing changes
  const handleFinalize = () => {
    const finalText = generateFinalText();
    onFinalizeChanges(finalText);
  };

  return (
    <Card className="p-4 shadow-md border border-border">
      <InlineDiffRenderer
        diffChanges={diffChanges}
        onAccept={acceptChange}
        onReject={rejectChange}
        onAcceptAll={handleAcceptAll}
        onRejectAll={handleRejectAll}
        onFinalize={handleFinalize}
        hasChanges={hasChanges}
        allChangesDecided={allChangesDecided}
      />
    </Card>
  );
}
