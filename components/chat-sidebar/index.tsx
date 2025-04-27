"use client";

import { useState, useEffect, useRef } from "react";
import { MessageSquare, Bot, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";
import ResizablePanel from "@/components/resizable-panel";
import Header from "./header";
import MessageList from "./message-list";
import InputBar from "./input-bar";

interface ChatSidebarProps {
  messages: Array<{ role: string; content: string; id?: string }>;
  inputMessage: string;
  setInputMessage: (value: string) => void;
  handleSendMessage: () => void;
  isGenerating: boolean;
  chatContainerRef: React.RefObject<HTMLDivElement>;
  apiKeyError?: string | null;
}

export default function ChatSidebar(props: ChatSidebarProps) {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  
  // Load collapsed state from localStorage
  useEffect(() => {
    const savedState = localStorage.getItem('chat-sidebar-collapsed');
    if (savedState) setIsCollapsed(savedState === 'true');
  }, []);
  
  // Save collapsed state
  useEffect(() => {
    localStorage.setItem('chat-sidebar-collapsed', isCollapsed.toString());
  }, [isCollapsed]);
  
  // Track unread messages
  useEffect(() => {
    if (isCollapsed && props.messages.length > 0) {
      const latestMessage = props.messages[props.messages.length - 1];
      if (latestMessage.role === 'assistant') {
        setUnreadCount(prev => prev + 1);
      }
    }
  }, [props.messages, isCollapsed]);

  // Clear unread count when expanded
  useEffect(() => {
    if (!isCollapsed) {
      setUnreadCount(0);
    }
  }, [isCollapsed]);

  // Register keyboard shortcut for toggle
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === '\\') {
        e.preventDefault();
        setIsCollapsed(prev => !prev);
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  if (isCollapsed) {
    return (
      <div className="h-full w-12 border-r flex flex-col items-center py-4 bg-white dark:bg-slate-900">
        <button 
          onClick={() => setIsCollapsed(false)}
          className="p-2 rounded-md hover:bg-slate-100 dark:hover:bg-slate-800 relative"
          aria-label="Expand chat sidebar"
        >
          <Sparkles className="w-5 h-5 text-indigo-500 dark:text-indigo-400" />
        </button>
      </div>
    );
  }

  return (
    <ResizablePanel
      defaultWidth={384}
      minWidth={280}
      maxWidth={480}
      side="left"
      className="border-r bg-white dark:bg-slate-900"
      storageKey="chat-sidebar-width"
    >
      <div className="flex flex-col h-full overflow-hidden">
        <Header 
          title="" 
          onCollapse={() => setIsCollapsed(true)} 
        />
        
        <MessageList
          messages={props.messages}
          isGenerating={props.isGenerating}
          containerRef={props.chatContainerRef}
        />
        
        <InputBar
          value={props.inputMessage}
          onChange={props.setInputMessage}
          onSubmit={props.handleSendMessage}
          isGenerating={props.isGenerating}
        />
      </div>
    </ResizablePanel>
  );
} 