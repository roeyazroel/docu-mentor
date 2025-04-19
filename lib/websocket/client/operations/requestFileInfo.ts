import { WebSocketManager } from "../WebSocketManager";

/**
 * Requests full file information from the server when a partial update is received
 * but the file is not found in the local cache. This helps recover from state inconsistencies.
 * @param ws The WebSocket instance or WebSocketManager
 * @param fileId The file ID to request
 * @param organizationId The organization ID
 * @returns True if the command was sent successfully
 */
export function requestFileInfo(
  ws: WebSocket | WebSocketManager,
  fileId: string,
  organizationId: string
): boolean {
  const message = {
    type: "get_file_info",
    path: fileId,
    organizationId,
  };

  if (ws instanceof WebSocket) {
    ws.send(JSON.stringify(message));
    return true;
  } else {
    // Using WebSocketManager
    return ws.send(message);
  }
}
