import { sendFileCommand } from "@/lib/websocket/client/operations/sendFileCommand";

/**
 * Creates a new folder in the file system via WebSocket.
 * @param wsManager The WebSocketManager instance
 * @param activeOrganization The active organization ID
 * @param sessionId The current session ID
 * @param name The name of the new folder
 * @param parentId The ID of the parent folder (or null for root)
 */
export function createFolder(
  wsManager: any,
  activeOrganization: string,
  sessionId: string,
  name: string,
  parentId: string | null = null
) {
  sendFileCommand(wsManager, {
    type: "create_folder",
    name,
    parentId,
    organizationId: activeOrganization,
    sessionId: sessionId,
  });
}
