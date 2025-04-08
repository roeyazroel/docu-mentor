import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { ChevronDown, FileText, History, Settings, Users } from "lucide-react";
import React from "react";

type SaveStatus = "saved" | "saving" | "unsaved";

interface EditorHeaderProps {
  /** The current title of the document */
  documentTitle: string;
  /** Callback function when the document title changes */
  onDocumentTitleChange: (title: string) => void;
  /** The current save status of the document */
  saveStatus: SaveStatus;
}

/**
 * Renders the header section of the editor interface, including title,
 * save status indicator, and action buttons like Share, History, Settings.
 */
export const EditorHeader: React.FC<EditorHeaderProps> = ({
  documentTitle,
  onDocumentTitleChange,
  saveStatus,
}) => {
  const getBadgeClasses = (status: SaveStatus) => {
    switch (status) {
      case "saving":
        return "bg-yellow-100 dark:bg-yellow-900/30";
      case "unsaved":
        return "bg-blue-100 dark:bg-blue-900/30";
      case "saved":
      default:
        return "";
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
    <header className="border-b">
      <div className="container flex h-14 items-center px-4">
        <div className="flex items-center gap-2 mr-4">
          <FileText className="h-5 w-5 text-primary" />
          <span className="font-semibold">DocuMentor</span>
        </div>
        <div className="flex-1 flex items-center gap-2">
          <Input
            value={documentTitle}
            onChange={(e) => onDocumentTitleChange(e.target.value)}
            className="h-9 w-[250px] border-none text-lg font-medium focus-visible:ring-0"
            aria-label="Document Title"
          />
          <Badge
            variant="outline"
            className={`ml-2 ${getBadgeClasses(saveStatus)}`}
          >
            <span
              className={`h-2 w-2 rounded-full mr-1 ${getStatusIndicatorClasses(
                saveStatus
              )}`}
            ></span>
            {getStatusText(saveStatus)}
          </Badge>
        </div>
        <div className="flex items-center gap-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="gap-1">
                <Users className="h-4 w-4" />
                Share
                <ChevronDown className="h-3 w-3 opacity-50" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem>Copy link</DropdownMenuItem>
              <DropdownMenuItem>Invite users</DropdownMenuItem>
              <DropdownMenuItem>Manage access</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          <Button variant="outline" size="sm">
            <History className="h-4 w-4 mr-1" />
            History
          </Button>
          <Button variant="outline" size="sm">
            <Settings className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </header>
  );
};
