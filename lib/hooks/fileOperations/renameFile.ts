import { sendFileCommand } from "@/lib/websocket/client/operations/sendFileCommand";

/**
 * Renames a file in the file system via WebSocket.
 * @param wsManager The WebSocketManager instance
 * @param fileId The ID of the file to rename
 * @param newName The new name for the file
 * @param activeOrganization The active organization ID
 */
export function renameFileOperation(
  wsManager: any,
  fileId: string,
  newName: string,
  activeOrganization: string
) {
  console.log("[renameFileOperation] Called with:", {
    fileId,
    newName,
    activeOrganization,
  });

  const message = {
    type: "rename_file",
    oldPath: fileId,
    name: newName,
    organizationId: activeOrganization,
  };

  console.log("[renameFileOperation] Sending message:", message);

  return sendFileCommand(wsManager, message);
}
