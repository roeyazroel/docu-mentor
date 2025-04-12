"use client";

import type React from "react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuTrigger,
} from "@/components/ui/context-menu";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";
import {
  ChevronDown,
  ChevronRight,
  Cloud,
  Edit,
  ExternalLink,
  FilePlus,
  FileText,
  Folder,
  FolderPlus,
  HardDrive,
  LogIn,
  Move,
  Trash,
} from "lucide-react";
import { useState } from "react";

export type StorageProvider = "local" | "google-drive" | "dropbox" | "box";

export type FileItem = {
  id: string;
  name: string;
  type: "file";
  content: string;
  provider: StorageProvider;
  iconColor?: string;
};

export type FolderItem = {
  id: string;
  name: string;
  type: "folder";
  children: (FileItem | FolderItem)[];
  expanded?: boolean;
  provider: StorageProvider;
  iconColor?: string;
};

export type ProjectItem = FileItem | FolderItem;

interface ProjectSidebarProps {
  items: ProjectItem[];
  activeFileId: string | null;
  onFileSelect: (fileId: string) => void;
  onUpdateItems: (items: ProjectItem[]) => void;
}

export default function ProjectSidebar({
  items,
  activeFileId,
  onFileSelect,
  onUpdateItems,
}: ProjectSidebarProps) {
  const [newItemDialogOpen, setNewItemDialogOpen] = useState(false);
  const [newItemType, setNewItemType] = useState<"file" | "folder">("file");
  const [newItemName, setNewItemName] = useState("");
  const [newItemParentId, setNewItemParentId] = useState<string | null>(null);
  const [renamingItem, setRenamingItem] = useState<{
    id: string;
    name: string;
    type: "file" | "folder";
  } | null>(null);
  const [activeTab, setActiveTab] = useState<StorageProvider>("local");
  const [connectDialogOpen, setConnectDialogOpen] = useState(false);
  const [connectingProvider, setConnectingProvider] =
    useState<StorageProvider | null>(null);
  const [draggedItem, setDraggedItem] = useState<ProjectItem | null>(null);
  const [dragOverItemId, setDragOverItemId] = useState<string | null>(null);
  const [dragOverIsFolder, setDragOverIsFolder] = useState(false);
  const [dragPosition, setDragPosition] = useState<
    "top" | "middle" | "bottom" | null
  >(null);

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

  // Toggle folder expansion
  const toggleFolder = (folderId: string) => {
    const updateFolderExpansion = (items: ProjectItem[]): ProjectItem[] => {
      return items.map((item) => {
        if (item.type === "folder") {
          if (item.id === folderId) {
            return { ...item, expanded: !item.expanded };
          } else if (item.children.length > 0) {
            return {
              ...item,
              children: updateFolderExpansion(item.children),
            };
          }
        }
        return item;
      });
    };

    onUpdateItems(updateFolderExpansion(items));
  };

  // Open dialog to create a new file or folder
  const handleNewItem = (
    type: "file" | "folder",
    parentId: string | null = null
  ) => {
    setNewItemType(type);
    setNewItemName("");
    setNewItemParentId(parentId);
    setNewItemDialogOpen(true);
  };

  // Create a new file or folder
  const createNewItem = () => {
    if (!newItemName.trim()) return;

    const newItem: ProjectItem =
      newItemType === "file"
        ? {
            id: `file-${Date.now()}`,
            name: newItemName,
            type: "file",
            content: "",
            provider: activeTab,
          }
        : {
            id: `folder-${Date.now()}`,
            name: newItemName,
            type: "folder",
            children: [],
            expanded: true,
            provider: activeTab,
          };

    // If parent is specified, add to that folder
    if (newItemParentId) {
      const addToFolder = (items: ProjectItem[]): ProjectItem[] => {
        return items.map((item) => {
          if (item.id === newItemParentId && item.type === "folder") {
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
      // Add to root
      onUpdateItems([...items, newItem]);
    }

    setNewItemDialogOpen(false);

    // If it's a file, select it
    if (newItemType === "file") {
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

  // Start renaming an item
  const startRenaming = (item: {
    id: string;
    name: string;
    type: "file" | "folder";
  }) => {
    setRenamingItem(item);
  };

  // Complete the rename operation
  const completeRename = () => {
    if (!renamingItem || !renamingItem.name.trim()) {
      setRenamingItem(null);
      return;
    }

    const renameItemInTree = (items: ProjectItem[]): ProjectItem[] => {
      return items.map((item) => {
        if (item.id === renamingItem.id) {
          return { ...item, name: renamingItem.name };
        } else if (item.type === "folder") {
          return {
            ...item,
            children: renameItemInTree(item.children),
          };
        }
        return item;
      });
    };

    onUpdateItems(renameItemInTree(items));
    setRenamingItem(null);
  };

  // Handle connecting to a cloud provider
  const handleConnectProvider = (provider: StorageProvider) => {
    setConnectingProvider(provider);
    setConnectDialogOpen(true);
  };

  // Complete the connection to a cloud provider
  const completeConnection = () => {
    if (connectingProvider) {
      setConnectedProviders({
        ...connectedProviders,
        [connectingProvider]: true,
      });
    }
    setConnectDialogOpen(false);
  };

  // Find an item by ID in the tree
  const findItemById = (
    id: string,
    items: ProjectItem[]
  ): ProjectItem | null => {
    for (const item of items) {
      if (item.id === id) {
        return item;
      }
      if (item.type === "folder") {
        const found = findItemById(id, item.children);
        if (found) return found;
      }
    }
    return null;
  };

  // Find the parent of an item by ID
  const findParentById = (
    id: string,
    items: ProjectItem[],
    parent: ProjectItem | null = null
  ): ProjectItem | null => {
    for (const item of items) {
      if (item.id === id) {
        return parent;
      }
      if (item.type === "folder") {
        const found = findParentById(id, item.children, item);
        if (found) return found;
      }
    }
    return null;
  };

  // Handle drag start
  const handleDragStart = (e: React.DragEvent, item: ProjectItem) => {
    e.stopPropagation();
    setDraggedItem(item);
    e.dataTransfer.setData("text/plain", item.id);
    e.dataTransfer.effectAllowed = "move";

    // Create a custom drag image
    const dragImage = document.createElement("div");
    dragImage.className =
      "bg-background border rounded p-2 shadow-md flex items-center gap-2 text-sm";

    const icon = document.createElement("span");
    icon.className = item.type === "folder" ? "text-blue-500" : "text-gray-500";
    icon.innerHTML =
      item.type === "folder"
        ? '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 20h16a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2h-7.93a2 2 0 0 1-1.66-.9l-.82-1.2A2 2 0 0 0 7.93 3H4a2 2 0 0 0-2 2v13c0 1.1.9 2 2 2Z"></path></svg>'
        : '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"></path><polyline points="14 2 14 8 20 8"></polyline></svg>';

    const text = document.createElement("span");
    text.textContent = item.name;

    dragImage.appendChild(icon);
    dragImage.appendChild(text);
    document.body.appendChild(dragImage);

    // Set the drag image
    e.dataTransfer.setDragImage(dragImage, 15, 15);

    // Remove the drag image after a short delay
    setTimeout(() => {
      document.body.removeChild(dragImage);
    }, 0);
  };

  // Handle drag over
  const handleDragOver = (e: React.DragEvent, item: ProjectItem) => {
    e.preventDefault();
    e.stopPropagation();

    if (!draggedItem || draggedItem.id === item.id) {
      setDragOverItemId(null);
      return;
    }

    // Prevent dragging a folder into its own child
    if (draggedItem.type === "folder") {
      const isChild = (parent: FolderItem, childId: string): boolean => {
        if (parent.id === childId) return true;
        for (const child of parent.children) {
          if (
            child.type === "folder" &&
            isChild(child as FolderItem, childId)
          ) {
            return true;
          }
        }
        return false;
      };

      if (
        item.type === "folder" &&
        isChild(draggedItem as FolderItem, item.id)
      ) {
        setDragOverItemId(null);
        return;
      }
    }

    setDragOverItemId(item.id);
    setDragOverIsFolder(item.type === "folder");

    // Determine drop position (top, middle, bottom)
    const rect = e.currentTarget.getBoundingClientRect();
    const y = e.clientY - rect.top;

    if (item.type === "folder") {
      // For folders, we have three zones: top (insert before), middle (insert inside), bottom (insert after)
      if (y < rect.height * 0.25) {
        setDragPosition("top");
      } else if (y > rect.height * 0.75) {
        setDragPosition("bottom");
      } else {
        setDragPosition("middle");
      }
    } else {
      // For files, we have two zones: top (insert before), bottom (insert after)
      setDragPosition(y < rect.height / 2 ? "top" : "bottom");
    }

    e.dataTransfer.dropEffect = "move";
  };

  // Handle drag leave
  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragOverItemId(null);
    setDragPosition(null);
  };

  // Handle drop
  const handleDrop = (e: React.DragEvent, targetItem: ProjectItem) => {
    e.preventDefault();
    e.stopPropagation();

    if (!draggedItem) return;

    // Reset drag state
    setDragOverItemId(null);
    setDragPosition(null);

    // Don't do anything if dropping onto itself
    if (draggedItem.id === targetItem.id) {
      setDraggedItem(null);
      return;
    }

    // First, create a deep clone of the dragged item to avoid reference issues
    const draggedItemClone = JSON.parse(JSON.stringify(draggedItem));

    // Clone the items array to avoid direct mutation
    let newItems = JSON.parse(JSON.stringify(items));

    // Remove the dragged item from its original position
    const removeItem = (items: ProjectItem[]): ProjectItem[] => {
      return items
        .map((item) => {
          if (item.id === draggedItem.id) {
            return null; // Mark for removal
          }

          if (item.type === "folder") {
            const newChildren = removeItem(item.children).filter(Boolean); // Remove null items
            return {
              ...item,
              children: newChildren,
            };
          }

          return item;
        })
        .filter((item): item is ProjectItem => item !== null); // Type guard to ensure non-null items
    };

    newItems = removeItem(newItems);

    // Add the dragged item to its new position
    if (dragPosition === "middle" && targetItem.type === "folder") {
      // Insert inside the folder
      const addToFolder = (items: ProjectItem[]): ProjectItem[] => {
        return items.map((item) => {
          if (item.id === targetItem.id && item.type === "folder") {
            return {
              ...item,
              expanded: true, // Expand the folder when dropping into it
              children: [...item.children, draggedItemClone],
            };
          } else if (item.type === "folder") {
            return {
              ...item,
              children: addToFolder(item.children),
            };
          }
          return item;
        });
      };

      newItems = addToFolder(newItems);
    } else {
      // Insert before or after the target item
      const insertAtPosition = (
        items: ProjectItem[],
        parentId: string | null
      ): ProjectItem[] => {
        if (parentId === null) {
          // Handle root level insertion
          const targetIndex = items.findIndex(
            (item) => item.id === targetItem.id
          );
          if (targetIndex !== -1) {
            const insertIndex =
              dragPosition === "top" ? targetIndex : targetIndex + 1;
            items.splice(insertIndex, 0, draggedItemClone);
          }
          return items;
        }

        // Handle nested insertion
        return items.map((item) => {
          if (item.id === parentId && item.type === "folder") {
            const targetIndex = item.children.findIndex(
              (child) => child.id === targetItem.id
            );
            if (targetIndex !== -1) {
              const newChildren = [...item.children];
              const insertIndex =
                dragPosition === "top" ? targetIndex : targetIndex + 1;
              newChildren.splice(insertIndex, 0, draggedItemClone);
              return { ...item, children: newChildren };
            }
          } else if (item.type === "folder") {
            return {
              ...item,
              children: insertAtPosition(item.children, parentId),
            };
          }
          return item;
        });
      };

      // Find the parent of the target item
      const targetParent = findParentById(targetItem.id, items);
      newItems = insertAtPosition(
        newItems,
        targetParent ? targetParent.id : null
      );
    }

    // Update the items
    onUpdateItems(newItems);
    setDraggedItem(null);
  };

  // Handle drop on empty area or folder
  const handleDropOnArea = (e: React.DragEvent) => {
    e.preventDefault();

    if (!draggedItem) return;

    // Reset drag state
    setDragOverItemId(null);
    setDragPosition(null);

    // Create a deep clone of the dragged item
    const draggedItemClone = JSON.parse(JSON.stringify(draggedItem));

    // Clone the items array to avoid direct mutation
    let newItems = JSON.parse(JSON.stringify(items));

    // Remove the dragged item from its original position
    const removeItem = (items: ProjectItem[]): ProjectItem[] => {
      return items
        .map((item) => {
          if (item.id === draggedItem.id) {
            return null; // Mark for removal
          } else if (item.type === "folder") {
            return {
              ...item,
              children: removeItem(item.children),
            };
          }
          return item;
        })
        .filter((item): item is ProjectItem => item !== null); // Type guard to ensure non-null items
    };

    newItems = removeItem(newItems);

    // Add the dragged item to the root level
    newItems.push(draggedItemClone);

    // Update the items
    onUpdateItems(newItems);
    setDraggedItem(null);
  };

  // Filter items by the active provider
  const filteredItems = items.filter((item) => item.provider === activeTab);

  // Sort items by type and name (folders first, then files, both alphabetically)
  const sortItems = (items: ProjectItem[]): ProjectItem[] => {
    return [...items].sort((a, b) => {
      // Sort folders before files
      if (a.type !== b.type) {
        return a.type === "folder" ? -1 : 1;
      }

      // Sort alphabetically by name (case-insensitive)
      return a.name.toLowerCase().localeCompare(b.name.toLowerCase());
    });
  };

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

  // Render a file or folder item
  const renderItem = (item: ProjectItem, depth = 0) => {
    const isActive = item.type === "file" && item.id === activeFileId;
    const isFolder = item.type === "folder";
    const isExpanded = isFolder && item.expanded;
    const providerInfo = getProviderIcon(item.provider);
    const isDragOver = dragOverItemId === item.id;
    const isDragging = draggedItem && draggedItem.id === item.id;

    return (
      <div
        key={item.id}
        style={{ paddingLeft: `${depth * 12}px` }}
        className={cn("relative", isDragging && "opacity-50")}
      >
        <ContextMenu>
          <ContextMenuTrigger>
            <div
              className={cn(
                "flex items-center py-1 px-2 text-sm rounded-md",
                isActive ? "bg-primary/10 text-primary" : "hover:bg-muted",
                isDragOver &&
                  dragPosition === "top" &&
                  "border-t-2 border-primary",
                isDragOver &&
                  dragPosition === "bottom" &&
                  "border-b-2 border-primary",
                isDragOver &&
                  dragPosition === "middle" &&
                  isFolder &&
                  "bg-primary/5 outline outline-2 outline-primary/30"
              )}
              onClick={() => {
                if (isFolder) {
                  toggleFolder(item.id);
                } else {
                  onFileSelect(item.id);
                }
              }}
              draggable
              onDragStart={(e) => handleDragStart(e, item)}
              onDragOver={(e) => handleDragOver(e, item)}
              onDragLeave={handleDragLeave}
              onDrop={(e) => handleDrop(e, item)}
            >
              {isFolder ? (
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-4 w-4 p-0 mr-1"
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleFolder(item.id);
                  }}
                >
                  {isExpanded ? (
                    <ChevronDown className="h-3.5 w-3.5" />
                  ) : (
                    <ChevronRight className="h-3.5 w-3.5" />
                  )}
                </Button>
              ) : (
                <div className="w-4 mr-1" />
              )}

              {isFolder ? (
                <Folder className={`h-4 w-4 mr-2 ${providerInfo.color}`} />
              ) : (
                <FileText className={`h-4 w-4 mr-2 ${providerInfo.color}`} />
              )}

              {renamingItem && renamingItem.id === item.id ? (
                <Input
                  value={renamingItem.name}
                  onChange={(e) =>
                    setRenamingItem({ ...renamingItem, name: e.target.value })
                  }
                  onBlur={completeRename}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      completeRename();
                    } else if (e.key === "Escape") {
                      setRenamingItem(null);
                    }
                  }}
                  className="h-6 py-0 px-1 text-xs"
                  autoFocus
                  onClick={(e) => e.stopPropagation()}
                />
              ) : (
                <span className="truncate">{item.name}</span>
              )}

              {/* Show a small badge for cloud items */}
              {item.provider !== "local" && (
                <Badge variant="outline" className="ml-2 px-1 py-0 text-[10px]">
                  {item.provider === "google-drive"
                    ? "Drive"
                    : item.provider === "dropbox"
                    ? "Dropbox"
                    : "Box"}
                </Badge>
              )}

              {/* Show drag indicator */}
              <Move className="h-3 w-3 ml-auto opacity-0 group-hover:opacity-50 cursor-move" />
            </div>
          </ContextMenuTrigger>
          <ContextMenuContent className="w-48">
            {isFolder && (
              <ContextMenuItem
                onClick={() => handleNewItem("file", item.id)}
                className="flex items-center"
              >
                <FilePlus className="h-4 w-4 mr-2" />
                New File
              </ContextMenuItem>
            )}
            {isFolder && (
              <ContextMenuItem
                onClick={() => handleNewItem("folder", item.id)}
                className="flex items-center"
              >
                <FolderPlus className="h-4 w-4 mr-2" />
                New Folder
              </ContextMenuItem>
            )}
            <ContextMenuItem
              onClick={() =>
                startRenaming({ id: item.id, name: item.name, type: item.type })
              }
              className="flex items-center"
            >
              <Edit className="h-4 w-4 mr-2" />
              Rename
            </ContextMenuItem>
            <ContextMenuItem
              onClick={() => deleteItem(item.id)}
              className="flex items-center text-destructive focus:text-destructive"
            >
              <Trash className="h-4 w-4 mr-2" />
              Delete
            </ContextMenuItem>
          </ContextMenuContent>
        </ContextMenu>

        {isFolder && isExpanded && item.children.length > 0 && (
          <div>
            {sortItems(item.children).map((child) =>
              renderItem(child, depth + 1)
            )}
          </div>
        )}
      </div>
    );
  };

  return (
    <div
      className="flex flex-col h-full border-r"
      onDragOver={(e) => {
        e.preventDefault();
        e.dataTransfer.dropEffect = "move";
      }}
      onDrop={handleDropOnArea}
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
            onClick={() => handleNewItem("file")}
            title="New File"
          >
            <FilePlus className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7"
            onClick={() => handleNewItem("folder")}
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
            sortItems(filteredItems).map((item) => renderItem(item))
          )}
        </div>
      </ScrollArea>

      <Dialog open={newItemDialogOpen} onOpenChange={setNewItemDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>
              {newItemType === "file" ? "Create New File" : "Create New Folder"}
            </DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <Input
              value={newItemName}
              onChange={(e) => setNewItemName(e.target.value)}
              placeholder={newItemType === "file" ? "File name" : "Folder name"}
              className="w-full"
              autoFocus
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  createNewItem();
                }
              }}
            />
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setNewItemDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button onClick={createNewItem}>Create</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={connectDialogOpen} onOpenChange={setConnectDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>
              Connect to{" "}
              {connectingProvider === "google-drive"
                ? "Google Drive"
                : connectingProvider === "dropbox"
                ? "Dropbox"
                : "Box"}
            </DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <p className="text-sm text-muted-foreground mb-4">
              You'll be redirected to authenticate with your account. This is a
              demo, so no actual authentication will occur.
            </p>
            <Button className="w-full" onClick={completeConnection}>
              <ExternalLink className="h-4 w-4 mr-2" />
              Authenticate
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
