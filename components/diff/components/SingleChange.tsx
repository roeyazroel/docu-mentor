"use client";

import { Check, X } from "lucide-react";
import { DiffChange } from "../types";

interface SingleChangeProps {
  change: DiffChange;
}

/**
 * Renders a single change based on its type and status
 */
export function SingleChange({ change }: SingleChangeProps) {
  const { id, type, content, status } = change;

  // For unchanged text, just render it normally
  if (type === "unchanged") {
    return <span key={id}>{content}</span>;
  }

  // Base classes for additions and deletions
  let className = "py-0.5 px-0.5 font-mono";

  // Addition styling
  if (type === "addition") {
    className +=
      " bg-green-100 dark:bg-green-950/50 text-green-800 dark:text-green-300";
    if (status === "rejected") {
      className += " opacity-50 line-through";
    }
  }

  // Deletion styling
  if (type === "deletion") {
    className +=
      " bg-red-100 dark:bg-red-950/50 text-red-800 dark:text-red-300";
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
}
