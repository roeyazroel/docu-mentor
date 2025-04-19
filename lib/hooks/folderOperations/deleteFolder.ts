import { sendFileCommand } from "@/lib/websocket/client/operations/sendFileCommand";

/**
 * Deletes a folder in the file system via WebSocket.
 * @param wsManager The WebSocketManager instance
 * @param activeOrganization The active organization ID
 * @param sessionId The current session ID
 * @param folderId The ID of the folder to delete
 */
export function deleteFolder(
  wsManager: any,
  activeOrganization: string,
  sessionId: string,
  folderId: string
) {
  sendFileCommand(wsManager, {
    type: "delete_folder",
    path: folderId,
    organizationId: activeOrganization,
    sessionId: sessionId,
  });
}
