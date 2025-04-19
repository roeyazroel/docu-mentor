import { WebSocketManager } from "../WebSocketManager";

/**
 * Leaves a file editing session.
 * @param ws The WebSocket instance or WebSocketManager
 * @param fileId The file ID to leave
 * @param userId The current user's ID
 * @returns True if the command was sent successfully
 */
export function leaveFileSession(
  ws: WebSocket | WebSocketManager,
  fileId: string,
  userId: string
): boolean {
  const message = {
    type: "leave_file",
    path: fileId,
    userId,
  };

  if (ws instanceof WebSocket) {
    ws.send(JSON.stringify(message));
    return true;
  } else {
    // Using WebSocketManager
    return ws.send(message);
  }
}
