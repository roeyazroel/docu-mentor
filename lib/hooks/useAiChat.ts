import { generateAiResponse } from "@/app/editor/actions";
import { hasOpenAIKey } from "@/lib/openai";
import { useCallback, useEffect, useRef, useState } from "react";

export type ChatMessage = {
  role: string;
  content: string;
  id: string;
};

/**
 * Hook for managing AI chat functionality and document suggestions
 * Extracted from app/editor/page.tsx to separate concerns
 */
export function useAiChat(
  documentContent: string,
  setDocumentContent: (content: string) => void
) {
  // Chat state
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([
    {
      role: "assistant",
      content:
        "Hello! I'm your AI writing assistant. How can I help with your document today?",
      id: "initial-message",
    },
  ]);
  const [inputMessage, setInputMessage] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);

  // API and error state
  const [hasApiKey, setHasApiKey] = useState(false);
  const [apiKeyError, setApiKeyError] = useState<string | null>(null);

  // Document suggestion state
  const [aiSuggestion, setAiSuggestion] = useState("");
  const [showDiff, setShowDiff] = useState(false);

  // Chat container ref for auto-scrolling - ensure it's the same type as expected by AiChatPanel
  const chatContainerRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom of chat when messages change
  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop =
        chatContainerRef.current.scrollHeight;
    }
  }, [chatMessages]);

  // Handle sending a chat message
  const handleSendMessage = useCallback(async () => {
    if (!inputMessage.trim()) return;

    const messageId = Date.now().toString();
    const userMessage = { role: "user", content: inputMessage, id: messageId };
    setChatMessages((prev) => [...prev, userMessage]);
    const currentInput = inputMessage;
    const messages = [
      ...chatMessages,
      { role: "user", content: currentInput, id: messageId },
    ];
    const currentDocContent = documentContent;
    console.log(
      "Sending message with document content:",
      currentDocContent.substring(0, 100) + "..."
    );
    setInputMessage("");
    setIsGenerating(true);
    setApiKeyError(null);

    try {
      let aiResponseContent: string;
      let aiResponseSummary: string;
      const apiKeyAvailable = await hasOpenAIKey();
      if (!apiKeyAvailable) {
        aiResponseContent =
          "I'm sorry, I encountered an error generating the AI response. Please try again.";
        aiResponseSummary =
          "I'm sorry, I encountered an error generating the AI response. Please try again.";
      } else {
        const aiResponse = await generateAiResponse(
          messages.map((message) => ({
            id: message.id,
            role: message.role as "user" | "assistant",
            content: message.content,
          })),
          currentDocContent
        );
        aiResponseContent = aiResponse.content ?? "";
        aiResponseSummary = aiResponse.summary;

        // Update chat with summary
        setChatMessages((prev) => [
          ...prev,
          {
            role: "assistant",
            content: aiResponseSummary,
            id: messageId + "-response",
          },
        ]);

        if (aiResponseContent !== "") {
          // Set the AI suggestion content and show the diff view
          setAiSuggestion(aiResponseContent);
          setShowDiff(true);
        }
      }
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
  }, [inputMessage, chatMessages, documentContent]);

  // Handle accepting all suggested changes
  const acceptAllChanges = useCallback(() => {
    // Simply replace the document content with AI suggestion
    setDocumentContent(aiSuggestion);
    setShowDiff(false);
    setAiSuggestion("");
    // No need to call saveDocument() as it will be triggered by the useEffect
  }, [aiSuggestion, setDocumentContent]);

  // Handle rejecting all suggested changes
  const rejectAllChanges = useCallback(() => {
    // Just close the diff view without changing the document
    setShowDiff(false);
    setAiSuggestion("");
  }, []);

  // Handle finalizing changes (applied via EditorContentArea)
  const finalizeChanges = useCallback(() => {
    // The new text is now applied via the onFinalizeChanges callback in EditorContentArea
    setShowDiff(false);
    setAiSuggestion("");
  }, []);

  return {
    // Chat state
    chatMessages,
    inputMessage,
    setInputMessage,
    isGenerating,
    chatContainerRef,

    // API state
    hasApiKey,
    apiKeyError,

    // Suggestion state
    aiSuggestion,
    showDiff,

    // Actions
    handleSendMessage,
    acceptAllChanges,
    rejectAllChanges,
    finalizeChanges,
  };
}
