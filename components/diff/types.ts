// Types and constants for diff components

// Valid control modes for the diff renderer
export type DiffControlMode =
  | "highlightFloating"
  | "wordBoundary"
  | "sideAnnotations"
  | "tooltip"
  | "changeBubbles";

// The default control mode to use
export const DEFAULT_CONTROL_MODE: DiffControlMode = "sideAnnotations";

// Local storage key for storing the user's preferred mode
export const STORAGE_KEY = "diffControlMode";

export type DiffOperation = "unchanged" | "addition" | "deletion";

// Type for change in diff
export interface DiffChange {
  id: number;
  type: DiffOperation;
  content: string;
  status: "pending" | "accepted" | "rejected";
}

// Interface for grouped changes (e.g., a deletion + addition pair)
export interface GroupedChange {
  ids: number[];
  changes: DiffChange[];
  isReplacement: boolean;
}

// Props for the main diff renderer
export interface InlineDiffRendererProps {
  diffChanges: DiffChange[];
  onAccept: (id: number) => void;
  onReject: (id: number) => void;
  onAcceptAll: () => void;
  onRejectAll: () => void;
  onFinalize: () => void;
  hasChanges: boolean;
  allChangesDecided: boolean;
  controlMode?: DiffControlMode;
}
