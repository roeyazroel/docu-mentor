import { StorageProvider } from "@/components/ProjectSidebar/ProjectSidebarTypes";
import { useState } from "react";

/**
 * Hook for managing dialog state and logic for the project sidebar (new file/folder, provider connection).
 */
export function useProjectSidebarDialogs() {
  // State for new item dialog
  const [newItemDialogOpen, setNewItemDialogOpen] = useState(false);
  const [newItemType, setNewItemType] = useState<"file" | "folder">("file");
  const [newItemName, setNewItemName] = useState("");
  const [newItemParentId, setNewItemParentId] = useState<string | null>(null);

  // State for provider connection dialog
  const [connectDialogOpen, setConnectDialogOpen] = useState(false);
  const [connectingProvider, setConnectingProvider] =
    useState<StorageProvider | null>(null);

  /**
   * Open dialog to create a new file or folder.
   */
  function openNewItemDialog(
    type: "file" | "folder",
    parentId: string | null = null
  ) {
    setNewItemType(type);
    setNewItemName("");
    setNewItemParentId(parentId);
    setNewItemDialogOpen(true);
  }

  /**
   * Open dialog to connect to a provider.
   */
  function openConnectDialog(provider: StorageProvider) {
    setConnectingProvider(provider);
    setConnectDialogOpen(true);
  }

  return {
    // New item dialog state and handlers
    newItemDialogOpen,
    setNewItemDialogOpen,
    newItemType,
    setNewItemType,
    newItemName,
    setNewItemName,
    newItemParentId,
    setNewItemParentId,
    openNewItemDialog,
    // Provider connection dialog state and handlers
    connectDialogOpen,
    setConnectDialogOpen,
    connectingProvider,
    setConnectingProvider,
    openConnectDialog,
  };
}
