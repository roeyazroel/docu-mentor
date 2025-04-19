import { sendFileCommand } from "@/lib/websocket/client/operations/sendFileCommand";

/**
 * Renames a folder in the file system via WebSocket.
 * @param wsManager The WebSocketManager instance
 * @param folderId The ID of the folder to rename
 * @param newName The new name for the folder
 * @param activeOrganization The active organization ID
 */
export function renameFolderOperation(
  wsManager: any,
  folderId: string,
  newName: string,
  activeOrganization: string
) {
  console.log("[renameFolderOperation] Called with:", {
    folderId,
    newName,
    activeOrganization,
  });

  const message = {
    type: "rename_folder",
    oldPath: folderId,
    name: newName,
    organizationId: activeOrganization,
  };

  console.log("[renameFolderOperation] Sending message:", message);

  return sendFileCommand(wsManager, message);
}
