import { useCallback, useEffect, useMemo, useState } from "react";
import DiffMatchPatch from "diff-match-patch";

// Type definitions
export type DiffOperation = "unchanged" | "addition" | "deletion";

export interface DiffChange {
  id: number;
  type: DiffOperation;
  content: string;
  status: "pending" | "accepted" | "rejected";
}

export interface UseInlineDiffProps {
  originalText: string;
  suggestedText: string;
}

export interface UseInlineDiffReturn {
  diffChanges: DiffChange[];
  hasChanges: boolean;
  allChangesDecided: boolean;
  acceptChange: (id: number) => void;
  rejectChange: (id: number) => void;
  acceptAllChanges: () => void;
  rejectAllChanges: () => void;
  resetDecisions: () => void;
  generateFinalText: () => string;
}

/**
 * Detects whether the AI response is a partial change or complete document
 * Returns a properly aligned suggestedText that can be diffed correctly
 */
function preprocessSuggestedText(originalText: string, suggestedText: string): string {
  // First check if this is a continuation
  // If the suggested text starts with the original text (ignoring whitespace), it's likely a continuation
  const normalizedOriginal = originalText.trim();
  const normalizedSuggested = suggestedText.trim();
  
  if (normalizedSuggested.startsWith(normalizedOriginal)) {
    console.log("[preprocessSuggestedText] Detected continuation - keeping original text intact");
    return suggestedText;
  }

  // If lengths are similar, treat as full document replacement
  if (Math.abs(originalText.length - suggestedText.length) < originalText.length * 0.4) {
    console.log("[preprocessSuggestedText] Treating as full document - lengths similar");
    return suggestedText;
  }

  // If one is much shorter than the other, it's likely a partial change
  console.log(`[preprocessSuggestedText] Suspected partial document change - original: ${originalText.length} chars, suggested: ${suggestedText.length} chars`);

  // Check if suggestedText might be a paragraph or section replacement
  // First, split the original text into paragraphs
  const originalParagraphs = originalText.split(/\n\n+/);
  
  // If we only have a single paragraph, check if it's a continuation of that paragraph
  if (originalParagraphs.length <= 1) {
    // Check if the suggested text contains the original text at the start
    if (suggestedText.toLowerCase().includes(originalText.toLowerCase())) {
      console.log("[preprocessSuggestedText] Appears to be a continuation of the single paragraph");
      return suggestedText;
    }
    console.log("[preprocessSuggestedText] Original is a single paragraph, no advanced matching needed");
    return suggestedText;
  }

  // Try to find the best matching paragraph in the original text
  const dmp = new DiffMatchPatch();
  
  // Function to calculate similarity between two strings
  const calculateSimilarity = (text1: string, text2: string): number => {
    // Use Levenshtein distance to calculate similarity
    const diffs = dmp.diff_main(text1.toLowerCase(), text2.toLowerCase());
    const levenshtein = dmp.diff_levenshtein(diffs);
    const maxLength = Math.max(text1.length, text2.length);
    return 1 - levenshtein / maxLength; // Higher value means more similar
  };

  // Helper to detect specific transformation types
  const detectTransformation = (original: string, modified: string): string | null => {
    // Check for ALL CAPS transformation
    if (modified === modified.toUpperCase() && 
        original !== original.toUpperCase() &&
        modified.replace(/\s+/g, '').toLowerCase() === original.replace(/\s+/g, '').toLowerCase()) {
      return "uppercase";
    }
    
    // Check for lowercase transformation
    if (modified === modified.toLowerCase() && 
        original !== original.toLowerCase() &&
        modified.replace(/\s+/g, '').toLowerCase() === original.replace(/\s+/g, '').toLowerCase()) {
      return "lowercase";
    }
    
    // Check for title case transformation
    const isTitleCase = (text: string): boolean => {
      const words = text.split(/\s+/);
      return words.length > 0 && words.every(word => 
        word.length > 0 && 
        word[0] === word[0].toUpperCase() && 
        (word.length === 1 || word.slice(1) === word.slice(1).toLowerCase())
      );
    };
    
    if (isTitleCase(modified) && 
        !isTitleCase(original) &&
        modified.replace(/\s+/g, '').toLowerCase() === original.replace(/\s+/g, '').toLowerCase()) {
      return "titlecase";
    }
    
    return null;
  };
  
  // Check if it's a transformation of the first paragraph (common case)
  // This is a common scenario from AI responses, so check it first
  const transformationType = detectTransformation(originalParagraphs[0], suggestedText);
  if (transformationType) {
    console.log(`[preprocessSuggestedText] Detected ${transformationType} transformation of first paragraph`);
    // This is a specific transformation of the first paragraph
    const newParagraphs = [...originalParagraphs];
    newParagraphs[0] = suggestedText;
    return newParagraphs.join('\n\n');
  }

  // First check for partial paragraph content match (first sentence, etc.)
  const paragraphsWithFirstSentence = originalParagraphs.map(para => {
    const sentences = para.split(/(?<=[.!?])\s+/);
    return sentences.length > 0 ? sentences[0] : '';
  });

  // Check if suggested text matches or modifies just the first sentence of any paragraph
  for (let i = 0; i < paragraphsWithFirstSentence.length; i++) {
    const firstSentence = paragraphsWithFirstSentence[i];
    if (firstSentence.length < 10) continue; // Skip very short sentences
    
    const similarity = calculateSimilarity(firstSentence, suggestedText);
    if (similarity > 0.5) {
      console.log(`[preprocessSuggestedText] Matched with first sentence of paragraph ${i}`);
      // Replace just the first sentence
      const sentences = originalParagraphs[i].split(/(?<=[.!?])\s+/);
      sentences[0] = suggestedText;
      
      const newParagraphs = [...originalParagraphs];
      newParagraphs[i] = sentences.join(' ');
      return newParagraphs.join('\n\n');
    }
  }
  
  // Check if the suggested text is a modified version of a specific paragraph
  for (let i = 0; i < originalParagraphs.length; i++) {
    // Skip very short paragraphs as they're not likely to be meaningful sections
    if (originalParagraphs[i].length < 20) continue;
    
    // Calculate similarity with current paragraph
    const similarity = calculateSimilarity(
      originalParagraphs[i].replace(/\s+/g, ' '), 
      suggestedText.replace(/\s+/g, ' ')
    );
    
    // If it's similar to a specific paragraph, it's likely a replacement for that paragraph
    if (similarity > 0.3) {
      console.log(`[preprocessSuggestedText] Matched paragraph ${i} with similarity ${similarity.toFixed(2)}`);
      // Replace just this paragraph in the original text
      const newParagraphs = [...originalParagraphs];
      newParagraphs[i] = suggestedText;
      return newParagraphs.join('\n\n');
    }
  }
  
  // If similarity check for first paragraph is reasonably high
  const firstParagraphSimilarity = calculateSimilarity(
    originalParagraphs[0].replace(/\s+/g, ' '), 
    suggestedText.replace(/\s+/g, ' ')
  );
  
  if (firstParagraphSimilarity > 0.25) {
    console.log(`[preprocessSuggestedText] Matched first paragraph with lower similarity threshold: ${firstParagraphSimilarity.toFixed(2)}`);
    // Likely a transformation of the first paragraph
    const newParagraphs = [...originalParagraphs];
    newParagraphs[0] = suggestedText;
    return newParagraphs.join('\n\n');
  }
  
  // If content length ratio is extreme (suggestedText is much shorter), 
  // and it seems to be derived from the start of the document,
  // assume it's meant to replace just the first paragraph
  if (suggestedText.length < originalText.length * 0.2) {
    // Do a quick check if it's similar to the start of the document
    const docStart = originalText.substring(0, Math.min(originalText.length, suggestedText.length * 3));
    const startSimilarity = calculateSimilarity(docStart, suggestedText);
    
    if (startSimilarity > 0.2) {
      console.log(`[preprocessSuggestedText] Very short compared to document, appears to be derived from the start: ${startSimilarity.toFixed(2)}`);
      // Replace just the first paragraph as a fallback strategy
      const newParagraphs = [...originalParagraphs];
      newParagraphs[0] = suggestedText;
      return newParagraphs.join('\n\n');
    }
  }
  
  // If we couldn't find a good match, log and return the original suggestion
  console.log("[preprocessSuggestedText] No good match found, using suggested text as-is");
  return suggestedText;
}

/**
 * Custom hook to manage inline diffs between original and suggested text.
 * Uses diff-match-patch for generating diffs and provides methods to 
 * accept/reject individual changes.
 */
export function useInlineDiff({
  originalText,
  suggestedText,
}: UseInlineDiffProps): UseInlineDiffReturn {
  const [diffChanges, setDiffChanges] = useState<DiffChange[]>([]);
  const [hasChanges, setHasChanges] = useState(false);
  const [allChangesDecided, setAllChangesDecided] = useState(false);
  
  // Preprocess the suggested text to handle partial changes
  const processedSuggestedText = useMemo(() => {
    return preprocessSuggestedText(originalText, suggestedText);
  }, [originalText, suggestedText]);

  // Compute the diff between original and suggested text
  const computeDiff = useCallback(() => {
    if (originalText === processedSuggestedText) {
      return [];
    }

    const dmp = new DiffMatchPatch();
    
    // Configure diff settings to prefer word-level diffs over character-level diffs
    // Higher edit cost means the algorithm will prefer to make fewer edits even if they're larger
    dmp.Diff_EditCost = 8; // Default is 4, increasing makes it prefer fewer, larger changes
    
    // First perform a word-level diff 
    const diffs = dmp.diff_main(originalText, processedSuggestedText);
    
    // Clean up the diff to increase semantic coherence
    dmp.diff_cleanupSemantic(diffs);
    
    // Further cleanup to merge adjacent edits
    dmp.diff_cleanupEfficiency(diffs);
    
    // Convert to our internal format
    let changes: DiffChange[] = diffs.map((diff, index) => {
      const [type, text] = diff;
      return {
        id: index,
        type: type === -1 ? "deletion" : type === 1 ? "addition" : "unchanged",
        content: text,
        status: "pending"
      };
    });
    
    // Post-process to merge word-level replacements (deletion followed by addition)
    changes = mergeWordReplacements(changes);
    
    return changes;
  }, [originalText, processedSuggestedText]);

  /**
   * Post-processes diff results to merge adjacent deletion and addition
   * operations that represent a word replacement into a single pair of changes.
   */
  const mergeWordReplacements = (changes: DiffChange[]): DiffChange[] => {
    const result: DiffChange[] = [];
    let i = 0;
    
    // Helper function to check if text is a single word
    const isSingleWord = (text: string): boolean => {
      // Remove punctuation and check if it's a single word
      return text.trim().replace(/[^\w\s]/g, '').split(/\s+/).filter(Boolean).length <= 1;
    };
    
    // Helper to check if we should merge deletions and additions that are close
    const shouldMergeDeletionAddition = (
      deletionIdx: number, 
      additionIdx: number
    ): boolean => {
      const deletion = changes[deletionIdx];
      const addition = changes[additionIdx];
      
      // If both are single words, or if one is replacing the other with similar length,
      // consider them as a replacement pair
      if (isSingleWord(deletion.content) && isSingleWord(addition.content)) {
        return true;
      }
      
      // If they're close in length, also consider as replacement (e.g., "remarkable" -> "great")
      const lengthRatio = Math.max(
        deletion.content.length / addition.content.length,
        addition.content.length / deletion.content.length
      );
      
      return lengthRatio < 3; // Allow reasonable length differences
    };
    
    while (i < changes.length) {
      // Look for word replacements with whitespace in between
      if (i + 2 < changes.length && 
          changes[i].type === "deletion" && 
          changes[i+2].type === "addition" && 
          changes[i+1].type === "unchanged" && 
          changes[i+1].content.trim() === "" &&
          shouldMergeDeletionAddition(i, i+2)) {
        
        // Word replacement with whitespace pattern: [deletion][whitespace][addition]
        // Create a pair of deletion and addition as a logical unit
        const deletionContent = changes[i].content;
        const additionContent = changes[i+2].content;
        
        result.push({
          id: result.length,
          type: "deletion",
          content: deletionContent,
          status: "pending"
        });
        
        result.push({
          id: result.length,
          type: "addition",
          content: additionContent,
          status: "pending"
        });
        
        // Handle the whitespace properly by including it with the addition
        // This ensures proper spacing in the final text
        
        i += 3; // Skip all three changes
      } 
      // Direct deletion followed by addition
      else if (i + 1 < changes.length && 
               changes[i].type === "deletion" && 
               changes[i+1].type === "addition" &&
               shouldMergeDeletionAddition(i, i+1)) {
        
        // Create a clean pair of deletion and addition
        result.push({
          id: result.length,
          type: "deletion",
          content: changes[i].content,
          status: "pending"
        });
        
        result.push({
          id: result.length,
          type: "addition",
          content: changes[i+1].content,
          status: "pending"
        });
        
        i += 2; // Skip both changes
      }
      // Check for character-level changes that should be merged into word replacements
      else if (i + 3 < changes.length &&
               changes[i].type === "unchanged" &&
               changes[i+1].type === "deletion" &&
               changes[i+2].type === "unchanged" &&
               changes[i+3].type === "addition" &&
               // If the unchanged parts are just shared characters or whitespace
               (changes[i+2].content.trim() === "" || changes[i+2].content.length <= 2)) {
        
        // First, add the unchanged prefix
        result.push({
          id: result.length,
          type: "unchanged",
          content: changes[i].content,
          status: "pending"
        });
        
        // Then handle the replacement as a logical pair
        result.push({
          id: result.length,
          type: "deletion",
          content: changes[i+1].content,
          status: "pending"
        });
        
        result.push({
          id: result.length,
          type: "addition",
          content: changes[i+3].content,
          status: "pending"
        });
        
        i += 4; // Skip all four changes
      }
      // Regular change, just add it with a new ID
      else {
        result.push({
          ...changes[i],
          id: result.length
        });
        i++;
      }
    }
    
    return result;
  };

  // Effect to compute diff when inputs change
  useEffect(() => {
    const changes = computeDiff();
    setDiffChanges(changes);
    setHasChanges(changes.some(change => 
      change.type === "addition" || change.type === "deletion"
    ));
    setAllChangesDecided(false);
  }, [computeDiff]);

  // Effect to check if all changes have been decided
  useEffect(() => {
    const allDecided = diffChanges.every(
      change => 
        change.type === "unchanged" || 
        change.status === "accepted" || 
        change.status === "rejected"
    );
    setAllChangesDecided(allDecided);
  }, [diffChanges]);

  // Accept a specific change
  const acceptChange = useCallback((id: number) => {
    setDiffChanges(prev => 
      prev.map(change => 
        change.id === id ? { ...change, status: "accepted" } : change
      )
    );
  }, []);

  // Reject a specific change
  const rejectChange = useCallback((id: number) => {
    setDiffChanges(prev => 
      prev.map(change => 
        change.id === id ? { ...change, status: "rejected" } : change
      )
    );
  }, []);

  // Accept all changes
  const acceptAllChanges = useCallback(() => {
    setDiffChanges(prev => 
      prev.map(change => 
        change.type !== "unchanged" 
          ? { ...change, status: "accepted" } 
          : change
      )
    );
  }, []);

  // Reject all changes
  const rejectAllChanges = useCallback(() => {
    setDiffChanges(prev => 
      prev.map(change => 
        change.type !== "unchanged" 
          ? { ...change, status: "rejected" } 
          : change
      )
    );
  }, []);

  // Reset all decisions
  const resetDecisions = useCallback(() => {
    setDiffChanges(prev => 
      prev.map(change => 
        change.type !== "unchanged" 
          ? { ...change, status: "pending" } 
          : change
      )
    );
  }, []);

  // Generate final text based on accepted/rejected changes
  const generateFinalText = useCallback(() => {
    let finalText = "";
    
    for (const change of diffChanges) {
      if (change.type === "unchanged") {
        finalText += change.content;
      } else if (change.type === "addition" && change.status === "accepted") {
        finalText += change.content;
      } else if (change.type === "deletion" && change.status === "rejected") {
        finalText += change.content;
      }
    }
    
    return finalText;
  }, [diffChanges]);

  return {
    diffChanges,
    hasChanges,
    allChangesDecided,
    acceptChange,
    rejectChange,
    acceptAllChanges,
    rejectAllChanges,
    resetDecisions,
    generateFinalText,
  };
} 