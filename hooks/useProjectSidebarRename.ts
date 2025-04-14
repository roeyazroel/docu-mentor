import { ProjectItem } from "@/components/ProjectSidebar/ProjectSidebarTypes";
import { useState } from "react";

/**
 * Hook for managing renaming state and logic for the project sidebar.
 */
export function useProjectSidebarRename(
  onUpdateItems: (items: ProjectItem[]) => void,
  items: ProjectItem[]
) {
  // State for the item being renamed
  const [renamingItem, setRenamingItem] = useState<{
    id: string;
    name: string;
    type: "file" | "folder";
  } | null>(null);

  /**
   * Start renaming an item.
   */
  function startRenaming(item: {
    id: string;
    name: string;
    type: "file" | "folder";
  }) {
    setRenamingItem(item);
  }

  /**
   * Update the name while renaming.
   */
  function updateRenamingName(name: string) {
    if (renamingItem) {
      setRenamingItem({ ...renamingItem, name });
    }
  }

  /**
   * Complete the rename operation.
   */
  function completeRename() {
    if (!renamingItem || !renamingItem.name.trim()) {
      setRenamingItem(null);
      return;
    }
    const renameItemInTree = (items: ProjectItem[]): ProjectItem[] => {
      return items.map((item) => {
        if (item.id === renamingItem.id) {
          return { ...item, name: renamingItem.name };
        } else if (item.type === "folder") {
          return { ...item, children: renameItemInTree(item.children) };
        }
        return item;
      });
    };
    onUpdateItems(renameItemInTree(items));
    setRenamingItem(null);
  }

  /**
   * Cancel renaming.
   */
  function cancelRename() {
    setRenamingItem(null);
  }

  return {
    renamingItem,
    setRenamingItem,
    startRenaming,
    updateRenamingName,
    completeRename,
    cancelRename,
  };
}
