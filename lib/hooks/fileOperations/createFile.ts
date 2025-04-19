import { sendFileCommand } from "@/lib/websocket/client/operations/sendFileCommand";

/**
 * Creates a new file in the file system via WebSocket.
 * @param wsManager The WebSocketManager instance
 * @param activeOrganization The active organization ID
 * @param sessionId The current session ID
 * @param name The name of the new file
 * @param parentId The ID of the parent folder (or null for root)
 * @param content The initial content of the file (default: empty string)
 */
export function createFile(
  wsManager: any,
  activeOrganization: string,
  sessionId: string,
  name: string,
  parentId: string | null = null,
  content: string = ""
) {
  sendFileCommand(wsManager, {
    type: "create_file",
    name,
    parentId,
    content,
    organizationId: activeOrganization,
    sessionId: sessionId,
  });
}
