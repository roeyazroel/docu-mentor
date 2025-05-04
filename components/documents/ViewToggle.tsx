"use client";

import { ViewMode } from "@/app/(app)/documents/types";
import { Toggle } from "@/components/ui/toggle";
import { LayoutGrid, List } from "lucide-react";

interface ViewToggleProps {
  current: ViewMode;
  onChange: (value: ViewMode) => void;
}

export default function ViewToggle({ current, onChange }: ViewToggleProps) {
  return (
    <div className="flex items-center space-x-1 border rounded-md">
      <Toggle
        variant="outline"
        size="sm"
        pressed={current === "grid"}
        onPressedChange={() => onChange("grid")}
        aria-label="Grid view"
      >
        <LayoutGrid className="h-4 w-4" />
      </Toggle>
      <Toggle
        variant="outline"
        size="sm"
        pressed={current === "list"}
        onPressedChange={() => onChange("list")}
        aria-label="List view"
      >
        <List className="h-4 w-4" />
      </Toggle>
    </div>
  );
}
