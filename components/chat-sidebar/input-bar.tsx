"use client";

import { useRef, useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import CustomPlaneIcon from "./custom-plane-icon";

interface InputBarProps {
  value: string;
  onChange: (value: string) => void;
  onSubmit: () => void;
  isGenerating: boolean;
}

export default function InputBar({
  value,
  onChange,
  onSubmit,
  isGenerating,
}: InputBarProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [selectedModel, setSelectedModel] = useState("gpt-4o");

  // Auto-resize textarea
  useEffect(() => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const adjustHeight = () => {
      textarea.style.height = "0";
      textarea.style.height = `${Math.min(textarea.scrollHeight, 150)}px`; // Max 6 rows (approx)
    };

    adjustHeight();
    window.addEventListener("resize", adjustHeight);
    return () => window.removeEventListener("resize", adjustHeight);
  }, [value]);

  // Handle keyboard shortcuts
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      if (!isGenerating && value.trim()) {
        onSubmit();
      }
    }
  };

  return (
    <div className="p-4 border-t sticky bottom-0 bg-white dark:bg-slate-900">
      <form
        onSubmit={(e) => {
          e.preventDefault();
          if (!isGenerating && value.trim()) {
            onSubmit();
          }
        }}
      >
        <div className="rounded-xl bg-slate-100 dark:bg-slate-800 overflow-hidden border border-transparent focus-within:border-indigo-500 dark:focus-within:border-indigo-400">
          {/* Input area */}
          <textarea
            ref={textareaRef}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask Documentor for help..."
            disabled={isGenerating}
            className="w-full resize-none py-3.5 px-4 bg-transparent border-none text-base focus:outline-none min-h-[52px] max-h-[150px]"
            style={{ scrollbarWidth: "thin" }}
          />
          
          {/* Model selection and send button - more compact */}
          <div className="flex items-center justify-between px-3 py-1 border-t border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/50">
            <Select
              value={selectedModel}
              onValueChange={setSelectedModel}
              disabled={isGenerating}
            >
              <SelectTrigger className="w-36 h-7 text-xs bg-white dark:bg-slate-800 border-none shadow-sm">
                <SelectValue placeholder="Select model" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="gpt-4o">GPT-4o</SelectItem>
                <SelectItem value="gpt-3.5">GPT-3.5 Turbo</SelectItem>
                <SelectItem value="claude-3">Claude 3 Opus</SelectItem>
                <SelectItem value="claude-3-sonnet">Claude 3 Sonnet</SelectItem>
                <SelectItem value="llama-3">Llama 3</SelectItem>
              </SelectContent>
            </Select>
            
            <Button
              type="submit"
              size="icon"
              className="h-7 w-7 rounded-full bg-gradient-to-r from-indigo-600 to-purple-500 hover:from-indigo-700 hover:to-purple-600 text-white shadow-sm"
              disabled={!value.trim() || isGenerating}
            >
              <CustomPlaneIcon className="h-3.5 w-3.5" />
            </Button>
          </div>
        </div>
      </form>
    </div>
  );
} 