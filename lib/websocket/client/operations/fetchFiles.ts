import { WebSocketManager } from "../WebSocketManager";
import type { FilesList } from "../websocketService";

/**
 * Fetches all files for a given organization via WebSocket.
 * @param ws The WebSocket instance or WebSocketManager
 * @param organizationId The organization ID
 * @returns Promise resolving to the files list
 */
export function fetchFiles(
  ws: WebSocket | WebSocketManager,
  organizationId: string
): Promise<FilesList> {
  return new Promise((resolve, reject) => {
    const handleMessage = (event: MessageEvent) => {
      try {
        const data = JSON.parse(event.data);
        if (
          data.type === "files_list" &&
          data.organizationId === organizationId
        ) {
          if (ws instanceof WebSocket) {
            ws.removeEventListener("message", handleMessage);
          }
          resolve(data.files);
        }
      } catch (err) {
        // Ignore parse errors for unrelated messages
      }
    };

    if (ws instanceof WebSocket) {
      ws.addEventListener("message", handleMessage);
      ws.send(JSON.stringify({ type: "get_files", organizationId }));
    } else {
      // Using WebSocketManager
      const origHandler = ws["messageHandler"];
      ws["messageHandler"] = (event: MessageEvent) => {
        handleMessage(event);
        origHandler(event);
      };
      ws.send({ type: "get_files", organizationId });
    }

    // Optionally add a timeout for safety
    setTimeout(() => {
      if (ws instanceof WebSocket) {
        ws.removeEventListener("message", handleMessage);
      }
      reject(new Error("Timeout fetching files"));
    }, 5000);
  });
}
