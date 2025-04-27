"use client";

import { useState } from "react";
import { Check, Copy } from "lucide-react";
import { cn } from "@/lib/utils";

interface MessageBubbleProps {
  role: "user" | "assistant";
  content: string;
  timestamp?: Date;
  className?: string;
}

export default function MessageBubble({ 
  role, 
  content, 
  timestamp, 
  className 
}: MessageBubbleProps) {
  const [copied, setCopied] = useState(false);
  
  const copyToClipboard = () => {
    navigator.clipboard.writeText(content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  
  return (
    <div className="flex flex-col">
      {role === "assistant" && (
        <div className="text-xs font-medium text-slate-500 dark:text-slate-400 mb-1 ml-1">
          Documentor
        </div>
      )}
      <div 
        className={cn(
          "relative max-w-[85%] rounded-xl p-3.5",
          role === "user" 
            ? "bg-gradient-to-r from-indigo-600 to-purple-500 text-white self-end" 
            : "bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-100 self-start",
          className
        )}
        style={{ borderRadius: "0.75rem" }}
      >
        <div className="text-sm whitespace-pre-wrap">{content}</div>
        
        {/* Meta info - shown on hover */}
        <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
          <button
            onClick={copyToClipboard}
            className={cn(
              "p-1 rounded-md",
              role === "user" 
                ? "text-white/70 hover:text-white hover:bg-white/10" 
                : "text-slate-500 hover:text-slate-800 dark:hover:text-white hover:bg-slate-200 dark:hover:bg-slate-700"
            )}
            aria-label="Copy message"
          >
            {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
          </button>
        </div>
        
        {/* Optional timestamp */}
        {timestamp && (
          <div className="text-xs mt-1 opacity-70">
            {timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </div>
        )}
      </div>
    </div>
  );
} 