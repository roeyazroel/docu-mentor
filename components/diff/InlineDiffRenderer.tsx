"use client";

import { Button } from "@/components/ui/button";
import { type DiffChange } from "@/hooks/useInlineDiff";
import { Check, X } from "lucide-react";
import { useCallback, useMemo } from "react";

interface InlineDiffRendererProps {
  diffChanges: DiffChange[];
  onAccept: (id: number) => void;
  onReject: (id: number) => void;
  onAcceptAll: () => void;
  onRejectAll: () => void;
  onFinalize: () => void;
  hasChanges: boolean;
  allChangesDecided: boolean;
}

// Interface for grouped changes (e.g., a deletion + addition pair)
interface GroupedChange {
  ids: number[];
  changes: DiffChange[];
  isReplacement: boolean;
}

/**
 * Renders a GitHub-like inline diff view for comparing text changes
 * with accept/reject controls for each change.
 */
export function InlineDiffRenderer({
  diffChanges,
  onAccept,
  onReject,
  onAcceptAll,
  onRejectAll,
  onFinalize,
  hasChanges,
  allChangesDecided,
}: InlineDiffRendererProps) {
  // Group related changes (like deletion-addition pairs) together
  const groupedChanges = useMemo(() => {
    const groups: GroupedChange[] = [];
    let i = 0;
    
    while (i < diffChanges.length) {
      const current = diffChanges[i];
      
      // If this is an unchanged section, add it as a standalone group
      if (current.type === "unchanged") {
        groups.push({
          ids: [current.id],
          changes: [current],
          isReplacement: false
        });
        i++;
        continue;
      }
      
      // Check if we have a deletion followed by addition (word replacement)
      if (i + 1 < diffChanges.length &&
          current.type === "deletion" &&
          diffChanges[i + 1].type === "addition") {
        
        // Group them as a replacement pair
        groups.push({
          ids: [current.id, diffChanges[i + 1].id],
          changes: [current, diffChanges[i + 1]],
          isReplacement: true
        });
        i += 2;
      } else {
        // Just a standalone addition or deletion
        groups.push({
          ids: [current.id],
          changes: [current],
          isReplacement: false
        });
        i++;
      }
    }
    
    return groups;
  }, [diffChanges]);
  
  // Handle accepting a group of changes
  const handleAcceptGroup = useCallback((group: GroupedChange) => {
    group.ids.forEach(id => onAccept(id));
  }, [onAccept]);
  
  // Handle rejecting a group of changes
  const handleRejectGroup = useCallback((group: GroupedChange) => {
    group.ids.forEach(id => onReject(id));
  }, [onReject]);
  
  // Check if all changes in a group are decided (accepted or rejected)
  const isGroupDecided = useCallback((group: GroupedChange): boolean => {
    return group.changes.every(change => 
      change.type === "unchanged" || 
      change.status === "accepted" || 
      change.status === "rejected"
    );
  }, []);
  
  // Check if all changes in a group are accepted
  const isGroupAccepted = useCallback((group: GroupedChange): boolean => {
    return group.changes.every(change => 
      change.type === "unchanged" || change.status === "accepted"
    );
  }, []);
  
  // Check if all changes in a group are rejected
  const isGroupRejected = useCallback((group: GroupedChange): boolean => {
    return group.changes.every(change => 
      change.type === "unchanged" || change.status === "rejected"
    );
  }, []);

  // Renders a single change based on its type and status
  const renderSingleChange = useCallback((change: DiffChange) => {
    const { id, type, content, status } = change;
    
    // For unchanged text, just render it normally
    if (type === "unchanged") {
      return <span key={id}>{content}</span>;
    }
    
    // Base classes for additions and deletions
    let className = "relative py-0.5 px-0.5 font-mono";
    
    // Addition styling
    if (type === "addition") {
      className += " bg-green-100 dark:bg-green-950/50 text-green-800 dark:text-green-300";
      if (status === "rejected") {
        className += " opacity-50 line-through";
      }
    }
    
    // Deletion styling
    if (type === "deletion") {
      className += " bg-red-100 dark:bg-red-950/50 text-red-800 dark:text-red-300";
      if (status === "accepted") {
        className += " opacity-50 line-through";
      } else {
        className += " line-through";
      }
    }
    
    return (
      <span key={id} className={className}>
        {content}
        
        {status === "accepted" && (
          <span className="inline-flex items-center ml-1 text-xs text-green-600 dark:text-green-400">
            <Check className="h-2 w-2 mr-0.5" />
            {type === "addition" ? "Added" : "Removed"}
          </span>
        )}
        
        {status === "rejected" && (
          <span className="inline-flex items-center ml-1 text-xs text-red-600 dark:text-red-400">
            <X className="h-2 w-2 mr-0.5" />
            {type === "addition" ? "Rejected" : "Kept"}
          </span>
        )}
      </span>
    );
  }, []);

  // Render a group of changes (e.g., a word replacement)
  const renderChangeGroup = useCallback((group: GroupedChange, index: number) => {
    // For single changes or unchanged text
    if (!group.isReplacement || group.changes.length === 1) {
      return group.changes.map(renderSingleChange);
    }
    
    // Handle replacement pairs (deletion + addition)
    const deletion = group.changes.find(c => c.type === "deletion");
    const addition = group.changes.find(c => c.type === "addition");
    
    if (!deletion || !addition) {
      return group.changes.map(renderSingleChange);
    }
    
    const decided = isGroupDecided(group);
    const accepted = isGroupAccepted(group);
    const rejected = isGroupRejected(group);
    
    // Container for the replacement with hover functionality
    let containerClass = "relative group inline-flex items-baseline mr-1";
    
    return (
      <span key={`group-${index}`} className={containerClass}>
        {/* Deletion part */}
        <span className={`bg-red-100 dark:bg-red-950/50 text-red-800 dark:text-red-300 line-through ${accepted ? "opacity-50" : ""}`}>
          {deletion.content}
        </span>
        
        {/* Addition part */}
        <span className={`bg-green-100 dark:bg-green-950/50 text-green-800 dark:text-green-300 ${rejected ? "opacity-50 line-through" : ""}`}>
          {addition.content}
        </span>
        
        {/* Floating controls that appear on hover */}
        {!decided && (
          <span className="absolute -bottom-7 left-1/2 transform -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity bg-white dark:bg-gray-800 border rounded-md py-1 px-2 shadow-md inline-flex gap-1 z-10">
            <Button
              size="icon"
              variant="ghost"
              className="h-6 w-6 rounded-full bg-red-100 hover:bg-red-200 dark:bg-red-900/50 dark:hover:bg-red-800/50"
              onClick={() => handleRejectGroup(group)}
              title="Reject this change"
            >
              <X className="h-3 w-3 text-red-600 dark:text-red-400" />
            </Button>
            <Button
              size="icon"
              variant="ghost"
              className="h-6 w-6 rounded-full bg-green-100 hover:bg-green-200 dark:bg-green-900/50 dark:hover:bg-green-800/50"
              onClick={() => handleAcceptGroup(group)}
              title="Accept this change"
            >
              <Check className="h-3 w-3 text-green-600 dark:text-green-400" />
            </Button>
          </span>
        )}
        
        {/* Status indicators */}
        {decided && (
          <span className={`inline-flex items-center ml-1 text-xs ${accepted ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400"}`}>
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
  }, [renderSingleChange, isGroupDecided, isGroupAccepted, isGroupRejected, handleAcceptGroup, handleRejectGroup]);

  // If no changes, show a message
  if (!hasChanges) {
    return (
      <div className="p-4 text-center text-muted-foreground">
        No changes detected. The suggested text is identical to the original.
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Controls for accepting/rejecting all changes */}
      <div className="mb-4 p-3 bg-blue-50 text-blue-800 rounded-md dark:bg-blue-900/30 dark:text-blue-200 flex justify-between items-center">
        <p className="text-sm">
          Review suggested changes inline. Accept or reject individual changes.
        </p>
        {hasChanges && !allChangesDecided && (
          <div className="flex gap-2">
            <Button
              size="sm"
              variant="outline"
              className="gap-1"
              onClick={onRejectAll}
            >
              <X className="h-3 w-3" />
              Reject All
            </Button>
            <Button size="sm" className="gap-1" onClick={onAcceptAll}>
              <Check className="h-3 w-3" />
              Accept All
            </Button>
          </div>
        )}
        {hasChanges && allChangesDecided && (
          <Button size="sm" className="gap-1" onClick={onFinalize}>
            <Check className="h-3 w-3" />
            Finalize Changes
          </Button>
        )}
      </div>

      {/* The actual inline diff content */}
      <div className="font-mono text-sm whitespace-pre-wrap p-4 border rounded-md bg-background">
        {groupedChanges.map((group, index) => renderChangeGroup(group, index))}
      </div>
    </div>
  );
} 