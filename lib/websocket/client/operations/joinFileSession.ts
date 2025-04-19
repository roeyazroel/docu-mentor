import { WebSocketManager } from "../WebSocketManager";

/**
 * Joins a file editing session.
 * @param ws The WebSocket instance or WebSocketManager
 * @param fileId The file ID to join
 * @param userId The current user's ID
 * @param userName The current user's name
 * @param avatar The current user's avatar URL
 * @param sessionId The session ID
 * @returns True if the command was sent successfully
 */
export function joinFileSession(
  ws: WebSocket | WebSocketManager,
  fileId: string,
  userId: string,
  userName: string = "You",
  avatar: string = "",
  sessionId: string
): boolean {
  const message = {
    type: "join_file",
    path: fileId,
    userId,
    userName,
    avatar,
    sessionId,
  };

  if (ws instanceof WebSocket) {
    ws.send(JSON.stringify(message));
    return true;
  } else {
    // Using WebSocketManager
    return ws.send(message);
  }
}
