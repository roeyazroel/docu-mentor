import { sendFileCommand } from "@/lib/websocket/client/operations/sendFileCommand";

/**
 * Moves a file to a new parent folder via WebSocket.
 * @param wsManager The WebSocketManager instance
 * @param fileId The ID of the file to move
 * @param newParentId The ID of the new parent folder (or null for root)
 * @param activeOrganization The active organization ID
 */
export function moveFileOperation(
  wsManager: any,
  fileId: string,
  newParentId: string | null,
  activeOrganization: string
) {
  return sendFileCommand(wsManager, {
    type: "move_file",
    oldPath: fileId,
    parentId: newParentId,
    organizationId: activeOrganization,
  });
}
