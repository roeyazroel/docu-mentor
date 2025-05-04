import {
  getNodeById,
  getNodePath,
  logFileAccess,
  updateNode,
} from "../database";
import { Client, Message, fsTree } from "../types";
import { broadcast, broadcastToOrganization, getOrgId } from "../utils";

/**
 * Core file moving logic that can be used with or without WebSockets
 */
export async function moveFile(
  fileId: string,
  newParentId: string | null,
  organizationId: string,
  userId: string
): Promise<{ success: boolean; fileData: any }> {
  if (!fileId) {
    console.log(`[move_file] Missing file ID in org: ${organizationId}`);
    return { success: false, fileData: null };
  }

  if (newParentId === undefined) {
    console.log(
      `[move_file] Missing parentId for file: ${fileId} in org: ${organizationId}`
    );
    return { success: false, fileData: null };
  }

  try {
    // Get file from database
    const fileNode = await getNodeById(fileId);

    if (fileNode && fileNode.type === "file") {
      const oldParentId = fileNode.parent_id;

      // Only proceed if this is actually a move (parent changed)
      if (newParentId !== oldParentId) {
        console.log(
          `[move_file] Moving file: ${fileId} from parent ${oldParentId} to ${newParentId} in org: ${organizationId}`
        );

        // Generate new path based on parent
        let newPath = "";
        if (newParentId) {
          // If has parent, get parent path and append
          const parentNode = await getNodeById(newParentId);
          if (parentNode) {
            const parentPath = await getNodePath(newParentId);
            newPath = `${parentPath}/${fileNode.name}`;
          } else {
            console.log(`[move_file] Parent node ${newParentId} not found`);
            return { success: false, fileData: null };
          }
        } else {
          // If moving to root
          newPath = `/${fileNode.name}`;
        }

        // Update node in database
        const updatedNode = await updateNode(fileId, {
          parent_id: newParentId === null ? undefined : newParentId,
          path: newPath,
        });

        if (updatedNode) {
          // Log access
          await logFileAccess(fileId, userId, "move");

          // For backward compatibility with in-memory system
          if (fsTree[organizationId] && fsTree[organizationId][fileId]) {
            const file = fsTree[organizationId][fileId];

            // Remove from old parent's children array
            if (oldParentId && fsTree[organizationId][oldParentId]?.children) {
              fsTree[organizationId][oldParentId].children = fsTree[
                organizationId
              ][oldParentId].children.filter((id) => id !== fileId);
            }

            // Add to new parent's children array
            if (newParentId && fsTree[organizationId][newParentId]) {
              if (!fsTree[organizationId][newParentId].children) {
                fsTree[organizationId][newParentId].children = [];
              }
              fsTree[organizationId][newParentId].children.push(fileId);
            }

            // Update file's parentId
            file.parentId = newParentId;
          }

          return {
            success: true,
            fileData: {
              id: fileId,
              name: fileNode.name,
              oldParentId,
              newParentId,
            },
          };
        } else {
          console.log(
            `[move_file] Failed to update file in database: ${fileId}`
          );
          return { success: false, fileData: null };
        }
      } else {
        console.log(
          `[move_file] No change in parent for file: ${fileId} in org: ${organizationId}`
        );
        return { success: false, fileData: null };
      }
    } else if (
      fsTree[organizationId] &&
      fsTree[organizationId][fileId]?.type === "file"
    ) {
      // Fallback to in-memory
      console.log(
        `[move_file] File not in database, using in-memory: ${fileId}`
      );
      const file = fsTree[organizationId][fileId];
      const oldParentId = file.parentId;

      // Only proceed if this is actually a move (parent changed)
      if (newParentId !== oldParentId) {
        // Remove from old parent's children array
        if (oldParentId && fsTree[organizationId][oldParentId]?.children) {
          fsTree[organizationId][oldParentId].children = fsTree[organizationId][
            oldParentId
          ].children.filter((id) => id !== fileId);
        }

        // Add to new parent's children array
        if (newParentId && fsTree[organizationId][newParentId]) {
          if (!fsTree[organizationId][newParentId].children) {
            fsTree[organizationId][newParentId].children = [];
          }
          fsTree[organizationId][newParentId].children.push(fileId);
        }

        // Update file's parentId
        file.parentId = newParentId;

        return {
          success: true,
          fileData: {
            id: fileId,
            name: file.name,
            oldParentId,
            newParentId,
          },
        };
      } else {
        console.log(
          `[move_file] No change in parent for file: ${fileId} in org: ${organizationId}`
        );
        return { success: false, fileData: null };
      }
    } else {
      console.log(
        `[move_file] Failed to move file: ${fileId} in org: ${organizationId}`
      );
      return { success: false, fileData: null };
    }
  } catch (error) {
    console.error(`[move_file] Error moving file: ${fileId}`, error);
    return { success: false, fileData: null };
  }
}

/**
 * Handles file moving operation via WebSocket
 */
export async function handleMoveFile(ws: Client, msg: Message): Promise<void> {
  const { oldPath, parentId } = msg;
  const orgId = getOrgId(msg);
  const userId = ws.userId || "anonymous";

  if (!oldPath || parentId === undefined) {
    console.log(`[move_file] Missing required parameters in org: ${orgId}`);
    return;
  }

  const result = await moveFile(oldPath, parentId, orgId, userId);

  if (result.success && result.fileData) {
    const { id: fileId, name, oldParentId, newParentId } = result.fileData;

    // Create move event
    const moveMsg = {
      type: "file_moved",
      id: fileId,
      name: name,
      oldParentId: oldParentId,
      newParentId: newParentId,
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
      name: name,
      parentId: newParentId,
      organizationId: orgId,
      lastUpdated: new Date().toISOString(),
    };

    // Broadcast update to all organization clients
    broadcastToOrganization(orgId, updateMsg, null);
  }
}
