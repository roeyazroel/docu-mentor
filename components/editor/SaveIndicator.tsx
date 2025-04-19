import { Badge } from "@/components/ui/badge";
import React from "react";

type SaveStatus = "saved" | "saving" | "unsaved";

interface SaveIndicatorProps {
  /** The current save status of the document */
  saveStatus: SaveStatus;
}

/**
 * Renders a floating save status indicator in the bottom right of the screen
 */
export const SaveIndicator: React.FC<SaveIndicatorProps> = ({ saveStatus }) => {
  const getBadgeClasses = (status: SaveStatus) => {
    switch (status) {
      case "saving":
        return "bg-yellow-100 dark:bg-yellow-900/30";
      case "unsaved":
        return "bg-blue-100 dark:bg-blue-900/30";
      case "saved":
      default:
        return "bg-green-100 dark:bg-green-900/30";
    }
  };

  const getStatusIndicatorClasses = (status: SaveStatus) => {
    switch (status) {
      case "saving":
        return "bg-yellow-500 animate-pulse";
      case "unsaved":
        return "bg-blue-500";
      case "saved":
      default:
        return "bg-green-500";
    }
  };

  const getStatusText = (status: SaveStatus) => {
    switch (status) {
      case "saving":
        return "Saving...";
      case "unsaved":
        return "Unsaved";
      case "saved":
      default:
        return "Saved";
    }
  };

  return (
    <div className="fixed bottom-4 right-[350px] z-50">
      <Badge
        variant="outline"
        className={`shadow-sm ${getBadgeClasses(saveStatus)}`}
      >
        <span
          className={`h-2 w-2 rounded-full mr-1 ${getStatusIndicatorClasses(
            saveStatus
          )}`}
        ></span>
        {getStatusText(saveStatus)}
      </Badge>
    </div>
  );
};
