import {
  getNodeById,
  getNodePath,
  logFileAccess,
  updateNode,
} from "../database";
import { Client, Message, fsTree } from "../types";
import { broadcast, broadcastToOrganization, getOrgId } from "../utils";

/**
 * Handles file moving operation
 */
export async function handleMoveFile(ws: Client, msg: Message): Promise<void> {
  const { oldPath, parentId } = msg;
  const orgId = getOrgId(msg);
  const userId = ws.userId || "anonymous";

  // Guard against undefined values
  if (!oldPath) {
    console.log(`[move_file] Missing file ID in org: ${orgId}`);
    return;
  }

  if (parentId === undefined) {
    console.log(
      `[move_file] Missing parentId for file: ${oldPath} in org: ${orgId}`
    );
    return;
  }

  try {
    // Get file from database
    const fileNode = await getNodeById(oldPath);
    const fileId = oldPath;

    if (fileNode && fileNode.type === "file") {
      const oldParentId = fileNode.parent_id;

      // Only proceed if this is actually a move (parent changed)
      if (parentId !== oldParentId) {
        console.log(
          `[move_file] Moving file: ${fileId} from parent ${oldParentId} to ${parentId} in org: ${orgId}`
        );

        // Generate new path based on parent
        let newPath = "";
        if (parentId) {
          // If has parent, get parent path and append
          const parentNode = await getNodeById(parentId);
          if (parentNode) {
            const parentPath = await getNodePath(parentId);
            newPath = `${parentPath}/${fileNode.name}`;
          } else {
            console.log(`[move_file] Parent node ${parentId} not found`);
            return;
          }
        } else {
          // If moving to root
          newPath = `/${fileNode.name}`;
        }

        // Update node in database
        const updatedNode = await updateNode(fileId, {
          parent_id: parentId === null ? undefined : parentId,
          path: newPath,
        });

        if (updatedNode) {
          // Log access
          await logFileAccess(fileId, userId, "move");

          // For backward compatibility with in-memory system
          if (fsTree[orgId] && fsTree[orgId][fileId]) {
            const file = fsTree[orgId][fileId];

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
          }

          // Create move event
          const moveMsg = {
            type: "file_moved",
            id: fileId,
            name: fileNode.name,
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
            name: fileNode.name,
            parentId: parentId,
            organizationId: orgId,
            lastUpdated: new Date().toISOString(),
          };

          // Broadcast update to all organization clients
          broadcastToOrganization(orgId, updateMsg, null);
        } else {
          console.log(
            `[move_file] Failed to update file in database: ${fileId}`
          );
        }
      } else {
        console.log(
          `[move_file] No change in parent for file: ${fileId} in org: ${orgId}`
        );
      }
    } else if (fsTree[orgId] && fsTree[orgId][oldPath]?.type === "file") {
      // Fallback to in-memory
      console.log(
        `[move_file] File not in database, using in-memory: ${fileId}`
      );
      const file = fsTree[orgId][fileId];
      const oldParentId = file.parentId;

      // Only proceed if this is actually a move (parent changed)
      if (parentId !== oldParentId) {
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
      console.log(
        `[move_file] Failed to move file: ${oldPath} in org: ${orgId}`
      );
    }
  } catch (error) {
    console.error(`[move_file] Error moving file: ${oldPath}`, error);
  }
}
