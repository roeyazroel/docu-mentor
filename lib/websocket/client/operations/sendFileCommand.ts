import { WebSocketManager } from "../WebSocketManager";

/**
 * Sends a file-related command to the backend WebSocket server.
 * @param ws The WebSocket instance or WebSocketManager
 * @param command The command object (must include type and organizationId)
 * @returns True if the command was sent successfully
 */
export function sendFileCommand(
  ws: WebSocket | WebSocketManager,
  command: Record<string, any> & { organizationId: string }
): boolean {
  console.log("[sendFileCommand] Sending:", command); // Debug log

  if (ws instanceof WebSocket) {
    console.log("[sendFileCommand] Using raw WebSocket, state:", ws.readyState);
    if (ws.readyState === WebSocket.OPEN) {
      try {
        ws.send(JSON.stringify(command));
        console.log("[sendFileCommand] Successfully sent via WebSocket");
        return true;
      } catch (err) {
        console.error("[sendFileCommand] Error sending via WebSocket:", err);
        return false;
      }
    }
    console.warn("[sendFileCommand] WebSocket not open, state:", ws.readyState);
    return false;
  } else if (ws) {
    // Using WebSocketManager
    console.log(
      "[sendFileCommand] Using WebSocketManager, connected:",
      ws.isConnected,
      "state:",
      ws.connectionStatus
    );
    const result = ws.send(command);
    console.log("[sendFileCommand] WebSocketManager send result:", result);
    return result;
  } else {
    console.error(
      "[sendFileCommand] No valid WebSocket or WebSocketManager provided"
    );
    return false;
  }
}
