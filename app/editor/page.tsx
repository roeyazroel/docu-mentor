"use client";

import AiChatPanel from "@/components/ai-chat-panel";
import { AccessLogsPanel } from "@/components/editor/AccessLogsPanel";
import { EditorUsersPanel } from "@/components/editor/EditorUsersPanel";
import { FileHistoryEditor } from "@/components/editor/FileHistoryEditor";
import { SaveIndicator } from "@/components/editor/SaveIndicator";
import ProjectSidebar from "@/components/ProjectSidebar/project-sidebar";
import ResizablePanel from "@/components/resizable-panel";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useEditorContext } from "@/context/EditorContext";
import { useAiChat } from "@/lib/hooks/useAiChat";
import { useDocument } from "@/lib/hooks/useDocument";
import { useFileSystem } from "@/lib/hooks/useFileSystem";
import { useAuth, useUser } from "@clerk/nextjs";
import { ClipboardList, MessageSquare, Users } from "lucide-react";
import { useEffect, useState } from "react";
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
    accessLogs,
    fileVersions,
    revertToVersion,
    currentVersion,
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
    apiKeyError,
    aiSuggestion,
    showDiff,
    handleSendMessage,
    acceptAllChanges,
    rejectAllChanges,
    finalizeChanges,
  } = useAiChat(documentContent, setDocumentContent);

  // State for history panel
  const [showHistory, setShowHistory] = useState(false);

  // Update EditorHeader with history toggle - we'll use this to communicate with the header in ClientLayout
  useEffect(() => {
    // Find EditorHeader instance and update its props
    const headerComponent = document.querySelector("[data-header-component]");
    if (headerComponent) {
      // We're using a custom attribute to store the toggle function
      (headerComponent as any).__historyToggle = () =>
        setShowHistory(!showHistory);
      (headerComponent as any).__historyState = showHistory;
    }
  }, [showHistory]);

  return (
    <>
      {!activeOrganization ? (
        <div className="flex items-center justify-center h-full w-full">
          <div className="text-muted-foreground text-sm">
            Loading organization...
          </div>
        </div>
      ) : (
        <div className="flex flex-col h-full overflow-hidden">
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

            <FileHistoryEditor
              activeFileId={activeFileId}
              documentContent={documentContent}
              onDocumentContentChange={setDocumentContent}
              organizationId={activeOrganization}
              sessionId={sessionId}
              fileVersions={fileVersions || []}
              currentVersion={currentVersion}
              revertToVersion={revertToVersion}
              showDiff={showDiff}
              aiSuggestion={aiSuggestion}
              onAcceptAll={acceptAllChanges}
              onRejectAll={rejectAllChanges}
              onFinalizeChanges={finalizeChanges}
              showHistory={showHistory}
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
                    <TabsTrigger
                      value="chat"
                      className="flex items-center gap-1"
                    >
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
                    <TabsTrigger
                      value="logs"
                      className="flex items-center gap-1"
                    >
                      <ClipboardList className="h-4 w-4" />
                      Activity
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

                  <TabsContent
                    value="logs"
                    className="m-0 p-0 h-full overflow-auto"
                  >
                    <AccessLogsPanel logs={accessLogs} />
                  </TabsContent>
                </Tabs>
              </div>
            </ResizablePanel>
          </div>
        </div>
      )}

      {/* Floating save indicator */}
      <SaveIndicator saveStatus={saveStatus} />
    </>
  );
}
