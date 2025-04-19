import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { FileText } from "lucide-react";
import React from "react";
import { ProjectSidebarContextMenu } from "./ProjectSidebarContextMenu";
import { FileItem, StorageProvider } from "./ProjectSidebarTypes";

/**
 * Props for ProjectSidebarFileItem.
 */
export interface ProjectSidebarFileItemProps {
  item: FileItem;
  depth?: number;
  activeFileId: string | null;
  renamingItem: { id: string; name: string; type: "file" | "folder" } | null;
  dragOverItemId: string | null;
  dragOverIsFolder: boolean;
  dragPosition: "top" | "middle" | "bottom" | null;
  draggedItem: any;
  onFileSelect: (fileId: string) => void;
  onStartRenaming: (item: {
    id: string;
    name: string;
    type: "file" | "folder";
  }) => void;
  onDeleteItem: (itemId: string) => void;
  onDragStart: (e: React.DragEvent, item: any) => void;
  onDragOver: (e: React.DragEvent, item: any) => void;
  onDragLeave: (e: React.DragEvent) => void;
  onDrop: (e: React.DragEvent, item: any) => void;
  onRenameInputChange: (name: string) => void;
  onRenameInputBlur: () => void;
  onRenameInputKeyDown: (e: React.KeyboardEvent) => void;
  getProviderIcon: (provider: StorageProvider) => {
    icon: React.ReactNode;
    color: string;
  };
}

/**
 * Renders a file item in the sidebar, including drag-and-drop, renaming, and context menu.
 */
export function ProjectSidebarFileItem({
  item,
  depth = 0,
  activeFileId,
  renamingItem,
  dragOverItemId,
  dragOverIsFolder,
  dragPosition,
  draggedItem,
  onFileSelect,
  onStartRenaming,
  onDeleteItem,
  onDragStart,
  onDragOver,
  onDragLeave,
  onDrop,
  onRenameInputChange,
  onRenameInputBlur,
  onRenameInputKeyDown,
  getProviderIcon,
}: ProjectSidebarFileItemProps) {
  const isActive = item.id === activeFileId;
  const providerInfo = getProviderIcon(item.provider);
  const isDragOver = dragOverItemId === item.id;
  const isDragging = draggedItem && draggedItem.id === item.id;
  const isDropNotAllowed = draggedItem && draggedItem.type === "folder";

  return (
    <div
      style={{ paddingLeft: `${depth * 12}px` }}
      className={isDragging ? "opacity-50" : undefined}
    >
      <ProjectSidebarContextMenu
        itemId={item.id}
        itemName={item.name}
        itemType="file"
        onStartRenaming={onStartRenaming}
        onDeleteItem={onDeleteItem}
      >
        <div
          className={`flex items-center py-1 px-2 text-sm rounded-md ${
            isActive ? "bg-primary/10 text-primary" : "hover:bg-muted"
          } ${isDragOver ? "border-t-2 border-primary" : ""} ${
            isDropNotAllowed ? "cursor-not-allowed" : ""
          }`}
          onClick={() => onFileSelect(item.id)}
          draggable
          onDragStart={(e) => onDragStart(e, item)}
          onDragOver={(e) => {
            if (draggedItem && draggedItem.type === "folder") {
              e.dataTransfer.dropEffect = "none";
            }
            onDragOver(e, item);
          }}
          onDragLeave={onDragLeave}
          onDrop={(e) => onDrop(e, item)}
        >
          <FileText className={`h-4 w-4 mr-2 ${providerInfo.color}`} />
          {renamingItem && renamingItem.id === item.id ? (
            <Input
              value={renamingItem.name}
              onChange={(e) => onRenameInputChange(e.target.value)}
              onBlur={onRenameInputBlur}
              onKeyDown={onRenameInputKeyDown}
              className="h-6 py-0 px-1 text-xs"
              autoFocus
              onClick={(e) => e.stopPropagation()}
            />
          ) : (
            <span className="truncate">{item.name}</span>
          )}
          {item.provider !== "local" && (
            <Badge variant="outline" className="ml-2 px-1 py-0 text-[10px]">
              {item.provider === "google-drive"
                ? "Drive"
                : item.provider === "dropbox"
                ? "Dropbox"
                : "Box"}
            </Badge>
          )}
        </div>
      </ProjectSidebarContextMenu>
    </div>
  );
}
