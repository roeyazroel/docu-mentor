"use client";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useEditorContext } from "@/context/EditorContext";
import { useProjectSidebarDialogs } from "@/hooks/useProjectSidebarDialogs";
import { useProjectSidebarRename } from "@/hooks/useProjectSidebarRename";
import { useSidebarDragAndDrop } from "@/hooks/useSidebarDragAndDrop";
import { OrganizationSwitcher } from "@clerk/nextjs";
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

// Extend ProjectSidebarProps to accept onCreateFile and onDeleteFile
export interface ExtendedProjectSidebarProps extends ProjectSidebarProps {
  onCreateFile: (
    name: string,
    parentId: string | null,
    content?: string
  ) => void;
  onCreateFolder?: (name: string, parentId: string | null) => void;
  onDeleteFile: (fileId: string) => void;
  onUpdateItemParent?: (
    itemId: string,
    parentId: string | null,
    itemType: "file" | "folder"
  ) => void;
  websocketManager?: any;
}

export default function ProjectSidebar({
  items,
  activeFileId,
  onFileSelect,
  onUpdateItems,
  onCreateFile,
  onCreateFolder,
  onDeleteFile,
  onDeleteFolder,
  onUpdateItemParent,
  websocketManager,
}: ExtendedProjectSidebarProps) {
  // Dialog state/logic
  const dialogs = useProjectSidebarDialogs();
  // Rename state/logic
  const rename = useProjectSidebarRename(onUpdateItems, items);
  // Drag-and-drop state/logic
  const dnd = useSidebarDragAndDrop(
    items,
    onUpdateItems,
    findParentById,
    onUpdateItemParent
  );
  const [activeTab, setActiveTab] = useState<StorageProvider>("local");
  const [, setConnectDialogOpen] = useState(false);
  const [, setConnectingProvider] = useState<StorageProvider | null>(null);
  // Delete confirmation dialog state
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<{
    id: string;
    name: string;
    type: "file" | "folder";
  } | null>(null);

  const { activeOrganization, setActiveOrganization } = useEditorContext();

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

    if (dialogs.newItemType === "file") {
      // Create file through backend
      onCreateFile(dialogs.newItemName, dialogs.newItemParentId || null, "");
    } else if (dialogs.newItemType === "folder") {
      // Create folder through backend
      if (onCreateFolder) {
        onCreateFolder(dialogs.newItemName, dialogs.newItemParentId || null);
      } else {
        // Fallback if onCreateFolder prop is not provided
        onCreateFile(dialogs.newItemName, dialogs.newItemParentId || null);
      }
    }

    dialogs.setNewItemDialogOpen(false);
  };

  // Delete a file or folder
  const deleteItem = (itemId: string) => {
    // Find the item to get its details
    const findItem = (items: ProjectItem[]): ProjectItem | null => {
      for (const item of items) {
        if (item.id === itemId) {
          return item;
        } else if (item.type === "folder") {
          const found = findItem(item.children);
          if (found) return found;
        }
      }
      return null;
    };

    const item = findItem(items);
    if (item) {
      // Open confirmation dialog
      setItemToDelete({
        id: item.id,
        name: item.name,
        type: item.type,
      });
      setDeleteDialogOpen(true);
    }
  };

  // Actually perform the delete operation after confirmation
  const confirmDelete = () => {
    if (!itemToDelete) return;

    const removeItem = (items: ProjectItem[]): ProjectItem[] => {
      return items.filter((item) => {
        if (item.id === itemToDelete.id) {
          return false;
        } else if (item.type === "folder") {
          item.children = removeItem(item.children);
        }
        return true;
      });
    };

    onUpdateItems(removeItem(items));
    // Call the prop to delete the file in backend
    if (itemToDelete.type === "file") {
      onDeleteFile(itemToDelete.id);
    } else if (itemToDelete.type === "folder") {
      onDeleteFolder(itemToDelete.id);
    }
    setDeleteDialogOpen(false);
    setItemToDelete(null);
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

  // Handle rename submission
  const handleRenameComplete = () => {
    console.log(
      "handleRenameComplete called, websocketManager:",
      websocketManager
    );

    if (!websocketManager) {
      console.warn("websocketManager is not available, rename may not work");
    }

    rename.completeRename(websocketManager);
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
                onRenameInputBlur={handleRenameComplete}
                onRenameInputKeyDown={(e) => {
                  if (e.key === "Enter") {
                    handleRenameComplete();
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

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete {itemToDelete?.type}</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete {itemToDelete?.name}?
              {itemToDelete?.type === "folder" &&
                " This will delete all files and folders within it."}
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setItemToDelete(null)}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <div className="p-3 border-t flex justify-center">
        <OrganizationSwitcher
          afterCreateOrganizationUrl={(organization) => {
            console.log("organization", organization);
            setActiveOrganization(organization.id);
            return "/editor";
          }}
          afterLeaveOrganizationUrl={"/editor"}
          afterSelectOrganizationUrl={(organization) => {
            console.log("organization", organization);
            setActiveOrganization(organization.id);
            return "/editor";
          }}
          afterSelectPersonalUrl={(personal) => {
            console.log("personal", personal);
            setActiveOrganization(personal.id);
            return "/editor";
          }}
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
