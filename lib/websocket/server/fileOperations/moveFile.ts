import { Client, Message, fsTree } from "../types";
import { broadcast, broadcastToOrganization, getOrgId } from "../utils";

/**
 * Handles file moving operation
 */
export function handleMoveFile(ws: Client, msg: Message): void {
  const { oldPath, parentId } = msg;
  const orgId = getOrgId(msg);

  if (
    oldPath &&
    parentId !== undefined &&
    fsTree[orgId] &&
    fsTree[orgId][oldPath]?.type === "file"
  ) {
    const fileId = oldPath;
    const file = fsTree[orgId][fileId];
    const oldParentId = file.parentId;

    // Only proceed if this is actually a move (parent changed)
    if (parentId !== oldParentId) {
      console.log(
        `[move_file] Moving file: ${fileId} from parent ${oldParentId} to ${parentId} in org: ${orgId}`
      );

      // Remove from old parent's children array
      if (oldParentId && fsTree[orgId][oldParentId]?.children) {
        fsTree[orgId][oldParentId].children = fsTree[orgId][
          oldParentId
        ].children.filter((id) => id !== fileId);
      }

      // Add to new parent's children array
      if (parentId && fsTree[orgId][parentId]) {
        if (!fsTree[orgId][parentId].children) {
          fsTree[orgId][parentId].children = [];
        }
        fsTree[orgId][parentId].children.push(fileId);
      }

      // Update file's parentId
      file.parentId = parentId;

      console.log(
        `[move_file] Moved file: ${fileId} in org: ${orgId}`,
        JSON.stringify(fsTree, null, 2)
      );

      // Create move event
      const moveMsg = {
        type: "file_moved",
        id: fileId,
        name: file.name,
        oldParentId: oldParentId,
        newParentId: parentId,
        organizationId: orgId,
        lastUpdated: new Date().toISOString(),
      };

      // Broadcast to specific file room if anyone is viewing it
      broadcast(fileId, moveMsg, null);

      // Broadcast to all organization clients including the sender
      broadcastToOrganization(orgId, moveMsg, null);

      // Also send the traditional file_updated for backward compatibility
      const updateMsg = {
        type: "file_updated",
        id: fileId,
        name: file.name,
        parentId: file.parentId,
        organizationId: orgId,
        lastUpdated: new Date().toISOString(),
      };

      // Broadcast update to all organization clients
      broadcastToOrganization(orgId, updateMsg, null);
    } else {
      console.log(
        `[move_file] No change in parent for file: ${fileId} in org: ${orgId}`
      );
    }
  } else {
    console.log(`[move_file] Failed to move file: ${oldPath} in org: ${orgId}`);
  }
}
