import { ModeToggle } from "@/components/mode-toggle";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { useEditorContext } from "@/context/EditorContext";
import {
  ChevronDown,
  FileText,
  History,
  Settings,
  Share2,
  Users,
} from "lucide-react";
import React from "react";

export const EditorHeader: React.FC = () => {
  const { documentTitle, setDocumentTitle } = useEditorContext();

  return (
    <header className="border-b pl-1 pr-1 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-30">
      <div className="flex h-16 items-center px-0 w-full">
        <div className="flex items-center gap-2 mr-6">
          <FileText className="h-5 w-5 text-primary" />
          <span className="font-bold text-lg">DocuMentor</span>
        </div>
        <div className="flex-1 flex items-center">
          <Input
            value={documentTitle}
            onChange={(e) => setDocumentTitle(e.target.value)}
            className="h-9 max-w-[350px] border-none text-lg font-medium focus-visible:ring-1 transition-all focus:max-w-[450px] focus:placeholder:opacity-0"
            aria-label="Document Title"
            placeholder="Untitled Document"
          />
        </div>
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="sm"
            className="text-muted-foreground hover:text-foreground transition-colors"
          >
            <History className="h-4 w-4 mr-2" />
            History
          </Button>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="gap-2">
                <Share2 className="h-4 w-4" />
                Share
                <ChevronDown className="h-3 w-3 opacity-50" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuItem className="flex gap-2 cursor-pointer">
                <Users className="h-4 w-4" />
                Invite collaborators
              </DropdownMenuItem>
              <DropdownMenuItem className="cursor-pointer">
                Copy link
              </DropdownMenuItem>
              <DropdownMenuItem className="cursor-pointer">
                Manage access
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <Button
            variant="ghost"
            size="icon"
            className="rounded-full h-9 w-9"
            aria-label="Settings"
          >
            <Settings className="h-4 w-4" />
          </Button>

          <ModeToggle />
        </div>
      </div>
    </header>
  );
};
