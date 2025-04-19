import { ProjectItem } from "@/components/ProjectSidebar/ProjectSidebarTypes";
import { useEditorContext } from "@/context/EditorContext";
import { renameFileOperation } from "@/lib/hooks/fileOperations/renameFile";
import { renameFolderOperation } from "@/lib/hooks/folderOperations/renameFolder";
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
  const [oldName, setOldName] = useState<string | null>(null);

  // Error state for rename operations
  const [renameError, setRenameError] = useState<string | null>(null);

  // Get organization ID from context
  const { activeOrganization } = useEditorContext();

  /**
   * Start renaming an item.
   */
  function startRenaming(item: {
    id: string;
    name: string;
    type: "file" | "folder";
  }) {
    setRenamingItem(item);
    setOldName(item.name);
    setRenameError(null);
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
  function completeRename(websocketManager: any) {
    console.log(
      "completeRename called with websocketManager:",
      websocketManager
    );

    if (!renamingItem) {
      console.log("No renaming item, returning early");
      return;
    }

    const newName = renamingItem.name.trim();
    console.log(
      "Attempting to rename:",
      renamingItem.id,
      "from type:",
      renamingItem.type,
      "to name:",
      newName
    );

    // Validate that name is not empty
    if (!newName) {
      console.log("Empty name, setting error");
      setRenameError("Name cannot be empty");
      return;
    }

    // If no change in name, just cancel the operation
    if (oldName === newName) {
      console.log("No change in name, canceling rename");
      cancelRename();
      return;
    }

    if (websocketManager && activeOrganization) {
      console.log("Using websocketManager to rename, org:", activeOrganization);
      // Send rename command via WebSocket
      if (renamingItem.type === "file") {
        console.log("Calling renameFileOperation");
        renameFileOperation(
          websocketManager,
          renamingItem.id,
          newName,
          activeOrganization
        );
      } else if (renamingItem.type === "folder") {
        console.log("Calling renameFolderOperation");
        renameFolderOperation(
          websocketManager,
          renamingItem.id,
          newName,
          activeOrganization
        );
      }
    } else {
      console.log(
        "No websocketManager or activeOrganization, using local fallback"
      );
      // Fallback for local rename (no websocket)
      updateLocalItem(renamingItem.id, newName);
    }

    console.log("Clearing rename state");
    // Clear renaming state
    setRenamingItem(null);
    setRenameError(null);
  }

  /**
   * Update item name locally in the tree
   */
  function updateLocalItem(itemId: string, newName: string) {
    const updateItems = (items: ProjectItem[]): ProjectItem[] => {
      return items.map((item) => {
        if (item.id === itemId) {
          return { ...item, name: newName };
        } else if (item.type === "folder") {
          return {
            ...item,
            children: updateItems(item.children),
          };
        }
        return item;
      });
    };

    onUpdateItems(updateItems(items));
  }

  /**
   * Cancel renaming.
   */
  function cancelRename() {
    setRenamingItem(null);
    setRenameError(null);
  }

  return {
    renamingItem,
    renameError,
    startRenaming,
    updateRenamingName,
    completeRename,
    cancelRename,
  };
}
