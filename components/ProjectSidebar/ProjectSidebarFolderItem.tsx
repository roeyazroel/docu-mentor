import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Folder } from "lucide-react";
import React from "react";
import { ProjectSidebarContextMenu } from "./ProjectSidebarContextMenu";
import { FolderItem, StorageProvider } from "./ProjectSidebarTypes";

/**
 * Props for ProjectSidebarFolderItem.
 */
export interface ProjectSidebarFolderItemProps {
  item: FolderItem;
  depth?: number;
  activeFileId: string | null;
  renamingItem: { id: string; name: string; type: "file" | "folder" } | null;
  dragOverItemId: string | null;
  dragOverIsFolder: boolean;
  dragPosition: "top" | "middle" | "bottom" | null;
  draggedItem: any;
  onFileSelect: (fileId: string) => void;
  onToggleFolder: (folderId: string) => void;
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
  renderItem: (item: any, depth: number) => React.ReactNode;
}

/**
 * Renders a folder item in the sidebar, including recursive rendering of children.
 */
export function ProjectSidebarFolderItem({
  item,
  depth = 0,
  getProviderIcon,
  renderItem,
  ...rest
}: ProjectSidebarFolderItemProps) {
  const isExpanded = item.expanded;
  const providerInfo = getProviderIcon(item.provider);

  return (
    <div style={{ paddingLeft: `${depth * 12}px` }}>
      <ProjectSidebarContextMenu
        itemId={item.id}
        itemName={item.name}
        itemType="folder"
        onStartRenaming={rest.onStartRenaming}
        onDeleteItem={rest.onDeleteItem}
      >
        <div
          className="flex items-center py-1 px-2 text-sm rounded-md hover:bg-muted"
          onClick={() => rest.onToggleFolder(item.id)}
          draggable
          onDragStart={(e) => rest.onDragStart(e, item)}
          onDragOver={(e) => rest.onDragOver(e, item)}
          onDragLeave={rest.onDragLeave}
          onDrop={(e) => rest.onDrop(e, item)}
        >
          <Button
            variant="ghost"
            size="icon"
            className="h-4 w-4 p-0 mr-1"
            onClick={(e) => {
              e.stopPropagation();
              rest.onToggleFolder(item.id);
            }}
          >
            {isExpanded ? <span>&#9660;</span> : <span>&#9654;</span>}
          </Button>
          <Folder className={`h-4 w-4 mr-2 ${providerInfo.color}`} />
          {rest.renamingItem && rest.renamingItem.id === item.id ? (
            <Input
              value={rest.renamingItem.name}
              onChange={(e) => rest.onRenameInputChange(e.target.value)}
              onBlur={rest.onRenameInputBlur}
              onKeyDown={rest.onRenameInputKeyDown}
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
      {isExpanded && item.children.length > 0 && (
        <div>{item.children.map((child) => renderItem(child, depth + 1))}</div>
      )}
    </div>
  );
}
