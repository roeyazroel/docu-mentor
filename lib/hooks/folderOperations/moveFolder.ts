import { sendFileCommand } from "@/lib/websocket/client/operations/sendFileCommand";

/**
 * Moves a folder to a new parent folder via WebSocket.
 * @param wsManager The WebSocketManager instance
 * @param folderId The ID of the folder to move
 * @param newParentId The ID of the new parent folder (or null for root)
 * @param activeOrganization The active organization ID
 */
export function moveFolder(
  wsManager: any,
  folderId: string,
  newParentId: string | null,
  activeOrganization: string
) {
  return sendFileCommand(wsManager, {
    type: "move_folder",
    oldPath: folderId,
    parentId: newParentId,
    organizationId: activeOrganization,
  });
}
