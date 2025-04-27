"use client";

import { useEffect, useRef, type RefObject } from "react";
import { Loader2 } from "lucide-react";
import MessageBubble from "./message-bubble";

interface MessageListProps {
  messages: Array<{ role: string; content: string; id?: string }>;
  isGenerating: boolean;
  containerRef?: RefObject<HTMLDivElement>;
}

export default function MessageList({
  messages,
  isGenerating,
  containerRef,
}: MessageListProps) {
  // Create a local ref if one isn't provided
  const localRef = useRef<HTMLDivElement>(null);
  const scrollRef = containerRef || localRef;

  // Auto-scroll when messages change
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, scrollRef]);

  // Make sure scrolling works on mount and when messages change
  useEffect(() => {
    const scrollToBottom = () => {
      if (scrollRef.current) {
        scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
      }
    };

    scrollToBottom();
    // Set a small timeout to ensure content is rendered before scrolling
    const timeoutId = setTimeout(scrollToBottom, 100);

    return () => clearTimeout(timeoutId);
  }, [messages, scrollRef]);

  return (
    <div 
      ref={scrollRef}
      className="flex-1 overflow-y-auto p-4 bg-slate-50 dark:bg-slate-900 scroll-pt-4"
      style={{ scrollbarWidth: 'thin' }}
    >
      <div className="flex flex-col gap-3">
        {messages.map((message, index) => (
          <MessageBubble
            key={message.id || index}
            role={message.role as "user" | "assistant"}
            content={message.content}
          />
        ))}

        {isGenerating && (
          <div className="self-start max-w-[85%] rounded-xl p-3.5 bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-100 flex items-center gap-2">
            <Loader2 className="h-4 w-4 animate-spin" />
            <span className="text-sm">Thinking...</span>
          </div>
        )}
      </div>
    </div>
  );
} 