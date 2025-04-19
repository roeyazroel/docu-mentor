import { Client, Message, fsTree } from "../types";
import { broadcastToOrganization, getOrgId } from "../utils";

/**
 * Handles folder moving operation
 */
export function handleMoveFolder(ws: Client, msg: Message): void {
  const { oldPath, parentId } = msg;
  const orgId = getOrgId(msg);

  if (
    oldPath &&
    parentId !== undefined &&
    fsTree[orgId] &&
    fsTree[orgId][oldPath]?.type === "folder"
  ) {
    const folderId = oldPath;
    const folder = fsTree[orgId][folderId];
    const oldParentId = folder.parentId;

    // Only proceed if this is actually a move (parent changed)
    if (parentId !== oldParentId) {
      console.log(
        `[move_folder] Moving folder: ${folderId} from parent ${oldParentId} to ${parentId} in org: ${orgId}`
      );

      // Remove from old parent's children array
      if (oldParentId && fsTree[orgId][oldParentId]?.children) {
        fsTree[orgId][oldParentId].children = fsTree[orgId][
          oldParentId
        ].children.filter((id) => id !== folderId);
      }

      // Add to new parent's children array
      if (parentId && fsTree[orgId][parentId]) {
        if (!fsTree[orgId][parentId].children) {
          fsTree[orgId][parentId].children = [];
        }
        fsTree[orgId][parentId].children.push(folderId);
      }

      // Update folder's parentId
      folder.parentId = parentId;

      console.log(
        `[move_folder] Moved folder: ${folderId} in org: ${orgId}`,
        JSON.stringify(fsTree, null, 2)
      );

      // Create move event
      const moveMsg = {
        type: "folder_moved",
        id: folderId,
        name: folder.name,
        oldParentId: oldParentId,
        newParentId: parentId,
        organizationId: orgId,
      };

      // Broadcast to all organization clients including the sender
      broadcastToOrganization(orgId, moveMsg, null);

      // Also send the traditional folder_updated for backward compatibility
      const updateMsg = {
        type: "folder_updated",
        id: folderId,
        name: folder.name,
        parentId: folder.parentId,
        organizationId: orgId,
      };

      // Broadcast update to all organization clients
      broadcastToOrganization(orgId, updateMsg, null);
    } else {
      console.log(
        `[move_folder] No change in parent for folder: ${folderId} in org: ${orgId}`
      );
    }
  } else {
    console.log(
      `[move_folder] Failed to move folder: ${oldPath} in org: ${orgId}`
    );
  }
}
