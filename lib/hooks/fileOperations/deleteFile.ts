import { sendFileCommand } from "@/lib/websocket/client/operations/sendFileCommand";

/**
 * Deletes a file in the file system via WebSocket.
 * @param wsManager The WebSocketManager instance
 * @param activeOrganization The active organization ID
 * @param sessionId The current session ID
 * @param fileId The ID of the file to delete
 */
export function deleteFile(
  wsManager: any,
  activeOrganization: string,
  sessionId: string,
  fileId: string
) {
  sendFileCommand(wsManager, {
    type: "delete_file",
    path: fileId,
    organizationId: activeOrganization,
    sessionId: sessionId,
  });
}
