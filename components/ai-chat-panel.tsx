"use client";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Loader2, Send } from "lucide-react";
import { useEffect, useRef, type RefObject } from "react";

interface AiChatPanelProps {
  messages: Array<{ role: string; content: string; id?: string }>;
  inputMessage: string;
  setInputMessage: (value: string) => void;
  handleSendMessage: () => void;
  isGenerating: boolean;
  chatContainerRef: RefObject<HTMLDivElement>;
  apiKeyError?: string | null;
}

export default function AiChatPanel({
  messages,
  inputMessage,
  setInputMessage,
  handleSendMessage,
  isGenerating,
  chatContainerRef,
  apiKeyError,
}: AiChatPanelProps) {
  // Create a local ref if one isn't provided
  const localRef = useRef<HTMLDivElement>(null);
  const scrollRef = chatContainerRef || localRef;

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
    <>
      <div className="flex-1 flex flex-col overflow-hidden">
        <div
          ref={scrollRef}
          className="flex-1 overflow-y-auto p-4"
          style={{ maxHeight: "calc(100vh - 200px)" }}
        >
          <div className="space-y-4">
            {messages.map((message, index) => (
              <div
                key={message.id || index}
                className={`flex ${
                  message.role === "user" ? "justify-end" : "justify-start"
                }`}
              >
                <div
                  className={`flex gap-2 max-w-[80%] ${
                    message.role === "user" ? "flex-row-reverse" : ""
                  }`}
                >
                  <Avatar className="h-8 w-8 mt-0.5">
                    {message.role === "assistant" ? (
                      <AvatarFallback className="bg-primary text-primary-foreground">
                        AI
                      </AvatarFallback>
                    ) : (
                      <AvatarFallback>You</AvatarFallback>
                    )}
                  </Avatar>
                  <div className="flex flex-col">
                    <div
                      className={`rounded-lg p-3 text-sm ${
                        message.role === "user"
                          ? "bg-primary text-primary-foreground"
                          : "bg-muted"
                      }`}
                    >
                      {message.content}
                    </div>

                    {/* AI responses are automatically applied */}
                  </div>
                </div>
              </div>
            ))}

            {isGenerating && (
              <div className="flex justify-start">
                <div className="flex gap-2 max-w-[80%]">
                  <Avatar className="h-8 w-8 mt-0.5">
                    <AvatarFallback className="bg-primary text-primary-foreground">
                      AI
                    </AvatarFallback>
                  </Avatar>
                  <div className="rounded-lg p-3 text-sm bg-muted flex items-center gap-2">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Thinking...
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="p-4 border-t">
        <form
          className="flex gap-2"
          onSubmit={(e) => {
            e.preventDefault();
            handleSendMessage();
          }}
        >
          <Input
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            placeholder="Ask AI for help..."
            disabled={isGenerating}
          />
          <Button
            type="submit"
            size="icon"
            disabled={!inputMessage.trim() || isGenerating}
          >
            <Send className="h-4 w-4" />
          </Button>
        </form>
      </div>
    </>
  );
}
