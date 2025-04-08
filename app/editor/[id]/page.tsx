"use client";

import AiChatPanel from "@/components/ai-chat-panel";
import { ApiKeyErrorDisplay } from "@/components/editor/ApiKeyErrorDisplay";
import { EditorContentArea } from "@/components/editor/EditorContentArea";
import { EditorHeader } from "@/components/editor/EditorHeader";
import { EditorUsersPanel } from "@/components/editor/EditorUsersPanel";
import ProjectSidebar, { type ProjectItem } from "@/components/project-sidebar";
import ResizablePanel from "@/components/resizable-panel";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { generateMergeConflict } from "@/lib/diff-utils";
import { hasOpenAIKey } from "@/lib/openai";
import { cleanAiResponse } from "@/lib/text-processing";
import { MessageSquare, Users } from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import React, { useEffect, useRef, useState } from "react";
import { generateAiResponse } from "./actions";

// Mock initial project structure with storage providers
const initialProject: ProjectItem[] = [
  {
    id: "folder-1",
    name: "Documentation",
    type: "folder",
    expanded: true,
    provider: "local",
    children: [
      {
        id: "file-1",
        name: "README.md",
        type: "file",
        content:
          "# Project Documentation\n\nWelcome to the project documentation.",
        provider: "local",
      },
      {
        id: "file-2",
        name: "API.md",
        type: "file",
        content:
          "# API Documentation\n\nThis document describes the API endpoints.",
        provider: "local",
      },
    ],
  },
  {
    id: "file-3",
    name: "Notes.md",
    type: "file",
    content:
      "# Project Notes\n\nImportant things to remember about this project.",
    provider: "local",
  },
  {
    id: "folder-2",
    name: "Google Drive Files",
    type: "folder",
    expanded: true,
    provider: "google-drive",
    children: [
      {
        id: "file-4",
        name: "Project Plan.md",
        type: "file",
        content: "# Project Plan\n\nThis is our project plan for Q3.",
        provider: "google-drive",
      },
    ],
  },
  {
    id: "folder-3",
    name: "Dropbox Files",
    type: "folder",
    expanded: true,
    provider: "dropbox",
    children: [
      {
        id: "file-5",
        name: "Meeting Notes.md",
        type: "file",
        content: "# Meeting Notes\n\nNotes from our last team meeting.",
        provider: "dropbox",
      },
    ],
  },
];

export default function EditorPage() {
  const { id } = useParams();
  const router = useRouter();
  const [projectItems, setProjectItems] =
    useState<ProjectItem[]>(initialProject);
  const [activeFileId, setActiveFileId] = useState<string | null>("file-1");
  const [documentTitle, setDocumentTitle] = useState("Untitled Document");
  const [documentContent, setDocumentContent] = useState("");
  const [aiSuggestion, setAiSuggestion] = useState("");
  const [showDiff, setShowDiff] = useState(false);
  const [chatMessages, setChatMessages] = useState<
    Array<{ role: string; content: string; id: string }>
  >([
    {
      role: "assistant",
      content:
        "Hello! I'm your AI writing assistant. How can I help with your document today?",
      id: "initial-message",
    },
  ]);
  const [inputMessage, setInputMessage] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [activeUsers, setActiveUsers] = useState([
    { id: 1, name: "You", avatar: "", status: "active" },
    { id: 2, name: "Sarah K.", avatar: "", status: "active" },
  ]);
  const [hasApiKey, setHasApiKey] = useState(false);
  const [apiKeyError, setApiKeyError] = useState<string | null>(null);
  const [isSidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [saveStatus, setSaveStatus] = useState<"saved" | "saving" | "unsaved">(
    "saved"
  );
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const [mergeConflictText, setMergeConflictText] = useState("");

  const chatContainerRef = useRef<HTMLDivElement>(null);

  // Load the active file content when it changes
  useEffect(() => {
    if (activeFileId) {
      const findFileContent = (items: ProjectItem[]): string | null => {
        for (const item of items) {
          if (item.type === "file" && item.id === activeFileId) {
            setDocumentTitle(item.name);
            return item.content;
          } else if (item.type === "folder") {
            const content = findFileContent(item.children);
            if (content !== null) {
              return content;
            }
          }
        }
        return null;
      };

      const content = findFileContent(projectItems);
      if (content !== null) {
        setDocumentContent(content);
      }
    }
  }, [activeFileId, projectItems]);

  // Save the current document content to the project structure
  const saveDocument = () => {
    if (!activeFileId) return;

    const updateFileContent = (items: ProjectItem[]): ProjectItem[] => {
      return items.map((item) => {
        if (item.type === "file" && item.id === activeFileId) {
          return { ...item, content: documentContent, name: documentTitle };
        } else if (item.type === "folder") {
          return {
            ...item,
            children: updateFileContent(item.children),
          };
        }
        return item;
      });
    };

    setProjectItems(updateFileContent(projectItems));

    // In a real app, we would save to the server here
    // For example:
    // saveToServer(activeFileId, documentContent, documentTitle)
  };

  // Add this function to simulate saving to a server (for demonstration purposes)
  const saveToServer = async (
    fileId: string,
    content: string,
    title: string
  ) => {
    // In a real app, this would be an API call to save the document
    console.log(`Saving document ${fileId} with title "${title}" to server...`);
    // Simulate network delay
    await new Promise((resolve) => setTimeout(resolve, 300));
    console.log("Document saved successfully");
  };

  // Handle file selection from the sidebar
  const handleFileSelect = (fileId: string) => {
    // If there are unsaved changes, save immediately
    if (saveStatus !== "saved" && activeFileId) {
      saveDocument();
      setSaveStatus("saved");
    }
    setActiveFileId(fileId);
  };

  useEffect(() => {
    // Scroll to bottom of chat when new messages are added
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop =
        chatContainerRef.current.scrollHeight;
    }
  }, [chatMessages]);

  const handleSendMessage = async () => {
    if (!inputMessage.trim()) return;

    const messageId = Date.now().toString();
    const userMessage = { role: "user", content: inputMessage, id: messageId };
    setChatMessages((prev) => [...prev, userMessage]);
    const currentInput = inputMessage;
    setInputMessage("");
    setIsGenerating(true);
    setApiKeyError(null);

    try {
      let aiResponseContent: string;
      const apiKeyAvailable = hasOpenAIKey();

      if (!apiKeyAvailable) {
        // Use mock response if no API key is available
        await new Promise((resolve) => setTimeout(resolve, 1000)); // Simulate delay

        // Generate a mock response based on the input
        if (
          currentInput.toLowerCase().includes("improve") ||
          currentInput.toLowerCase().includes("enhance")
        ) {
          aiResponseContent =
            documentContent +
            "\n\nThis document effectively communicates the key points while maintaining a professional tone.";
        } else if (currentInput.toLowerCase().includes("summarize")) {
          aiResponseContent =
            "The document discusses key points about the project requirements and implementation details.";
        } else if (currentInput.toLowerCase().includes("help")) {
          aiResponseContent =
            "I can help you with your document in several ways:\n\n" +
            "- Improve the writing style and clarity\n" +
            "- Suggest additional content\n" +
            "- Summarize sections\n" +
            "- Check for consistency\n\n" +
            "Just let me know what you need!";
        } else {
          aiResponseContent =
            "I understand you're working on a document. Would you like me to help improve it, suggest additional content, or provide feedback on the current text?";
        }

        // Clean the mock response
        aiResponseContent = cleanAiResponse(aiResponseContent);

        setApiKeyError(
          "OpenAI API key is missing. Using mock responses for demo purposes."
        );
      } else {
        // Call the server action if key is available
        aiResponseContent = await generateAiResponse(
          currentInput,
          documentContent
        );
      }

      // Update chat and suggestion state regardless of mock/real response
      setChatMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: aiResponseContent,
          id: messageId + "-response",
        },
      ]);

      // Keep generating the merge conflict for backward compatibility
      const conflictText = generateMergeConflict(
        documentContent,
        aiResponseContent
      );

      // Set the AI suggestion and show the diff view
      setAiSuggestion(aiResponseContent);
      setMergeConflictText(conflictText);
      setShowDiff(true);
    } catch (error) {
      console.error("Error in handleSendMessage:", error);
      const errorMessage =
        error instanceof Error &&
        error.message === "Failed to generate AI response."
          ? "I'm sorry, I encountered an error generating the AI response. Please try again."
          : "I'm sorry, I encountered an unexpected error. The OpenAI API key might be missing or invalid.";

      setChatMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: errorMessage,
          id: messageId + "-error",
        },
      ]);
      setApiKeyError(
        "Error processing request. Please check your API key and connection, or try again later."
      );
    } finally {
      setIsGenerating(false);
    }
  };

  const acceptAllChanges = () => {
    // Simply replace the document content with AI suggestion
    setDocumentContent(aiSuggestion);
    setShowDiff(false);
    setAiSuggestion("");
    // No need to call saveDocument() as it will be triggered by the useEffect
  };

  const rejectAllChanges = () => {
    // Just close the diff view without changing the document
    setShowDiff(false);
    setAiSuggestion("");
  };

  const finalizeChanges = () => {
    // This is now handled by the SideBySideEditor through the EditorContentArea
    // The editor directly updates documentContent and calls this to hide diff
    setShowDiff(false);
    setAiSuggestion("");
  };

  useEffect(() => {
    // Check if OpenAI API key is available
    const checkApiKey = async () => {
      const apiKeyAvailable = await hasOpenAIKey();
      setHasApiKey(apiKeyAvailable);

      if (!apiKeyAvailable) {
        setApiKeyError(
          "OpenAI API key is missing. Using mock responses for demo purposes."
        );

        // Add a system message about the missing API key
        setChatMessages((prev) => [
          prev[0],
          {
            role: "assistant",
            content:
              "Note: This is running in demo mode without an OpenAI API key. AI responses are simulated for demonstration purposes.",
            id: "api-key-missing",
          },
        ]);
      }
    };

    checkApiKey();
  }, []);

  // Auto-save functionality
  useEffect(() => {
    if (!activeFileId) return;

    // Clear any existing timeout
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }

    // Set status to unsaved when content changes
    if (saveStatus === "saved") {
      setSaveStatus("unsaved");
    }

    // Set a timeout to save after 1 second of inactivity
    saveTimeoutRef.current = setTimeout(() => {
      setSaveStatus("saving");

      // Simulate a short delay for the save operation
      setTimeout(() => {
        saveDocument();
        setSaveStatus("saved");
      }, 300);
    }, 1000);

    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
    };
  }, [documentContent, documentTitle]);

  // Add this useEffect after the other useEffect hooks:
  // Warn user about unsaved changes when leaving the page
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (saveStatus !== "saved") {
        // Standard way to show a confirmation dialog when closing the page
        e.preventDefault();
        e.returnValue = "";
        return "";
      }
    };

    window.addEventListener("beforeunload", handleBeforeUnload);

    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, [saveStatus]);

  return (
    <div className="flex flex-col h-screen">
      <EditorHeader
        documentTitle={documentTitle}
        onDocumentTitleChange={setDocumentTitle}
        saveStatus={saveStatus}
      />

      <ApiKeyErrorDisplay apiKeyError={apiKeyError} />

      <div className="flex flex-1 overflow-hidden">
        {/* Project Sidebar - Resizable */}
        <ResizablePanel
          defaultWidth={240}
          minWidth={180}
          maxWidth={400}
          side="left"
        >
          <ProjectSidebar
            items={projectItems}
            activeFileId={activeFileId}
            onFileSelect={handleFileSelect}
            onUpdateItems={setProjectItems}
          />
        </ResizablePanel>

        <EditorContentArea
          showDiff={showDiff}
          documentContent={documentContent}
          onDocumentContentChange={setDocumentContent}
          aiSuggestion={aiSuggestion}
          mergeConflictText={mergeConflictText}
          onAcceptAll={acceptAllChanges}
          onRejectAll={rejectAllChanges}
          onFinalizeChanges={finalizeChanges}
        />

        {/* Chat Panel - Resizable */}
        <ResizablePanel
          defaultWidth={320}
          minWidth={280}
          maxWidth={500}
          side="right"
        >
          <div className="h-full flex flex-col overflow-hidden border-l">
            <Tabs defaultValue="chat">
              <TabsList className="w-full justify-start px-2 pt-2">
                <TabsTrigger value="chat" className="flex items-center gap-1">
                  <MessageSquare className="h-4 w-4" />
                  AI Chat
                </TabsTrigger>
                <TabsTrigger value="users" className="flex items-center gap-1">
                  <Users className="h-4 w-4" />
                  Users
                </TabsTrigger>
              </TabsList>

              <TabsContent
                value="chat"
                className="flex-1 flex flex-col overflow-hidden m-0 p-0"
              >
                <AiChatPanel
                  messages={chatMessages}
                  inputMessage={inputMessage}
                  setInputMessage={setInputMessage}
                  handleSendMessage={handleSendMessage}
                  isGenerating={isGenerating}
                  chatContainerRef={
                    chatContainerRef as React.RefObject<HTMLDivElement>
                  }
                  apiKeyError={apiKeyError}
                />
              </TabsContent>

              <TabsContent
                value="users"
                className="m-0 p-4 h-full overflow-auto"
              >
                <EditorUsersPanel activeUsers={activeUsers} />
              </TabsContent>
            </Tabs>
          </div>
        </ResizablePanel>
      </div>
    </div>
  );
}
