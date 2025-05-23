import { ModeToggle } from "@/components/mode-toggle";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { UserButton, useUser } from "@clerk/nextjs";
import {
  ChevronDown,
  FileText,
  History,
  Settings,
  Share2,
  Users,
} from "lucide-react";
import React, { useEffect, useRef, useState } from "react";

export const EditorHeader: React.FC = () => {
  const { user } = useUser();
  const headerRef = useRef<HTMLElement>(null);
  const [showHistory, setShowHistory] = useState(false);

  // Try to access the history toggle function from the parent page
  useEffect(() => {
    // Add a data attribute so the page can find this component
    if (headerRef.current) {
      headerRef.current.setAttribute("data-header-component", "true");
    }

    // Set up a polling interval to check for updates to the history state
    const interval = setInterval(() => {
      if (headerRef.current) {
        const currentState = (headerRef.current as any).__historyState;
        if (currentState !== undefined && currentState !== showHistory) {
          setShowHistory(currentState);
        }
      }
    }, 100);

    return () => clearInterval(interval);
  }, [showHistory]);

  // Handle history button click
  const handleHistoryClick = () => {
    // First update our local state
    const newState = !showHistory;
    setShowHistory(newState);

    // Then try to call the toggle function from the parent
    if (
      headerRef.current &&
      typeof (headerRef.current as any).__historyToggle === "function"
    ) {
      (headerRef.current as any).__historyToggle();
    }
  };

  if (!user) {
    return null;
  }

  return (
    <header
      ref={headerRef}
      className="border-b pl-4 pr-4 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-30"
    >
      <div className="flex h-16 items-center px-0 w-full justify-between">
        <div className="flex items-center gap-2 mr-6">
          <FileText className="h-5 w-5 text-primary" />
          <span className="font-bold text-lg">DocuMentor</span>
        </div>
        {/* <div className="flex-1 flex items-center">
          <Input
            value={documentTitle}
            onChange={(e) => setDocumentTitle(e.target.value)}
            className="h-9 max-w-[350px] border-none text-lg font-medium focus-visible:ring-1 transition-all focus:max-w-[450px] focus:placeholder:opacity-0"
            aria-label="Document Title"
            placeholder="Untitled Document"
          />
        </div> */}
        <div className="flex items-center gap-3">
          <Button
            variant={showHistory ? "default" : "ghost"}
            size="sm"
            className={
              showHistory
                ? "text-foreground"
                : "text-muted-foreground hover:text-foreground transition-colors"
            }
            onClick={handleHistoryClick}
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
          <UserButton signInUrl="/sign-in" />
        </div>
      </div>
    </header>
  );
};
