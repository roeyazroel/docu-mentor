"use client";

import AiChatPanel from "@/components/ai-chat-panel";
import { ApiKeyErrorDisplay } from "@/components/editor/ApiKeyErrorDisplay";
import { EditorContentArea } from "@/components/editor/EditorContentArea";
import { EditorUsersPanel } from "@/components/editor/EditorUsersPanel";
import { SaveIndicator } from "@/components/editor/SaveIndicator";
import ProjectSidebar from "@/components/ProjectSidebar/project-sidebar";
import ResizablePanel from "@/components/resizable-panel";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useEditorContext } from "@/context/EditorContext";
import { useAiChat } from "@/lib/hooks/useAiChat";
import { useDocument } from "@/lib/hooks/useDocument";
import { useFileSystem } from "@/lib/hooks/useFileSystem";
import { useAuth, useUser } from "@clerk/nextjs";
import { MessageSquare, Users } from "lucide-react";
import { useRef } from "react";
import { DndProvider } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";

export default function EditorPage() {
  const { userId } = useAuth();
  const { isLoaded: isUserLoaded, user } = useUser();
  const { activeOrganization } = useEditorContext();

  const {
    ws,
    projectItems,
    setProjectItems,
    activeFileId,
    setActiveFileId,
    documentTitle,
    setDocumentTitle,
    documentContent,
    setDocumentContent,
    sessionId,
    connectionState,
    saveDocument,
    createFile,
    createFolder,
    handleFileSelect,
    deleteFile,
    deleteFolder,
    updateItemParent,
    hasUnsavedChanges,
    onlineUsers,
  } = useFileSystem(
    activeOrganization ?? null,
    userId ?? undefined,
    user?.primaryEmailAddress?.emailAddress ?? "You",
    user?.imageUrl ?? ""
  );

  const { saveStatus, setSaveStatus, handleSave } = useDocument(
    activeFileId,
    documentContent,
    documentTitle,
    saveDocument,
    hasUnsavedChanges
  );

  const {
    chatMessages,
    inputMessage,
    setInputMessage,
    isGenerating,
    chatContainerRef,
    hasApiKey,
    apiKeyError,
    aiSuggestion,
    showDiff,
    handleSendMessage,
    acceptAllChanges,
    rejectAllChanges,
    finalizeChanges,
  } = useAiChat(documentContent, setDocumentContent);

  const editorRef = useRef<HTMLDivElement>(null);

  return (
    <>
      <ApiKeyErrorDisplay apiKeyError={apiKeyError} />

      {!activeOrganization ? (
        <div className="flex items-center justify-center h-full w-full">
          <div className="text-muted-foreground text-sm">
            Loading organization...
          </div>
        </div>
      ) : (
        <div className="flex flex-1 overflow-hidden">
          {/* Project Sidebar - Resizable */}
          <ResizablePanel
            defaultWidth={240}
            minWidth={180}
            maxWidth={400}
            side="left"
          >
            <DndProvider backend={HTML5Backend}>
              <ProjectSidebar
                items={projectItems}
                activeFileId={activeFileId}
                onFileSelect={handleFileSelect}
                onUpdateItems={setProjectItems}
                onCreateFile={createFile}
                onCreateFolder={createFolder}
                onDeleteFile={deleteFile}
                onDeleteFolder={deleteFolder}
                onUpdateItemParent={updateItemParent}
                websocketManager={ws}
              />
            </DndProvider>
          </ResizablePanel>

          <EditorContentArea
            showDiff={showDiff}
            documentContent={documentContent}
            onDocumentContentChange={setDocumentContent}
            aiSuggestion={aiSuggestion}
            onAcceptAll={acceptAllChanges}
            onRejectAll={rejectAllChanges}
            onFinalizeChanges={finalizeChanges}
            activeFileId={activeFileId}
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
                <TabsList className="w-full justify-start h-[37px] rounded-none">
                  <TabsTrigger value="chat" className="flex items-center gap-1">
                    <MessageSquare className="h-4 w-4" />
                    AI Chat
                  </TabsTrigger>
                  <TabsTrigger
                    value="users"
                    className="flex items-center gap-1"
                  >
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
                  <EditorUsersPanel
                    activeUsers={onlineUsers.map((user) => ({
                      id: user.id,
                      name:
                        user.name ??
                        `User ${user.sessionId?.substring(0, 4) ?? user.id}`,
                      avatar: user.avatar ?? "",
                      status: "active",
                      sessionId: user.sessionId,
                      isCurrentSession: user.sessionId === sessionId,
                    }))}
                    currentUserId={userId || sessionId}
                  />
                </TabsContent>
              </Tabs>
            </div>
          </ResizablePanel>
        </div>
      )}

      {/* Floating save indicator */}
      <SaveIndicator saveStatus={saveStatus} />
    </>
  );
}
