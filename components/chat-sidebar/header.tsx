"use client";

import { ChevronLeft, Settings } from "lucide-react";
import { Button } from "@/components/ui/button";

interface HeaderProps {
  title: string;
  onCollapse: () => void;
  onSettings?: () => void;
}

export default function Header({ title, onCollapse, onSettings }: HeaderProps) {
  return (
    <div className="h-12 min-h-[48px] border-b flex items-center justify-between px-3">
      <h2 className="font-semibold text-sm">{title}</h2>
      <div className="flex gap-1">
        {onSettings && (
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={onSettings}
            className="h-8 w-8"
            aria-label="Chat settings"
          >
            <Settings className="h-4 w-4" />
          </Button>
        )}
        <Button 
          variant="ghost" 
          size="icon" 
          onClick={onCollapse}
          className="h-8 w-8"
          aria-label="Collapse sidebar"
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
} 