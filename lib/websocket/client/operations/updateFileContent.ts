import { WebSocketManager } from "../WebSocketManager";
import { sendFileCommand } from "./sendFileCommand";

/**
 * Updates a file's content through WebSocket.
 * @param ws The WebSocket instance or WebSocketManager
 * @param fileId The file ID
 * @param content The new content
 * @param organizationId The organization ID
 * @param sessionId The client session ID
 * @param userId Optional user ID
 * @returns True if the command was sent successfully
 */
export function updateFileContent(
  ws: WebSocket | WebSocketManager,
  fileId: string,
  content: string,
  organizationId: string,
  sessionId: string,
  userId?: string
): boolean {
  return sendFileCommand(ws, {
    type: "update_file",
    path: fileId,
    content,
    organizationId,
    sessionId,
    userId,
  });
}
