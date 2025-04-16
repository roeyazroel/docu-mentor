"use client";

import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useProjectSidebarDialogs } from "@/hooks/useProjectSidebarDialogs";
import { useProjectSidebarRename } from "@/hooks/useProjectSidebarRename";
import { useSidebarDragAndDrop } from "@/hooks/useSidebarDragAndDrop";
import { Cloud, FilePlus, FolderPlus, HardDrive, LogIn } from "lucide-react";
import { useState } from "react";
import { ProjectSidebarDialogs } from "./ProjectSidebarDialogs";
import { ProjectSidebarItem } from "./ProjectSidebarItem";
import {
  ProjectItem,
  ProjectSidebarProps,
  StorageProvider,
} from "./ProjectSidebarTypes";
import {
  findParentById,
  sortItems,
  toggleFolder as toggleFolderUtil,
} from "./ProjectSidebarUtils";
import { OrganizationSwitcher } from "@clerk/nextjs";

export default function ProjectSidebar({
  items,
  activeFileId,
  onFileSelect,
  onUpdateItems,
}: ProjectSidebarProps) {
  // Dialog state/logic
  const dialogs = useProjectSidebarDialogs();
  // Rename state/logic
  const rename = useProjectSidebarRename(onUpdateItems, items);
  // Drag-and-drop state/logic
  const dnd = useSidebarDragAndDrop(items, onUpdateItems, findParentById);
  const [activeTab, setActiveTab] = useState<StorageProvider>("local");
  const [, setConnectDialogOpen] = useState(false);
  const [, setConnectingProvider] = useState<StorageProvider | null>(null);

  // Mock connected status for cloud providers
  const [connectedProviders, setConnectedProviders] = useState<{
    "google-drive": boolean;
    dropbox: boolean;
    box: boolean;
  }>({
    "google-drive": false,
    dropbox: false,
    box: false,
  });

  // Toggle folder expansion using utility
  const toggleFolder = (folderId: string) => {
    onUpdateItems(toggleFolderUtil(items, folderId));
  };

  // Create a new file or folder
  const createNewItem = () => {
    if (!dialogs.newItemName.trim()) return;
    const newItem: ProjectItem =
      dialogs.newItemType === "file"
        ? {
            id: `file-${Date.now()}`,
            name: dialogs.newItemName,
            type: "file",
            content: "",
            provider: activeTab,
          }
        : {
            id: `folder-${Date.now()}`,
            name: dialogs.newItemName,
            type: "folder",
            children: [],
            expanded: true,
            provider: activeTab,
          };
    if (dialogs.newItemParentId) {
      const addToFolder = (items: ProjectItem[]): ProjectItem[] => {
        return items.map((item) => {
          if (item.id === dialogs.newItemParentId && item.type === "folder") {
            return {
              ...item,
              children: [...item.children, newItem],
              expanded: true,
            };
          } else if (item.type === "folder" && item.children.length > 0) {
            return {
              ...item,
              children: addToFolder(item.children),
            };
          }
          return item;
        });
      };
      onUpdateItems(addToFolder(items));
    } else {
      onUpdateItems([...items, newItem]);
    }
    dialogs.setNewItemDialogOpen(false);
    if (dialogs.newItemType === "file") {
      onFileSelect(newItem.id);
    }
  };

  // Delete a file or folder
  const deleteItem = (itemId: string) => {
    const removeItem = (items: ProjectItem[]): ProjectItem[] => {
      return items.filter((item) => {
        if (item.id === itemId) {
          return false;
        } else if (item.type === "folder") {
          item.children = removeItem(item.children);
        }
        return true;
      });
    };
    onUpdateItems(removeItem(items));
  };

  // Handle connecting to a cloud provider
  const handleConnectProvider = (provider: StorageProvider) => {
    setConnectingProvider(provider);
    setConnectDialogOpen(true);
  };

  // Complete the connection to a cloud provider
  const completeConnection = () => {
    if (dialogs.connectingProvider) {
      setConnectedProviders({
        ...connectedProviders,
        [dialogs.connectingProvider]: true,
      });
    }
    dialogs.setConnectDialogOpen(false);
  };

  // Filter items by the active provider
  const filteredItems = items.filter((item) => item.provider === activeTab);

  // Get provider icon and color
  const getProviderIcon = (provider: StorageProvider) => {
    switch (provider) {
      case "google-drive":
        return { icon: <Cloud className="h-4 w-4" />, color: "text-blue-500" };
      case "dropbox":
        return { icon: <Cloud className="h-4 w-4" />, color: "text-blue-600" };
      case "box":
        return { icon: <Cloud className="h-4 w-4" />, color: "text-blue-400" };
      default:
        return {
          icon: <HardDrive className="h-4 w-4" />,
          color: "text-gray-500",
        };
    }
  };

  // Render
  return (
    <div
      className="flex flex-col h-full border-r"
      onDragOver={(e) => {
        e.preventDefault();
        e.dataTransfer.dropEffect = "move";
      }}
      onDrop={dnd.handleDropOnArea}
    >
      <div className="border-b">
        <Tabs
          value={activeTab}
          onValueChange={(value) => setActiveTab(value as StorageProvider)}
        >
          <TabsList className="w-full justify-start h-[37px] rounded-none">
            <TabsTrigger value="local" className="text-xs">
              Local
            </TabsTrigger>
            <TabsTrigger value="google-drive" className="text-xs">
              Drive
            </TabsTrigger>
            <TabsTrigger value="dropbox" className="text-xs">
              Dropbox
            </TabsTrigger>
            <TabsTrigger value="box" className="text-xs">
              Box
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      <div className="p-2 border-b flex items-center justify-between">
        <h2 className="text-sm font-medium">Explorer</h2>
        <div className="flex items-center">
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7"
            onClick={() => dialogs.openNewItemDialog("file")}
            title="New File"
          >
            <FilePlus className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7"
            onClick={() => dialogs.openNewItemDialog("folder")}
            title="New Folder"
          >
            <FolderPlus className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Show connect button for cloud providers if not connected */}
      {activeTab !== "local" && !connectedProviders[activeTab] && (
        <div className="p-4 text-center">
          <p className="text-sm text-muted-foreground mb-2">
            Connect to{" "}
            {activeTab === "google-drive"
              ? "Google Drive"
              : activeTab === "dropbox"
              ? "Dropbox"
              : "Box"}
            to access your files
          </p>
          <Button
            size="sm"
            onClick={() => handleConnectProvider(activeTab)}
            className="w-full"
          >
            <LogIn className="h-4 w-4 mr-2" />
            Connect
          </Button>
        </div>
      )}

      <ScrollArea className="flex-1">
        <div className="p-2">
          {filteredItems.length === 0 ? (
            <div className="text-sm text-muted-foreground p-2 text-center">
              {activeTab === "local" || connectedProviders[activeTab]
                ? "No files yet. Create a new file to get started."
                : "Connect to view your files."}
            </div>
          ) : (
            sortItems(filteredItems).map((item) => (
              <ProjectSidebarItem
                key={item.id}
                item={item}
                activeFileId={activeFileId}
                renamingItem={rename.renamingItem}
                dragOverItemId={dnd.dragOverItemId}
                dragOverIsFolder={dnd.dragOverIsFolder}
                dragPosition={dnd.dragPosition}
                draggedItem={dnd.draggedItem}
                onFileSelect={onFileSelect}
                onToggleFolder={toggleFolder}
                onStartRenaming={rename.startRenaming}
                onDeleteItem={deleteItem}
                onDragStart={dnd.handleDragStart}
                onDragOver={dnd.handleDragOver}
                onDragLeave={dnd.handleDragLeave}
                onDrop={dnd.handleDrop}
                onRenameInputChange={rename.updateRenamingName}
                onRenameInputBlur={rename.completeRename}
                onRenameInputKeyDown={(e) => {
                  if (e.key === "Enter") {
                    rename.completeRename();
                  } else if (e.key === "Escape") {
                    rename.cancelRename();
                  }
                }}
                getProviderIcon={getProviderIcon}
              />
            ))
          )}
        </div>
      </ScrollArea>

      <ProjectSidebarDialogs
        newItemDialogOpen={dialogs.newItemDialogOpen}
        setNewItemDialogOpen={dialogs.setNewItemDialogOpen}
        newItemType={dialogs.newItemType}
        newItemName={dialogs.newItemName}
        setNewItemName={dialogs.setNewItemName}
        createNewItem={createNewItem}
        connectDialogOpen={dialogs.connectDialogOpen}
        setConnectDialogOpen={dialogs.setConnectDialogOpen}
        connectingProvider={dialogs.connectingProvider}
        completeConnection={completeConnection}
      />
      <div className="p-3 border-t flex justify-center">
        <OrganizationSwitcher
          afterCreateOrganizationUrl={"/editor"}
          afterLeaveOrganizationUrl={"/editor"}
          afterSelectOrganizationUrl={"/editor"}
          appearance={{
            elements: {
              rootBox: "w-full",
              organizationSwitcherTrigger:
                "w-full py-2 flex justify-between items-center rounded-md bg-muted/50 hover:bg-muted transition-colors",
            },
          }}
        />
      </div>
    </div>
  );
}
