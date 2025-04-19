import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuSeparator,
  ContextMenuTrigger,
} from "@/components/ui/context-menu";
import { Pencil, Trash2 } from "lucide-react";
import React from "react";

/**
 * Props for ProjectSidebarContextMenu.
 */
export interface ProjectSidebarContextMenuProps {
  children: React.ReactNode;
  itemId: string;
  itemType: "file" | "folder";
  onStartRenaming: (item: {
    id: string;
    name: string;
    type: "file" | "folder";
  }) => void;
  onDeleteItem: (itemId: string) => void;
  itemName: string;
}

/**
 * Context menu for file and folder items with rename and delete options.
 */
export function ProjectSidebarContextMenu({
  children,
  itemId,
  itemType,
  itemName,
  onStartRenaming,
  onDeleteItem,
}: ProjectSidebarContextMenuProps) {
  return (
    <ContextMenu>
      <ContextMenuTrigger asChild>{children}</ContextMenuTrigger>
      <ContextMenuContent className="w-48">
        <ContextMenuItem
          onClick={(e) => {
            e.stopPropagation();
            onStartRenaming({ id: itemId, name: itemName, type: itemType });
          }}
        >
          <Pencil className="mr-2 h-4 w-4" />
          <span>Rename</span>
        </ContextMenuItem>
        <ContextMenuSeparator />
        <ContextMenuItem
          onClick={(e) => {
            e.stopPropagation();
            onDeleteItem(itemId);
          }}
          className="text-destructive focus:text-destructive"
        >
          <Trash2 className="mr-2 h-4 w-4" />
          <span>Delete</span>
        </ContextMenuItem>
      </ContextMenuContent>
    </ContextMenu>
  );
}
