import React from "react";
import { ProjectSidebarFileItem } from "./ProjectSidebarFileItem";
import { ProjectSidebarFolderItem } from "./ProjectSidebarFolderItem";
import { ProjectItem, StorageProvider } from "./ProjectSidebarTypes";

/**
 * Props for ProjectSidebarItem component.
 */
export interface ProjectSidebarItemProps {
  item: ProjectItem;
  depth?: number;
  activeFileId: string | null;
  renamingItem: { id: string; name: string; type: "file" | "folder" } | null;
  dragOverItemId: string | null;
  dragOverIsFolder: boolean;
  dragPosition: "top" | "middle" | "bottom" | null;
  draggedItem: ProjectItem | null;
  onFileSelect: (fileId: string) => void;
  onToggleFolder: (folderId: string) => void;
  onStartRenaming: (item: {
    id: string;
    name: string;
    type: "file" | "folder";
  }) => void;
  onDeleteItem: (itemId: string) => void;
  onDragStart: (e: React.DragEvent, item: ProjectItem) => void;
  onDragOver: (e: React.DragEvent, item: ProjectItem) => void;
  onDragLeave: (e: React.DragEvent) => void;
  onDrop: (e: React.DragEvent, item: ProjectItem) => void;
  onRenameInputChange: (name: string) => void;
  onRenameInputBlur: () => void;
  onRenameInputKeyDown: (e: React.KeyboardEvent) => void;
  getProviderIcon: (provider: StorageProvider) => {
    icon: React.ReactNode;
    color: string;
  };
}

/**
 * Delegates rendering to ProjectSidebarFolderItem or ProjectSidebarFileItem based on item type.
 */
export function ProjectSidebarItem(props: ProjectSidebarItemProps) {
  if (props.item.type === "folder") {
    return (
      <ProjectSidebarFolderItem
        {...props}
        item={props.item}
        renderItem={(item, depth) => (
          <ProjectSidebarItem
            {...props}
            item={item}
            depth={depth}
            key={item.id}
          />
        )}
      />
    );
  }
  return <ProjectSidebarFileItem {...props} item={props.item} />;
}
